import os
import numpy as np
import tensorflow as tf
from flask import Blueprint, request, jsonify, send_file
from typing import List, Dict
import tensorflow as tf
import tensorflow_hub as hub
import librosa
from app import client, model
from datetime import datetime
import json
from fpdf import FPDF
import cloudinary.uploader

CHATBOT_SYSTEM_PROMPT = {
    "role": "system",
    "content": (
        "You are AudiBuddy, an AI expert in voice and vocal health. You provide professional advice "
        "on vocal health, vocal exercises, speech disorders, and voice-related medical conditions. "
        "You do NOT respond to unrelated topics. If asked about anything outside your expertise, politely "
        "refuse to answer and redirect the user to vocal health topics. "
        "Always maintain context of the previous conversation to provide more relevant and personalized responses."
    )
}

label_mapping = {
    0: "Healthy",
    1: "Laryngitis",
    2: "Vocal Polyp"
}

vggish_model_url = "https://tfhub.dev/google/vggish/1"
vggish_model = hub.load(vggish_model_url)

audio_bp = Blueprint("audio", __name__)

conversation_history: List[Dict[str, str]] = [CHATBOT_SYSTEM_PROMPT]
MAX_HISTORY = 10

def trim_conversation_history():
    """Maintain conversation history within limits while preserving context."""
    global conversation_history
    if len(conversation_history) > (MAX_HISTORY * 2 + 1):  # +1 for system prompt
        conversation_history = [CHATBOT_SYSTEM_PROMPT, *conversation_history[-(MAX_HISTORY * 2):]]

def get_response(user_input: str) -> str:
    """Get AI response while maintaining conversation context."""
    global conversation_history
    conversation_history.append({"role": "user", "content": user_input})
    trim_conversation_history()

    completion = client.chat.completions.create(
        model="mixtral-8x7b-32768",
        messages=conversation_history,
        temperature=1,
        max_completion_tokens=1024,
        top_p=1,
        stream=False,
        stop=None,
    )

    response_text = completion.choices[0].message.content
    conversation_history.append({"role": "assistant", "content": response_text})
    return response_text

@audio_bp.route("/chat", methods=["POST"])
def chat():
    """Flask route to handle chatbot conversation."""
    data = request.json
    user_input = data.get("message", "").strip()

    if not user_input:
        return jsonify({"error": "Message cannot be empty"}), 400

    response_text = get_response(user_input)
    return jsonify({"response": response_text})


def extract_audio_features(file_path, max_length=128):
    """Extract VGGish embeddings from the audio file."""
    audio = tf.io.read_file(file_path)
    waveform, sample_rate = tf.audio.decode_wav(audio, desired_channels=1)
    waveform = tf.squeeze(waveform, axis=-1)
    waveform = tf.cast(waveform, tf.float32)
    embeddings = vggish_model(waveform)

    if embeddings.shape[0] < max_length:
        pad_width = max_length - embeddings.shape[0]
        embeddings = tf.pad(embeddings, [[0, pad_width], [0, 0]])
    elif embeddings.shape[0] > max_length:
        embeddings = embeddings[:max_length, :]

    return embeddings.numpy()

def extract_advanced_features(audio_path):
    """Extract additional acoustic features for analysis."""
    y, sr = librosa.load(audio_path, sr=16000)

    # MFCC features
    mfcc = librosa.feature.mfcc(y=y, sr=sr, n_mfcc=13)
    mfcc_mean = mfcc.mean(axis=1)
    mfcc_std = mfcc.std(axis=1)

    # Voice perturbation measures
    jitter = np.std(librosa.feature.zero_crossing_rate(y)) * 100
    shimmer = np.std(librosa.feature.rms(y=y)) * 100  # FIXED

    return {
        "MFCC_Mean": mfcc_mean.tolist(),
        "MFCC_Std": mfcc_std.tolist(),
        "Jitter_Percent": jitter,
        "Shimmer_Percent": shimmer
    }

