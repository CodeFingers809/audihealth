import os
import numpy as np
import tensorflow as tf
import tensorflow_hub as hub
import librosa.display
import matplotlib.pyplot as plt
from tensorflow.keras.models import load_model
import librosa
from fpdf import FPDF
from groq import Groq
import re
import json
from datetime import datetime
from app import client, model

label_mapping = {
    0: "Healthy",
    1: "Laryngitis",
    2: "Vocal Polyp"
}

vggish_model_url = "https://tfhub.dev/google/vggish/1"
vggish_model = hub.load(vggish_model_url)

def extract_audio_features(file_path, max_length=128):
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
    y, sr = librosa.load(audio_path, sr=16000)

    # Enhanced MFCC features
    mfcc = librosa.feature.mfcc(y=y, sr=sr, n_mfcc=13)
    mfcc_mean = mfcc.mean(axis=1)
    mfcc_std = mfcc.std(axis=1)

    # Enhanced pitch features
    f0, voiced_flag, voiced_probs = librosa.pyin(y,
                                                fmin=librosa.note_to_hz('C2'),
                                                fmax=librosa.note_to_hz('C7'))
    f0_mean = np.nanmean(f0)
    f0_std = np.nanstd(f0)

    # Enhanced spectral features
    spectral_centroid = librosa.feature.spectral_centroid(y=y, sr=sr)
    spectral_bandwidth = librosa.feature.spectral_bandwidth(y=y, sr=sr)
    spectral_rolloff = librosa.feature.spectral_rolloff(y=y, sr=sr)
    spectral_contrast = librosa.feature.spectral_contrast(y=y, sr=sr)

    # Enhanced energy features
    rms = librosa.feature.rms(y=y)

    # Enhanced voice quality measures
    zero_crossing_rate = librosa.feature.zero_crossing_rate(y)
    jitter = np.std(zero_crossing_rate) * 100

    # Enhanced shimmer calculation
    shimmer = np.std(rms) / np.mean(rms) * 100

    # Enhanced harmonic features
    harmonics = librosa.effects.harmonic(y)
    harmonic_ratio = np.mean(librosa.feature.spectral_flatness(y=harmonics))

    # Formant estimation (simplified)
    S = np.abs(librosa.stft(y))
    formant_freqs = np.mean(librosa.feature.spectral_centroid(S=S, sr=sr))

    return {
        "MFCC_Mean": mfcc_mean.tolist(),
        "MFCC_Std": mfcc_std.tolist(),
        "Fundamental_Frequency_Mean": float(f0_mean),
        "Fundamental_Frequency_Std": float(f0_std),
        "Spectral_Centroid": float(np.mean(spectral_centroid)),
        "Spectral_Bandwidth": float(np.mean(spectral_bandwidth)),
        "Spectral_Rolloff": float(np.mean(spectral_rolloff)),
        "Spectral_Contrast": float(np.mean(spectral_contrast)),
        "RMS_Energy_Mean": float(np.mean(rms)),
        "RMS_Energy_Std": float(np.std(rms)),
        "Jitter_Percent": float(jitter),
        "Shimmer_Percent": float(shimmer),
        "Harmonic_Ratio": float(harmonic_ratio),
        "Voice_Period_Mean": float(1/f0_mean if f0_mean > 0 else 0),
        "Voiced_Segments_Ratio": float(np.mean(voiced_flag)),
        "Formant_Frequency": float(formant_freqs)
    }

def clean_llm_response(text):
    cleaned_text = re.sub(r'<think>.*?</think>\s*', '', text, flags=re.DOTALL)
    cleaned_text = re.sub(r'<[^>]+>', '', cleaned_text)
    cleaned_text = ' '.join(cleaned_text.split())
    return cleaned_text

def generate_medical_report(features, prediction, probabilities):
    prompt = f"""
    Generate a detailed voice pathology medical report with the following format:

    VOICE PATHOLOGY MEDICAL REPORT

    PATIENT INFORMATION
    Analysis Date: {datetime.now().strftime('%Y-%m-%d')}
    Predicted Condition: {prediction} ({probabilities[prediction]})

    SUMMARY OF FINDINGS
    [Provide a concise summary of the main findings and their clinical significance]

    ACOUSTIC ANALYSIS
    Fundamental Frequency:
    - Mean: {features['Fundamental_Frequency_Mean']:.2f} Hz
    - Standard Deviation: {features['Fundamental_Frequency_Std']:.2f} Hz
    - Clinical Significance: [Explain]

    Voice Perturbation Measures:
    - Jitter: {features['Jitter_Percent']:.2f}%
    - Shimmer: {features['Shimmer_Percent']:.2f}%
    - Harmonic Ratio: {features['Harmonic_Ratio']:.3f}
    - Clinical Significance: [Explain]

    Additional Measurements:
    - Voice Period: {features['Voice_Period_Mean']:.4f} seconds
    - Voiced Segments Ratio: {features['Voiced_Segments_Ratio']:.2f}
    - Formant Frequency: {features['Formant_Frequency']:.2f} Hz
    - Clinical Significance: [Explain]

    CLINICAL IMPLICATIONS
    [Discuss the clinical implications of these findings]

    RECOMMENDATIONS
    [Provide specific recommendations for treatment and follow-up]

    Please format all headers in bold without using asterisks (*). Use clear section breaks and maintain professional medical terminology.
    """

    completion = client.chat.completions.create(
        model="deepseek-r1-distill-llama-70b",
        messages=[{"role": "user", "content": prompt}],
        temperature=0.6,
        max_tokens=4096,
    )

    return clean_llm_response(completion.choices[0].message.content)


