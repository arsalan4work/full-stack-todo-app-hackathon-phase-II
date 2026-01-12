import sys
import os
import uvicorn

# Add the project root to the Python path
project_root = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, project_root)

# Add backend to the path specifically
backend_path = os.path.join(project_root, 'backend')
sys.path.insert(0, backend_path)

# Now import the app
from backend.main import app

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)