def generate_medical_report(features, prediction, probabilities):
    """Generate a detailed medical report using Groq AI."""
    prompt = f"""
    Generate a professional voice pathology report:

    Predicted Condition: {prediction} ({probabilities[prediction]})
    
    Acoustic Analysis:
    - Jitter: {features['Jitter_Percent']:.2f}%
    - Shimmer: {features['Shimmer_Percent']:.2f}%
    
    Clinical Findings:
    - Explain the significance of the acoustic measurements.
    - Provide recommendations for treatment or follow-up.

    Format: Use professional medical formatting.
    """

    completion = client.chat.completions.create(
        model="deepseek-r1-distill-llama-70b",
        messages=[{"role": "user", "content": prompt}],
        temperature=0.6,
        max_tokens=4096,
    )

    return completion.choices[0].message.content

def create_pdf_report(prediction, probabilities, report_text, features, output_pdf):
    """Generate a PDF report containing the medical findings."""
    pdf = FPDF()
    pdf.set_auto_page_break(auto=True, margin=15)
    pdf.add_page()

    pdf.set_font("Arial", "B", 16)
    pdf.cell(200, 10, "Voice Pathology Medical Report", ln=True, align="C")
    pdf.ln(10)

    pdf.set_font("Arial", size=12)
    pdf.multi_cell(0, 10, f"Prediction: {prediction}\n\nFindings: {report_text}")

    # Acoustic Measurements Section
    pdf.ln(5)
    pdf.set_font("Arial", "B", 12)
    pdf.cell(200, 10, "Acoustic Measurements", ln=True)
    pdf.set_font("Arial", size=12)
    pdf.multi_cell(0, 10, f"Jitter: {features['Jitter_Percent']:.2f}%\nShimmer: {features['Shimmer_Percent']:.2f}%")

    pdf.output(output_pdf)

def upload_to_cloudinary(file_path):
    """Uploads the generated PDF report to Cloudinary."""
    response = cloudinary.uploader.upload(file_path, resource_type="raw")
    return response.get("secure_url")

@audio_bp.route("/process_audio", methods=["POST"])
def process_audio():
    """Flask route to process audio and return JSON with Cloudinary PDF URL."""
    if "audio" not in request.files:
        return jsonify({"error": "No audio file provided"}), 400

    audio_file = request.files["audio"]
    if not audio_file.filename.endswith(".wav"):
        return jsonify({"error": "Invalid file format. Please upload a .wav file"}), 400

    # Save the uploaded file
    temp_audio_path = "uploads/temp_audio.wav"
    os.makedirs("uploads", exist_ok=True)
    audio_file.save(temp_audio_path)

    # Extract features
    vggish_features = extract_audio_features(temp_audio_path)
    acoustic_features = extract_advanced_features(temp_audio_path)

    vggish_features = np.expand_dims(vggish_features, axis=0)

    # Perform prediction
    prediction = model.predict(vggish_features)
    predicted_class = np.argmax(prediction, axis=1)[0]
    predicted_class_label = label_mapping[predicted_class]

    # Get confidence scores
    probabilities = {label_mapping[i]: f"{prob * 100:.2f}%" for i, prob in enumerate(prediction[0])}
    probabilities_sorted = dict(sorted(probabilities.items(), key=lambda item: float(item[1].rstrip("%")), reverse=True))

    # Generate medical report
    report_text = generate_medical_report(acoustic_features, predicted_class_label, probabilities_sorted)

    # Generate PDF report
    output_pdf = "uploads/medical_report.pdf"
    create_pdf_report(predicted_class_label, probabilities_sorted, report_text, acoustic_features, output_pdf)

    # Upload PDF to Cloudinary
    pdf_url = upload_to_cloudinary(output_pdf)

    # Generate JSON report
    json_data = {
        "Prediction": predicted_class_label,
        "Confidence Scores": probabilities_sorted,
        "Findings": report_text,
        "Acoustic Features": acoustic_features,
        "Analysis Date": datetime.now().strftime("%Y-%m-%d"),
        "PDF_URL": pdf_url
    }

    # Delete temporary files
    os.remove(temp_audio_path)
    os.remove(output_pdf)

    return jsonify(json_data)