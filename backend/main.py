from dotenv import load_dotenv

load_dotenv()

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from routes import tasks, agent, auth


app = FastAPI(title="Clutch API", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "https://your-deployed-frontend.vercel.app"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(tasks.router)
app.include_router(agent.router)
app.include_router(auth.router)

@app.get("/")
def root():
    return {"message": "Clutch API is running 🚀"}

@app.get("/health")
def health():
    return {"status": "healthy"}

