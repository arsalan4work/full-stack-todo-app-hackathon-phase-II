# Quickstart Guide: Todo Full-Stack Web Application

## Prerequisites

- Node.js 18+ for frontend development
- Python 3.13+ for backend development
- Neon Serverless PostgreSQL account
- Git

## Setup Instructions

### 1. Clone the Repository
```bash
git clone <repository-url>
cd hackathon-todo
```

### 2. Backend Setup
```bash
# Navigate to backend directory
cd backend

# Create virtual environment
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install dependencies
pip install fastapi sqlmodel python-multipart python-jose[cryptography] passlib[bcrypt] python-dotenv

# Set up environment variables
cp .env.example .env
# Edit .env with your database URL and secret keys
```

### 3. Frontend Setup
```bash
# Navigate to frontend directory
cd frontend

# Install dependencies
npm install
# or
yarn install

# Set up environment variables
cp .env.example .env.local
# Edit .env.local with your API base URL
```

### 4. Database Setup
```bash
# From backend directory
cd backend

# Run database migrations
python -c "
from sqlmodel import SQLModel
from db import engine
from models import User, Task
SQLModel.metadata.create_all(engine)
"
```

### 5. Running the Application

#### Development Mode
```bash
# Terminal 1: Start backend
cd backend
uvicorn main:app --reload --port 8000

# Terminal 2: Start frontend
cd frontend
npm run dev
# or
yarn dev
```

#### Using Docker Compose (Alternative)
```bash
docker-compose up --build
```

## Environment Variables

### Backend (.env)
```
DATABASE_URL=postgresql://user:password@localhost/dbname
SECRET_KEY=your-super-secret-key-here
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30
```

### Frontend (.env.local)
```
NEXT_PUBLIC_API_BASE_URL=http://localhost:8000
```

## API Endpoints

### Authentication
- `POST /api/auth/signup` - Create new user
- `POST /api/auth/signin` - Sign in existing user

### Task Management
- `GET /api/users/{user_id}/tasks` - List user's tasks
- `POST /api/users/{user_id}/tasks` - Create new task
- `GET /api/users/{user_id}/tasks/{task_id}` - Get specific task
- `PUT /api/users/{user_id}/tasks/{task_id}` - Update task
- `DELETE /api/users/{user_id}/tasks/{task_id}` - Delete task

## Testing

### Backend Tests
```bash
# From backend directory
pytest --cov=.
```

### Frontend Tests
```bash
# From frontend directory
npm test
# or
yarn test
```

## Architecture Overview

```
frontend/
├── app/              # Next.js App Router pages
├── components/       # Reusable UI components
├── lib/              # API client and utilities
└── public/           # Static assets

backend/
├── main.py           # FastAPI application entry point
├── models/           # SQLModel database models
├── routes/           # API route handlers
├── auth/             # Authentication utilities
└── db.py             # Database connection utilities
```