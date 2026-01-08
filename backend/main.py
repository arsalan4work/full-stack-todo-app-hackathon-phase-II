from fastapi import FastAPI
from backend.db import create_db_and_tables
from backend.routes import tasks

app = FastAPI(title="Todo API")

# Include routes
app.include_router(tasks.router)

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
