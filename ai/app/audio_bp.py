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
from flask import make_response
from werkzeug.utils import secure_filename
from datetime import datetime
from app.report_generation import process_audio

# Configure upload settings
UPLOAD_FOLDER = 'uploads'
ALLOWED_EXTENSIONS = {'wav'}
MAX_CONTENT_LENGTH = 16 * 1024 * 1024  # 16MB max file size

# Create upload folder if it doesn't exist
os.makedirs(UPLOAD_FOLDER, exist_ok=True)

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

def allowed_file(filename):
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

@audio_bp.route('/process_audio', methods=['POST'])
def analyze_voice():
    try:
        if 'audio' not in request.files:
            return jsonify({'error': 'No audio file provided'}), 400
        
        file = request.files['audio']
        
        if file.filename == '':
            return jsonify({'error': 'No selected file'}), 400  
            
        if not allowed_file(file.filename):
            return jsonify({'error': 'File type not allowed'}), 400
        
        filename = secure_filename(file.filename)
        timestamp = datetime.now().strftime('%Y%m%d_%H%M%S')
        unique_filename = f"{timestamp}_{filename}"
        filepath = os.path.join(UPLOAD_FOLDER, unique_filename)
        file.save(filepath)
        
        try:
            json_report = process_audio(filepath)
            report_data = json.loads(json_report)

            pdf_path = 'medical_report.pdf'
            if not os.path.exists(pdf_path):
                return jsonify({'error': 'PDF report not generated'}), 500

            cloudinary_response = cloudinary.uploader.upload(pdf_path, resource_type="raw")
            pdf_url = cloudinary_response.get("secure_url")
            if not pdf_url:
                return jsonify({'error': 'Failed to upload PDF to Cloudinary'}), 500

            # ✅ Modify JSON structure to match the required format
            formatted_report = {
                "Acoustic Features": {
                    "Jitter_Percent": report_data["acoustic_analysis"]["voice_perturbation"]["jitter"]["value"],
                    "MFCC_Mean": report_data["mfcc_features"]["mean"],
                    "MFCC_Std": report_data["mfcc_features"]["std"],
                    "Shimmer_Percent": report_data["acoustic_analysis"]["voice_perturbation"]["shimmer"]["value"]
                },
                "Analysis Date": datetime.now().strftime("%Y-%m-%d"),
                "Confidence Scores": {
                    "Healthy": report_data["diagnosis"]["confidence_scores"]["Healthy"],
                    "Laryngitis": report_data["diagnosis"]["confidence_scores"]["Laryngitis"],
                    "Vocal Polyp": report_data["diagnosis"]["confidence_scores"]["Vocal Polyp"]
                },
                "Findings": report_data["detailed_report"],
                "PDF_URL": pdf_url,
                "Prediction": report_data["diagnosis"]["predicted_condition"]
            }

            response = make_response(json.dumps(formatted_report, indent=4))
            response.content_type = 'application/json'
            
            return response
            
        except Exception as e:
            return jsonify({'error': f'Error processing audio: {str(e)}'}), 500
        
        finally:
            if os.path.exists(filepath):
                os.remove(filepath)
            if os.path.exists(pdf_path):
                os.remove(pdf_path)
            if os.path.exists("medical_report.json"):
                os.remove("medical_report.json")
            
    except Exception as e:
        return jsonify({'error': f'Server error: {str(e)}'}), 500

# ✅ Error handler for file too large
@audio_bp.errorhandler(413)
def too_large(e):
    return jsonify({'error': 'File is too large'}), 413