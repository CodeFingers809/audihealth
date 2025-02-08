from app import create_app
from dotenv import load_dotenv
from flask_cors import CORS

load_dotenv()

app = create_app()
CORS(app, resources={r"/api/*": {"origins": "http://localhost:8000"}})

if __name__ == "__main__":
    app.run(host='0.0.0.0', port=8080, use_reloader=False)