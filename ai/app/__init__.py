from flask import Flask
from tensorflow.keras.models import load_model
from groq import Groq
import os
import cloudinary

GROQ_API_KEY = os.getenv("GROQ_API_KEY") or "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"
client = Groq(api_key=GROQ_API_KEY)

model_path = "app/lsm_model3"
model = load_model(model_path)

CLOUDINARY_CLOUD_NAME = os.getenv("CLOUDINARY_CLOUD_NAME") or "de2z55xdt"
CLOUDINARY_API_KEY = os.getenv("CLOUDINARY_API_KEY") or "366356674838559"
CLOUDINARY_API_SECRET = os.getenv("CLOUDINARY_API_SECRET") or "0BW-xr08xFmlFV1Aik_2kiHRP98"

cloudinary.config(
    cloud_name=CLOUDINARY_CLOUD_NAME,
    api_key=CLOUDINARY_API_KEY,
    api_secret=CLOUDINARY_API_SECRET
)

def create_app():
    app = Flask(__name__)
    app.config['SECRET_KEY'] = "123"

    from .audio_bp import audio_bp
    app.register_blueprint(audio_bp, url_prefix='/api')

    return app