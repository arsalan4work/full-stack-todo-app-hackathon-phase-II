from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from db import create_db_and_tables
from routes import tasks
from routes import auth
from routes import chat
import os

app = FastAPI(
    title="Todo API",
    description="A full-featured todo application API with authentication",
    version="1.0.0"
)

# Configure CORS - FIXED to always include Vercel frontend
frontend_url = os.getenv("FRONTEND_URL", "http://localhost:3000")
allow_origins = [
    frontend_url,
    "https://full-stack-todo-app-hackathon-front.vercel.app",  # Always allow your Vercel frontend
    "http://localhost:3000",  # Allow local development
    "http://127.0.0.1:3000",
    "http://localhost:3001",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=allow_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routes
app.include_router(tasks.router, prefix="/api")
app.include_router(auth.router)  # auth router already has /api/auth prefix
app.include_router(chat.router)  # chat router includes its own prefix

@app.on_event("startup")
def on_startup():
    create_db_and_tables()

@app.get("/")
def read_root():
    return {"message": "Todo API is running!"}

@app.get("/health")
def health_check():
    return {"status": "healthy"}

# Include this for when run directly
if __name__ == "__main__":
    import uvicorn
    port = int(os.getenv("PORT", 8000))
    uvicorn.run(app, host="0.0.0.0", port=port)