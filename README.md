📂 backend/
├── 📂 api/
│ ├── 📄 __init__.py
│ ├── 📄 routes.py
│ ├── 📄 utils.py
│
├── 📂 models/
│ ├── 📄 __init__.py
│ ├── 📄 model.py (Your model file)
│
├── 📂 static/
│ ├── 📂 saved_models/ (For your saved models)
│
├── 📄 requirements.txt
├── 📄 app.py (Flask entry point)
Frontend (React + Vite)

📂 frontend/
├── 📂 public/
│
├── 📂 src/
│ ├── 📂 components/
│ │ ├── 📄 Navbar.jsx
│ │ ├── 📄 Landing3D.jsx
│ │ ├── 📄 AboutSection.jsx
│ │ ├── 📄 DiagnoseForm.jsx
│ │ ├── 📄 Spectrogram.jsx
│ │ ├── 📄 ExerciseDashboard.jsx
│
│ ├── 📂 pages/
│ │ ├── 📄 Home.jsx
│ │ ├── 📄 Diagnose.jsx
│ │ ├── 📄 Exercises.jsx
│
│ ├── 📂 utils/
│ │ ├── 📄 api.js
│
│ ├── 📂 styles/
│ │ ├── 📄 tailwind.css
│
│ ├── 📄 App.jsx
│ ├── 📄 package.json (Using Vite)
│ ├── 📄 vite.config.js