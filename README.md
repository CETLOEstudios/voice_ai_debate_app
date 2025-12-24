# CETLOE's Learning Integrity Checker

A voice-powered tool that verifies whether students truly understand the assignments they submit. Students upload their work, answer three voice questions from an AI coach, and receive an integrity score.

## Features

- **Voice Q&A**: AI asks questions about your assignment, you answer with your voice
- **File Upload**: Supports PDF, DOCX, PPTX, and TXT (up to 8 MB)
- **Live Transcript**: See the conversation as it happens
- **Integrity Scoring**: Precise scores (30-100) based on how well students explain their work
- **Modern UI**: Clean, minimal design with interactive audio-reactive orb
- **In-Browser Settings**: Configure API keys through the UI (stored securely in browser)
- **High-Quality TTS**: Optional ElevenLabs text-to-speech for natural voice output

## Quick Start

### Option A: Docker (Recommended)

The easiest way to run the app:

```bash
docker compose up --build
```

Open http://localhost:3000 in Chrome.

### Option B: Manual Setup

#### 1. Install Backend

```bash
cd backend

# Create virtual environment
python -m venv venv
venv\Scripts\activate  # Windows
# source venv/bin/activate  # Mac/Linux

# Install dependencies
pip install -r requirements.txt
```

#### 2. Install Frontend

```bash
cd frontend
npm install
```

#### 3. Run the App

```bash
# From the project root
python run.py
```

This starts both backend and frontend. Open http://localhost:5173 in Chrome.

### 4. Configure API Keys (First-Time Setup)

When you first open the app, a settings dialog will appear:

1. **Get a Gemini API Key** (required):
   - Go to https://aistudio.google.com/app/apikey
   - Create a new API key
   - Paste it in the Settings dialog

2. **Get an ElevenLabs API Key** (optional, for better voice):
   - Go to https://elevenlabs.io
   - Create a free account (10,000 characters/month free)
   - Copy your API key from the dashboard

Your keys are stored securely in your browser's local storage — **you only need to enter them once**.

## Usage Flow

1. **Upload**: Drag or select a PDF/DOCX/PPTX/TXT file
2. **Start Q&A**: Click "Start Q&A" to begin the voice conversation
3. **Answer Questions**: The AI asks 3 questions about your assignment
4. **Get Results**: See your integrity score (30-100) and review

## Settings

Click the ⚙️ icon in the top right to access settings:

- **API Keys**: Configure your Gemini and ElevenLabs API keys
- **AI Prompt**: Customize the AI's behavior and scoring criteria
- **Number of Questions**: Choose 2-5 questions per session

Settings persist across browser sessions.


## Project Structure

```
├── backend/
│   ├── main.py              # FastAPI app + endpoints
│   ├── config.py            # Environment settings
│   ├── file_parser.py       # PDF/DOCX/PPTX extraction
│   ├── gemini_service.py    # Gemini AI integration
│   ├── tts_service.py       # Text-to-speech (ElevenLabs/gTTS)
│   └── requirements.txt     # Python dependencies
│
├── frontend/
│   ├── src/
│   │   ├── App.jsx          # Main React app
│   │   ├── styles.css       # Styling
│   │   ├── api.js           # API client
│   │   └── components/      # React components
│   ├── package.json         # Node dependencies
│   └── vite.config.js       # Vite configuration
│
├── docker-compose.yml       # Docker orchestration
├── Dockerfile.backend       # Backend container
├── Dockerfile.frontend      # Frontend container
└── run.py                   # Start both servers (dev)
```

## Docker Details

The Docker setup includes:
- **Backend**: Python 3.11 + FastAPI on port 8000
- **Frontend**: Node 20 + Nginx on port 3000 (production build)

To stop the containers:
```bash
docker compose down
```

To rebuild after code changes:
```bash
docker compose up --build
```

## Troubleshooting

### "API key required" error
- Open Settings (⚙️ icon) and add your Gemini API key
- Get one free at https://aistudio.google.com/app/apikey

### Speech recognition stops working
- Refresh the page
- Check microphone permissions
- Use Chrome for best support

### Voice sounds robotic
- Add an ElevenLabs API key in Settings for natural voice
- Without it, the app uses gTTS (robotic sounding)

### Changing the Voice

Edit `backend/tts_service.py` to change the ElevenLabs voice:

```python
# Voice options:
# - "EXAVITQu4vr4xnSDxMaL" - Bella (friendly female) - default
# - "21m00Tcm4TlvDq8ikWAM" - Rachel (calm female)
# - "ErXwobaYiN019PkySvjV" - Antoni (friendly male)
# - "pNInz6obpgDQGcFmaJgB" - Adam (professional male)
ELEVENLABS_VOICE_ID = "EXAVITQu4vr4xnSDxMaL"
```
