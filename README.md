# Todo Full-Stack Web Application

A modern full-stack todo application featuring user authentication, task management, and AI-powered assistance. Built with Next.js 16, FastAPI, and Neon PostgreSQL.

## Features

### Phase III Features (Current)
- Multi-user authentication with JWT tokens
- Secure task creation, viewing, updating, and deletion
- Task completion tracking with visual indicators
- Responsive web interface
- Data isolation ensuring users only see their own tasks
- AI-powered task management assistance
- Real-time chat interface for task discussions
- Production-ready deployment configuration

### Phase II Features
- User registration and login
- Personalized dashboard
- CRUD operations for tasks
- Search and filter capabilities

### Phase I Features
- Console-based todo application
- Basic task management (add, list, complete, delete)
- File-based persistence

## Tech Stack

### Frontend
- **Next.js 16** - React framework with App Router
- **TypeScript** - Type-safe JavaScript
- **Tailwind CSS** - Utility-first styling
- **Better Auth** - Authentication system
- **OpenAI ChatKit** - AI chat interface

### Backend
- **FastAPI** - Modern Python web framework
- **SQLModel** - SQL database modeling
- **Neon PostgreSQL** - Cloud-native PostgreSQL
- **Python 3.12+** - Programming language
- **OpenAI Agents** - AI agent framework
- **Model Context Protocol (MCP)** - Resource integration

## Prerequisites

- Node.js 18+ (for frontend)
- Python 3.12+ (for backend)
- PostgreSQL (or Neon PostgreSQL account)
- OpenAI API key
- Better Auth account (optional)

## Environment Variables

### Backend (`.env` in backend directory)
```bash
# Database Configuration
DATABASE_URL=postgresql://username:password@localhost:5432/todo_app

# Authentication
SECRET_KEY=your_secret_key_here
BETTER_AUTH_SECRET=your_better_auth_secret_here

# OpenAI Configuration
OPENAI_API_KEY=your_openai_api_key_here

# ChatKit Domain Allowlist
CHATKIT_DOMAIN_ALLOWLIST=localhost,*.vercel.app
```

### Frontend (`.env.local` in frontend directory)
```bash
# Backend API URL
NEXT_PUBLIC_BACKEND_URL=http://localhost:8000

# OpenAI API Key (for client-side features if needed)
NEXT_PUBLIC_OPENAI_API_KEY=your_openai_api_key_here

# Authentication
BETTER_AUTH_URL=http://localhost:8000
```

## Setup Instructions

### 1. Clone the Repository
```bash
git clone <repository-url>
cd full-stack-todo-app
```

### 2. Install Backend Dependencies
```bash
cd backend
pip install uv
uv venv  # Create virtual environment (optional but recommended)
uv pip install -r requirements.txt
```

### 3. Install Frontend Dependencies
```bash
cd ../frontend
npm install
```

### 4. Set Up Database
```bash
# From backend directory
# The application will automatically create tables on first run
# Or manually run migrations if available
```

### 5. Run the Applications

#### Option A: Separate Terminals
Backend:
```bash
cd backend
uvicorn main:app --reload --port 8000
```

Frontend:
```bash
cd frontend
npm run dev
```

#### Option B: Using Docker Compose
```bash
docker-compose up --build
```

## Running Locally

1. Ensure all environment variables are set correctly
2. Start the backend server: `cd backend && uvicorn main:app --reload --port 8000`
3. Start the frontend: `cd frontend && npm run dev`
4. Access the application at `http://localhost:3000`

## Testing

### Backend Tests
```bash
cd backend
pytest
```

### Frontend Tests
```bash
cd frontend
npm test
```

## Production Deployment

For production deployment instructions, see [DEPLOYMENT.md](DEPLOYMENT.md).

## API Endpoints

### Authentication
- `POST /api/auth/signup` - Create new user account
- `POST /api/auth/signin` - Sign in to existing account

### Tasks
- `GET /api/users/{user_id}/tasks` - Get all tasks for user
- `POST /api/users/{user_id}/tasks` - Create new task
- `GET /api/users/{user_id}/tasks/{task_id}` - Get specific task
- `PUT /api/users/{user_id}/tasks/{task_id}` - Update task
- `DELETE /api/users/{user_id}/tasks/{task_id}` - Delete task
- `PATCH /api/users/{user_id}/tasks/{task_id}/complete` - Toggle task completion

## Architecture

The application follows a monorepo structure with clear separation between frontend and backend:

```
├── backend/          # FastAPI backend
│   ├── main.py       # Application entry point
│   ├── models/       # Database models
│   ├── routes/       # API route handlers
│   ├── auth/         # Authentication logic
│   └── db.py         # Database connection
├── frontend/         # Next.js frontend
│   ├── app/          # Page components
│   ├── components/   # Reusable UI components
│   ├── lib/          # Utilities and API client
│   └── public/       # Static assets
└── specs/            # Feature specifications
```

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Make your changes
4. Add tests for new functionality
5. Run tests to ensure everything passes
6. Commit your changes (`git commit -m 'Add amazing feature'`)
7. Push to the branch (`git push origin feature/amazing-feature`)
8. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Support

For support, please open an issue in the GitHub repository or contact the development team.