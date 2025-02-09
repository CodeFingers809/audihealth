from twilio.rest import Client
from flask import Flask, request, send_file
from twilio.twiml.messaging_response import MessagingResponse
import requests
import os
from werkzeug.utils import secure_filename
from werkzeug.utils import secure_filename
from urllib.parse import urlparse
import mimetypes
import magic
from pydub import AudioSegment


def convert_to_wav(input_path):
    """Convert any audio file to WAV format"""
    try:
        # Get the file extension
        file_extension = os.path.splitext(input_path)[1].lower()
        
        # Load the audio file based on its format
        if file_extension == '.mp3':
            audio = AudioSegment.from_mp3(input_path)
        elif file_extension == '.ogg':
            audio = AudioSegment.from_ogg(input_path)
        elif file_extension == '.flac':
            audio = AudioSegment.from_file(input_path, format='flac')
        elif file_extension == '.wav':
            return input_path  # Already WAV format
        elif file_extension == '.m4a':
            audio = AudioSegment.from_file(input_path, format='m4a')
        else:
            # Try to load the file using the extension as format
            audio = AudioSegment.from_file(input_path, format=file_extension[1:])
        
        # Generate output path
        output_path = os.path.splitext(input_path)[0] + '.wav'
        
        # Export as WAV
        audio.export(output_path, format='wav')
        
        # Remove the original file if conversion successful
        if os.path.exists(output_path) and input_path != output_path:
            os.remove(input_path)
            
        return output_path
    
    except Exception as e:
        app.logger.error(f"Error converting audio to WAV: {str(e)}")
        return input_path


# Directory to save received media files
MEDIA_DIR = "received_media"
os.makedirs(MEDIA_DIR, exist_ok=True)

DEFAULT_REPORT_PATH = "reports"
os.makedirs(DEFAULT_REPORT_PATH,exist_ok=True)

# # Directory to save received audio files
UPLOAD_FOLDER = "uploads"
os.makedirs(UPLOAD_FOLDER, exist_ok=True)

ALLOWED_AUDIO_TYPES = {
    # Standard audio types
    "audio/mpeg": ".mp3",
    "audio/ogg": ".ogg",
    "audio/wav": ".wav",
    "audio/mp4": ".m4a",
    "audio/mp3": ".mp3",
    "audio/x-wav": ".wav",
    "audio/webm": ".webm",
    "audio/aac": ".aac",
    "audio/mpeg3": ".mp3",
    "audio/midi": ".midi",
    "audio/x-midi": ".midi",
    "audio/flac": ".flac",
    "audio/x-flac": ".flac",
    
    # Document types that might contain audio
    "application/msword": ".doc",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document": ".docx",
    "application/pdf": ".pdf",
    "application/vnd.ms-powerpoint": ".ppt",
    "application/vnd.openxmlformats-officedocument.presentationml.presentation": ".pptx",
    
    # Additional music file formats
    "audio/x-m4a": ".m4a",
    "audio/x-aiff": ".aiff",
    "audio/basic": ".au",
    "audio/x-mpegurl": ".m3u",
    "audio/x-scpls": ".pls",
    "audio/x-ms-wma": ".wma",
    "audio/x-ms-wax": ".wax",
    "audio/x-realaudio": ".ra",
}


# Magic MIME patterns for audio content
AUDIO_MAGIC_PATTERNS = [
    b'ID3',  # MP3
    b'OggS',  # OGG
    b'RIFF',  # WAV
    b'fLaC',  # FLAC
    b'\xFF\xFB',  # MP3
    b'FORM',  # AIFF
]


def detect_file_type(content):
    mime = magic.Magic(mime=True)
    file_type = mime.from_buffer(content)
    # Also check magic numbers
    for pattern in AUDIO_MAGIC_PATTERNS:
        if content.startswith(pattern):
            return "audio/detected"
    return file_type

def get_file_extension(media_type):
    if media_type in ALLOWED_AUDIO_TYPES:
        return ALLOWED_AUDIO_TYPES[media_type]
    ext = mimetypes.guess_extension(media_type)
    if ext:
        return ext
    return '.bin'


def generate_filename(original_url, sender_number, media_type = None):
    """
    Generate a filename based on original URL, sender, and media type
    """
    # Parse the original URL
    parsed_url = urlparse(original_url)
    
    # Get the original filename from the URL
    original_filename = os.path.basename(parsed_url.path)
    
    # If no filename in URL, create a timestamp-based name
    if not original_filename:
        from datetime import datetime
        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
        original_filename = f"audio_{timestamp}"
    
    # Remove any existing extension
    base_name = os.path.splitext(original_filename)[0]
    
    # Get the appropriate extension
    if media_type is None : 
        extension = ""
    extension = get_file_extension(media_type)
    
    # Always use .wav extension since we're converting everything to WAV
    extension = '.wav'
    # Create the new filename
    new_filename = f"{base_name}_{sender_number}{extension}"
    
    # Make it secure
    return secure_filename(new_filename)


