📂 **backend/**  
├── 📂 **api/**  
│   ├── 📄 `__init__.py`  
│   ├── 📄 `routing.py`  
│   ├── 📄 `utils.py`  
│  
├── 📂 **models/**  
│   ├── 📄 `__init__.py`  
│   ├── 📄 `model.py`  
│  
├── 📂 **static/**  
│   ├── 📂 **saved_models/**  
|
├── 📄 `requirement.txt`  
├── 📄 `app.py` #flask  



📂 **frontend/**  
├── 📂 **public/**  
│  
├── 📂 **src/**  
│   ├── 📂 **components/**  
│   │   ├── 📄 `Navbar.jsx`  
│   │   ├── 📄 `Landing3D.jsx`  
│   │   ├── 📄 `AboutSection.jsx`  
│   │   ├── 📄 `DiagnoseForm.jsx`  
│   │   ├── 📄 `Spectrogram.jsx`  
│   │   ├── 📄 `ExerciseDashboard.jsx`  
│  
│   ├── 📂 **pages/**  
│   │   ├── 📄 `Home.jsx`  
│   │   ├── 📄 `Diagnose.jsx`  
│   │   ├── 📄 `Exercises.jsx`  
│  
│   ├── 📂 **utils/**  
│   │   ├── 📄 `api.js`  
│  
│   ├── 📂 **styles/**  
│   │   ├── 📄 `tailwind.css`  
│  
│   ├── 📄 `App.jsx`  
│   ├── 📄 `package.json`  _(Using Vite)_  
│   ├── 📄 `vite.config.js`  



📄 **README.md**


# AudiHealth - Voice Pathology Detection

![AudiHealth Logo](logo.png)

AudiHealth is a machine learning-based application designed to detect voice pathologies, specifically vocal polyp and laryngitis, using audio data. Leveraging the power of VGGish for feature extraction and a Liquid State Machine (LSM) model for classification, AudiHealth aims to provide early detection capabilities, potentially improving patient outcomes.

## Table of Contents

- [Introduction](#introduction)
- [Features](#features)
- [Getting Started](#getting-started)
- [Prerequisites](#prerequisites)
- [Installation](#installation)
- [Usage](#usage)
- [Contributing](#contributing)
- [License](#license)
- [Contact](#contact)
- [Acknowledgments](#acknowledgments)

## Introduction

Voice pathologies, such as vocal polyp and laryngitis, can significantly impact a person's quality of life. Early detection is crucial, but it often faces challenges due to the complexity of voice analysis. AudiHealth addresses this by utilizing advanced machine learning techniques to analyze audio data and detect these pathologies with high accuracy.

## Features

- **VGGish Feature Extraction**: Utilizes the VGGish model for extracting rich audio features.
- **Liquid State Machine (LSM) Model**: A custom model architecture for pathology detection.
- **Data Preprocessing**: Includes SMOTE for handling class imbalance.
- **Performance Metrics**: Provides detailed performance metrics for evaluation.

## Getting Started

These instructions will get you a copy of the project up and running on your local machine for development and testing purposes.

### Prerequisites

- Python 3.7+
- TensorFlow 2.x
- Librosa
- TensorFlow Hub

### Installation

1. Clone the repository:
2. Navigate to the project directory:
3. Install the required packages:


## Usage

To use AudiHealth for voice pathology detection, follow these steps:

1. Prepare your audio data in the required format(.wav).
2. Run the feature extraction script:
3. Train the model using the extracted features:
4. Use the trained model to predict voice pathologies:


## Contributing

Contributions are welcome! Please read the [CONTRIBUTING.md](CONTRIBUTING.md) for details on how to contribute to this project.

## License

This project is licensed under the MIT License - see the [LICENSE.md](LICENSE.md) file for details.

## Contact

- Krishnan Vignesh - krishnanvignesh148@gmail.com
- Sahil Brid - bridsahil007@gmail.com

Project Link: [https://github.com/Krish0909/AudiHealth](https://github.com/Krish0909/AudiHealth)

## Acknowledgments

- VGGish for feature extraction.
- TensorFlow Hub for the LSM model.
- All contributors to this project.