# First, let's define the normal ranges for each parameter
NORMAL_RANGES = {
    'Fundamental_Frequency_Mean': {
        'male': (85, 180),    # Hz
        'female': (165, 255), # Hz
        'default': (85, 255)  # Hz (when gender not specified)
    },
    'Fundamental_Frequency_Std': (0, 20),     # Hz
    'Jitter_Percent': (0, 2.2),              # %
    'Shimmer_Percent': (0, 3.81),             # %
    'Harmonic_Ratio': (0.15, 0.25),           
    'Voice_Period_Mean': (0.003, 0.005),      # seconds
    'Voiced_Segments_Ratio': (0.4, 0.8),      
    'Formant_Frequency': (500, 2000)          # Hz
}

def get_parameter_key(display_name):
    """Convert display name to parameter key."""
    # Mapping of display names to parameter keys
    name_mapping = {
        'Fundamental Frequency (Mean)': 'Fundamental_Frequency_Mean',
        'Fundamental Frequency (Std)': 'Fundamental_Frequency_Std',
        'Jitter': 'Jitter_Percent',
        'Shimmer': 'Shimmer_Percent',
        'Harmonic Ratio': 'Harmonic_Ratio',
        'Voice Period': 'Voice_Period_Mean',
        'Voiced Segments Ratio': 'Voiced_Segments_Ratio',
        'Formant Frequency': 'Formant_Frequency'
    }
    return name_mapping.get(display_name)

def is_within_range(value, parameter_key, gender=None):
    """Check if value is within normal range."""
    if parameter_key not in NORMAL_RANGES:
        print(f"Warning: No range defined for parameter {parameter_key}")
        return True  # Default to true if range not defined
        
    if parameter_key == 'Fundamental_Frequency_Mean':
        if gender:
            range_values = NORMAL_RANGES[parameter_key][gender]
        else:
            range_values = NORMAL_RANGES[parameter_key]['default']
    else:
        range_values = NORMAL_RANGES[parameter_key]
    
    return range_values[0] <= value <= range_values[1]

# Constants for styling
BRAND_COLOR = '#FF1493'  # Dark pink
HEADER_COLOR = (255, 20, 147)  # RGB for dark pink
SUBHEADER_COLOR = (255, 182, 193)  # Light pink
LOGO_PATH = "audihealth_logo.jpg"  # Your logo path

class VoicePathologyPDF(FPDF):
    def header(self):
        # Add logo (same on all pages)
        if os.path.exists(LOGO_PATH):
            self.image(LOGO_PATH, 10, 8, 15)  # Adjust logo position if needed

        # Add company name with proper alignment
        self.set_xy(25, 12)  # Move text rightwards
        self.set_font('Arial', 'B', 20)
        self.set_text_color(*HEADER_COLOR)
        self.cell(60, 10, 'AudiHealth', 0, 0, 'L')

        # Move to the right for the report title
        self.set_xy(140, 12)  # Adjust for better spacing
        self.set_font('Arial', 'B', 12)
        self.set_text_color(0, 0, 0)
        self.cell(0, 10, 'Voice Pathology Analysis Report', 0, 1, 'R')

        self.ln(3)
        # Draw a horizontal line under the header for better readability
        self.set_line_width(0.4)
        self.line(10, 30, 200, 30)

        self.ln(15)  # Move cursor down

    def colored_cell(self, w, h, txt, value, parameter_name, gender=None):
        """Create a cell with color based on whether the value is within normal range"""
        if isinstance(value, str):
            value = float(value.replace('%', ''))
        
        parameter_key = get_parameter_key(parameter_name)
        if parameter_key and is_within_range(value, parameter_key, gender):
            self.set_text_color(0, 128, 0)  # Green for normal
        else:
            self.set_text_color(255, 0, 0)  # Red for abnormal
            
        self.cell(w, h, txt, 1, 0, 'L')
        self.set_text_color(0, 0, 0)  # Reset to black


    def footer(self):
        self.set_y(-15)
        self.set_font('Arial', 'I', 8)
        self.set_text_color(*HEADER_COLOR)
        self.cell(0, 10, f'Page {self.page_no()}/{{nb}} - AudiHealth Voice Analysis', 0, 0, 'C')

    def chapter_title(self, title):
        self.set_font('Arial', 'B', 12)
        self.set_fill_color(*SUBHEADER_COLOR)
        self.set_text_color(0, 0, 0)
        self.cell(0, 6, title, 0, 1, 'L', 1)
        self.ln(4)

    def chapter_body(self, text):
        self.set_font('Arial', '', 11)
        self.set_text_color(0, 0, 0)
        # Process text to properly format bold sections
        sections = text.split('**')
        for i, section in enumerate(sections):
            if i % 2 == 0:  # Regular text
                self.set_font('Arial', '', 11)
            else:  # Bold text
                self.set_font('Arial', 'B', 11)
            self.multi_cell(0, 5, section)
        self.ln()