def get_authenticated_url(url):
    app.logger.info(f"{url}")
    parsed = urlparse(url)
    app.logger.info(f"{parsed.netloc}")
    netloc = f"{TWILIO_ACCOUNT_SID}:{TWILIO_AUTH_TOKEN}@{parsed.netloc}"
    return parsed._replace(netloc=netloc).geturl()


# ----------------------------------------------------------------------------------------------------------
TWILIO_ACCOUNT_SID = 'ACc17042e5e7302b38fd567cfa1d06e7a4'  
TWILIO_AUTH_TOKEN = '00cd20f60139c64748d5261eca602e4d' 
client = Client(TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN)

app = Flask(__name__)
app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER


@app.route("/whatsapp", methods=["POST"])
def whatsapp_reply():
    """Handles incoming WhatsApp messages with audio attachments and sends a PDF response."""
    try:
        msg = request.form.get("Body", "")
        media_url = request.form.get("MediaUrl0")
        media_type = request.form.get("MediaContentType0")
        sender_number = request.form.get("From")

        # Log incoming message details for debugging
        app.logger.info(f"Received message from {sender_number}")
        app.logger.info(f"Message body: {msg}")
        app.logger.info(f"Media URL: {media_url}")
        app.logger.info(f"Media type: {media_type}")

        response = MessagingResponse()

        if True :
            try:
                auth_url = get_authenticated_url(media_url) 
                app.logger.info(f"debug only 1")
                app.logger.info("Downloading audio file...")
                media_content = requests.get(
                    auth_url,
                    headers={'User-Agent': 'Mozilla/5.0'}
                )
                media_content.raise_for_status()

                # Now we can use media_content
                content = media_content.content
                detected_type = detect_file_type(content)
                app.logger.info(f"Detected file type: {detected_type}")
                
                # Generate appropriate filename
                if media_type is None : 
                    filename = "audio"
                    # filename = generate_filename(media_url, sender_number)
                filename = generate_filename(media_url, sender_number, media_type)
                filepath = os.path.join(app.config['UPLOAD_FOLDER'], filename)

                # Log the file details
                app.logger.info(f"Saving file as: {filename}")
                app.logger.info(f"Media type detected: {media_type}")

                # Download the file
                app.logger.info("Downloading audio file...")
                media_content = requests.get(
                    auth_url,
                    headers={'User-Agent': 'Mozilla/5.0'}
                )
                media_content.raise_for_status()

                # Save the file
                with open(filepath, "wb") as f:
                    f.write(media_content.content)
                
                # app.logger.info(f"File saved successfully at: {filepath}")
                wav_filepath = convert_to_wav(filepath)
                app.logger.info(f"File converted and saved as WAV at: {wav_filepath}")
                
                if os.path.exists(DEFAULT_REPORT_PATH):
                    message = response.message("Audio received! Here's your report:")
                    pdf_url = f"https://{request.host}/download-pdf"
                    message.media(pdf_url)
                else:
                    response.message("Audio received! However, the report is not available at the moment.")

            except requests.RequestException as e:
                app.logger.error(f"Error downloading audio: {str(e)}")
                response.message("Sorry, there was an error processing your audio file. Please try again.")
            
            except Exception as e:
                app.logger.error(f"Error processing audio: {str(e)}")
                response.message("An unexpected error occurred. Please try again later.")

        return str(response)

    except Exception as e:
        app.logger.error(f"Error in whatsapp_reply: {str(e)}")
        return str(MessagingResponse().message("An error occurred. Please try again later."))



@app.route("/download-pdf", methods=["GET"])
def download_pdf():
    """Endpoint to serve the PDF file."""
    try:
        if not os.path.exists(DEFAULT_REPORT_PATH):
            return "PDF file not found", 404
        return send_file(
            DEFAULT_REPORT_PATH,
            as_attachment=True,
            download_name="medical_report.pdf"
        )
    except Exception as e:
        app.logger.error(f"Error serving PDF: {str(e)}")
        return "Error serving PDF file", 500


@app.route("/upload", methods=["POST"])
def upload_file():
    """Handles file uploads via a simple HTML form."""
    if 'file' not in request.files:
        return "No file part"
    
    file = request.files['file']
    if file.filename == '':
        return "No selected file"
    
    if file:
        filename = secure_filename(file.filename)
        filepath = os.path.join(app.config['UPLOAD_FOLDER'], filename)
        file.save(filepath)
        return "File uploaded successfully!"
    
    if file:
        filename = secure_filename(file.filename)
        filepath = os.path.join(app.config['UPLOAD_FOLDER'], filename)
        file.save(filepath)
        
        # Convert uploaded file to WAV
        wav_filepath = convert_to_wav(filepath)
        return f"File uploaded and converted to WAV successfully at {wav_filepath}!"



if __name__ == "__main__":
    app.run(debug=True, port=8080)