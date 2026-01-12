from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from db import create_db_and_tables
from routes import tasks
from routes import auth

app = FastAPI(title="Todo API")

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, specify your frontend URL
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routes
app.include_router(tasks.router)
app.include_router(auth.router)

@app.on_event("startup")
def on_startup():
    create_db_and_tables()

@app.get("/")
def read_root():
    return {"message": "Todo API is running!"}

# Include this for when run directly
if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
