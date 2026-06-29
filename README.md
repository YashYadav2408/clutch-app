# Clutch Monorepo

Welcome to **Clutch**, a clean, pre-configured monorepo skeleton consisting of a modern Next.js 14 frontend and a high-performance FastAPI python backend.

## Project Structure

```text
clutch/
├── frontend/               # Next.js 14 web application
│   ├── src/
│   │   ├── app/            # App Router pages and CSS
│   │   │   └── page.tsx    # Interactive UI Dashboard
│   │   ├── components/     # UI Components (Shadcn/ui)
│   │   └── lib/            # Utility helpers (clsx, tailwind-merge)
│   ├── components.json     # Shadcn/ui configuration
│   ├── tailwind.config.ts  # Tailwind CSS configuration
│   ├── tsconfig.json       # TypeScript configuration
│   └── .env.example        # Environment variable checklist
│
├── backend/                # Python FastAPI API application
│   ├── main.py             # Server entrypoint & Gemini/Firebase initialization
│   ├── requirements.txt    # Python dependencies
│   ├── .venv/              # Isolated virtual environment
│   └── .env.example        # Environment variable checklist
│
└── README.md               # Monorepo documentation (this file)
```

---

## ⚡ Frontend Setup (`/frontend`)

The frontend is a **Next.js 14** application with **TypeScript**, **Tailwind CSS**, and **Shadcn/ui** installed.

### 1. Install Node Dependencies
Navigate into the `/frontend` directory and install the packages:
```bash
cd frontend
npm install
```

### 2. Configure Environment Variables
Copy `.env.example` to `.env` (or `.env.local`):
```bash
cp .env.example .env.local
```
Update the values accordingly (the default points to `http://localhost:8000`).

### 3. Run Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser to view the interactive dashboard.

---

## 🐍 Backend Setup (`/backend`)

The backend is a **FastAPI** application with **Uvicorn**, **python-dotenv**, **Google Generative AI (Gemini)**, and **Firebase Admin SDK** pre-installed and configured.

### 1. Activate Virtual Environment
Navigate to the `/backend` directory.

On **Windows (PowerShell)**:
```powershell
cd backend
.venv\Scripts\Activate.ps1
```

On **macOS/Linux**:
```bash
cd backend
source .venv/bin/activate
```

### 2. Install Python Dependencies
(Note: Dependencies are already installed in `.venv` if built by the installation script. Otherwise, run:)
```bash
pip install -r requirements.txt
```

### 3. Configure Environment Variables
Copy `.env.example` to `.env`:
```bash
cp .env.example .env
```
Fill out the variables:
- `PORT`: Port to run the server on (default: `8000`).
- `GEMINI_API_KEY`: API key for Gemini. Get one from [Google AI Studio](https://aistudio.google.com/).
- `FIREBASE_CREDENTIALS_PATH`: Path to your Firebase service account key JSON file.

### 4. Run API Server
Start the development server with live reload:
```bash
python main.py
```
Or use uvicorn directly:
```bash
uvicorn main:app --reload
```
The server will run on [http://localhost:8000](http://localhost:8000). Interactive API documentation will be available at [http://localhost:8000/docs](http://localhost:8000/docs).