def create_pdf_report(audio_path, prediction, probabilities, report_text, features, output_pdf='medical_report.pdf', gender=None):
    pdf = VoicePathologyPDF()
    pdf.alias_nb_pages()
    pdf.add_page()

    # Patient Information
    pdf.chapter_title('Patient Information')
    pdf.set_font('Arial', '', 11)
    pdf.cell(0, 6, f"Analysis Date: {datetime.now().strftime('%Y-%m-%d')}", 0, 1)
    pdf.cell(0, 6, f"Predicted Condition: {prediction} ({probabilities[prediction]})", 0, 1)
    pdf.ln(5)

    # Acoustic Measurements
    pdf.chapter_title('Acoustic Measurements')

    # Column headers
    col_widths = [pdf.w/3, pdf.w/4, pdf.w/4, pdf.w/4]
    pdf.set_font('Arial', 'B', 11)
    pdf.set_fill_color(*SUBHEADER_COLOR)
    headers = ['Parameter', 'Value', 'Normal Range', 'Unit']
    for i, header in enumerate(headers):
        pdf.cell(col_widths[i], 7, header, 1, 0, 'L', True)
    pdf.ln()

    # Table data with normal ranges
    pdf.set_font('Arial', '', 11)
    measurements = [
        ['Fundamental Frequency (Mean)', 
         f"{features['Fundamental_Frequency_Mean']:.2f}",
         f"{NORMAL_RANGES['Fundamental_Frequency_Mean']['default'][0]}-{NORMAL_RANGES['Fundamental_Frequency_Mean']['default'][1]}",
         'Hz'],
        ['Fundamental Frequency (Std)', 
         f"{features['Fundamental_Frequency_Std']:.2f}",
         f"{NORMAL_RANGES['Fundamental_Frequency_Std'][0]}-{NORMAL_RANGES['Fundamental_Frequency_Std'][1]}",
         'Hz'],
        ['Jitter',
         f"{features['Jitter_Percent']:.2f}",
         f"{NORMAL_RANGES['Jitter_Percent'][0]}-{NORMAL_RANGES['Jitter_Percent'][1]}",
         '%'],
        ['Shimmer',
         f"{features['Shimmer_Percent']:.2f}",
         f"{NORMAL_RANGES['Shimmer_Percent'][0]}-{NORMAL_RANGES['Shimmer_Percent'][1]}",
         '%'],
        ['Harmonic Ratio',
         f"{features['Harmonic_Ratio']:.3f}",
         f"{NORMAL_RANGES['Harmonic_Ratio'][0]}-{NORMAL_RANGES['Harmonic_Ratio'][1]}",
         ''],
        ['Voice Period',
         f"{features['Voice_Period_Mean']:.4f}",
         f"{NORMAL_RANGES['Voice_Period_Mean'][0]}-{NORMAL_RANGES['Voice_Period_Mean'][1]}",
         's'],
        ['Voiced Segments Ratio',
         f"{features['Voiced_Segments_Ratio']:.2f}",
         f"{NORMAL_RANGES['Voiced_Segments_Ratio'][0]}-{NORMAL_RANGES['Voiced_Segments_Ratio'][1]}",
         ''],
        ['Formant Frequency',
         f"{features['Formant_Frequency']:.2f}",
         f"{NORMAL_RANGES['Formant_Frequency'][0]}-{NORMAL_RANGES['Formant_Frequency'][1]}",
         'Hz']
    ]

    for row in measurements:
        display_name = row[0]
        value = float(row[1])
        
        pdf.cell(col_widths[0], 7, row[0], 1, 0, 'L')
        pdf.colored_cell(col_widths[1], 7, row[1], value, display_name, gender)
        pdf.cell(col_widths[2], 7, row[2], 1, 0, 'L')
        pdf.cell(col_widths[3], 7, row[3], 1, 0, 'L')
        pdf.ln()

    pdf.ln(5)

    # Detailed Analysis with proper formatting
    pdf.chapter_title('Detailed Analysis')
    pdf.chapter_body(report_text)

    # Spectrogram
    pdf.add_page()
    pdf.chapter_title('Voice Spectrogram')
    pdf.image('mel_spectrogram.png', x=10, w=190)

    pdf.output(output_pdf)

def plot_mel_spectrogram(audio_path, output_path='mel_spectrogram.png'):
    y, sr = librosa.load(audio_path)

    plt.figure(figsize=(12, 8))

    # Plot waveform
    plt.subplot(3, 1, 1)
    librosa.display.waveshow(y, sr=sr, color='c')
    plt.title('Waveform')

    # Plot mel spectrogram
    plt.subplot(3, 1, 2)
    D = librosa.amplitude_to_db(librosa.stft(y), ref=np.max)
    librosa.display.specshow(D, sr=sr, x_axis='time', y_axis='log')
    plt.colorbar(format='%+2.0f dB')
    plt.title('Mel Spectrogram')

    plt.subplot(3, 1, 3)  
    bandwidth = librosa.feature.spectral_bandwidth(y=y, sr=sr)[0]
    times = librosa.times_like(bandwidth, sr=sr)
    plt.plot(times, bandwidth, color='b', label='Spectral Bandwidth')
    plt.xlabel('Time (s)')
    plt.ylabel('Frequency (Hz)')
    plt.title('Spectral Bandwidth over Time')
    plt.legend()
    # plt.semilogy(bandwidth.T, label='Spectral Bandwidth')


    plt.tight_layout()
    plt.savefig(output_path)
    plt.close()

def generate_json_report(audio_path, prediction, probabilities, report_text, features):
    # Format acoustic measurements for better readability
    acoustic_measurements = {
        "fundamental_frequency": {
            "mean": round(features['Fundamental_Frequency_Mean'], 2),
            "std": round(features['Fundamental_Frequency_Std'], 2),
            "unit": "Hz"
        },
        "voice_perturbation": {
            "jitter": {
                "value": round(features['Jitter_Percent'], 2),
                "unit": "%"
            },
            "shimmer": {
                "value": round(features['Shimmer_Percent'], 2),
                "unit": "%"
            },
            "harmonic_ratio": round(features['Harmonic_Ratio'], 3)
        },
        "additional_measurements": {
            "voice_period": {
                "value": round(features['Voice_Period_Mean'], 4),
                "unit": "seconds"
            },
            "voiced_segments_ratio": round(features['Voiced_Segments_Ratio'], 2),
            "formant_frequency": {
                "value": round(features['Formant_Frequency'], 2),
                "unit": "Hz"
            }
        }
    }
    
    # Create the complete report structure
    report = {
        "report_metadata": {
            "analysis_date": datetime.now().strftime('%Y-%m-%d'),
            "audio_file": audio_path,
            "report_type": "Voice Pathology Analysis"
        },
        "diagnosis": {
            "predicted_condition": prediction,
            "confidence_scores": probabilities
        },
        "acoustic_analysis": acoustic_measurements,
        "mfcc_features": {
            "mean": [round(x, 4) for x in features['MFCC_Mean']],
            "std": [round(x, 4) for x in features['MFCC_Std']]
        },
        "detailed_report": report_text
    }
    
    return json.dumps(report, indent=2)


def process_audio(audio_path):
    print("\nExtracting audio features...")
    vggish_features = extract_audio_features(audio_path)
    acoustic_features = extract_advanced_features(audio_path)

    vggish_features = np.expand_dims(vggish_features, axis=0)
    prediction = model.predict(vggish_features)
    predicted_class = np.argmax(prediction, axis=1)[0]
    predicted_class_label = label_mapping[predicted_class]

    probabilities = {label_mapping[i]: f"{probability * 100:.2f}%" for i, probability in enumerate(prediction[0])}
    probabilities_sorted = dict(sorted(probabilities.items(), key=lambda item: float(item[1].rstrip('%')), reverse=True))

    print("Generating spectrogram...")
    plot_mel_spectrogram(audio_path)

    print("Generating medical report...")
    report_text = generate_medical_report(acoustic_features, predicted_class_label, probabilities_sorted)


    print("Creating PDF report...")
    create_pdf_report(audio_path, predicted_class_label, probabilities_sorted, report_text, acoustic_features)

    print("Creating JSON report...")
    json_report = generate_json_report(audio_path, 
                                        predicted_class_label,
                                        probabilities_sorted, 
                                        report_text, 
                                        acoustic_features)

    print("Report generated successfully!")

    with open('medical_report.json', 'w') as f:
        f.write(json_report)

    return json_report


# process_audio("Sample_1(vocal polyp).wav")


