# Production Deployment Guide

This document provides instructions for deploying the Todo Full-Stack Web Application to production environments.

## Environment Variables

### Backend (FastAPI)

Required environment variables for the backend service:

```bash
# Database Configuration
DATABASE_URL=postgresql://username:password@host:port/database_name

# Authentication
SECRET_KEY=your_secret_key_here

# OpenAI Configuration
OPENAI_API_KEY=your_openai_api_key_here

# ChatKit Domain Allowlist
CHATKIT_DOMAIN_ALLOWLIST=localhost,*.vercel.app,*.yourdomain.com
```

### Frontend (Next.js) - Additional Variables

If using Better Auth in the frontend:

```bash
# Better Auth Configuration
NEXT_PUBLIC_BETTER_AUTH_URL=https://your-auth-domain.com
NEXT_PUBLIC_BETTER_AUTH_SECRET=your_better_auth_secret_here
```

### Frontend (Next.js)

Required environment variables for the frontend service:

```bash
# Backend API URL
NEXT_PUBLIC_BACKEND_URL=https://your-backend-domain.com

# OpenAI API Key (for client-side features if needed)
NEXT_PUBLIC_OPENAI_API_KEY=your_openai_api_key_here

# Authentication
BETTER_AUTH_URL=https://your-auth-domain.com
```

## OpenAI API Key Setup

1. Create an account at [OpenAI](https://platform.openai.com/)
2. Navigate to the API Keys section in your account
3. Create a new secret key
4. Add the key to your environment variables as `OPENAI_API_KEY`
5. For frontend usage, add it as `NEXT_PUBLIC_OPENAI_API_KEY`

## Domain Allowlist Configuration for ChatKit

If using OpenAI ChatKit features:

1. In your OpenAI dashboard, locate the ChatKit domain allowlist settings
2. Add the following domains to your allowlist:
   - `localhost` (for development)
   - `*.vercel.app` (for Vercel deployments)
   - `*.render.com` (for Render deployments)
   - Your custom domain(s)

## Database Migration Steps

### Neon PostgreSQL Setup

1. Create a Neon project at [Neon](https://neon.tech/)
2. Create a new project and database
3. Get the connection string from the Neon dashboard
4. Set the `DATABASE_URL` environment variable to the connection string

### Running Migrations

The application uses SQLModel for database operations. Migrations should be run as part of the deployment process:

```bash
# Run this command in the backend container
python -m alembic upgrade head
```

## Vercel Deployment for Frontend

### Prerequisites

- Account at [Vercel](https://vercel.com/)
- Git repository with the frontend code

### Deployment Steps

1. Link your Git repository to Vercel
2. Configure the build settings:
   - Framework Preset: Next.js
   - Build Command: `npm run build`
   - Output Directory: Leave empty (Next.js handles this)
   - Root Directory: `frontend`

3. Add environment variables in the Vercel dashboard:
   - `NEXT_PUBLIC_BACKEND_URL`: URL of your deployed backend
   - `NEXT_PUBLIC_OPENAI_API_KEY`: OpenAI API key (if needed on frontend)

4. Deploy by pushing to your Git repository or triggering a manual deploy

### Example Vercel Configuration (`vercel.json`)

```json
{
  "version": 2,
  "builds": [
    {
      "src": "frontend/next.config.js",
      "use": "@vercel/next"
    }
  ],
  "routes": [
    {
      "src": "/(.*)",
      "dest": "frontend/$1"
    }
  ]
}
```

## Render Deployment for Backend

### Prerequisites

- Account at [Render](https://render.com/)
- Git repository with the backend code

### Deployment Steps

1. Create a new Web Service on Render
2. Connect your Git repository
3. Choose the following settings:
   - Environment: Python
   - Build Command: `pip install uv && uv pip install --system -r requirements.txt`
   - Start Command: `uvicorn main:app --host 0.0.0.0 --port $PORT`
   - Root Directory: `backend`

4. Add environment variables in the Render dashboard:
   - `DATABASE_URL`: Neon PostgreSQL connection string
   - `SECRET_KEY`: Random secret key (use `openssl rand -hex 32` to generate)
   - `BETTER_AUTH_SECRET`: Secret for Better Auth
   - `OPENAI_API_KEY`: OpenAI API key

5. Enable Auto-Deploy for continuous deployment

### Example Render Web Service Configuration

```yaml
services:
  - type: web
    name: todo-backend
    env: python
    region: frankfurt  # or your preferred region
    buildCommand: pip install uv && uv pip install --system -r requirements.txt
    startCommand: uvicorn main:app --host 0.0.0.0 --port $PORT
    healthCheckPath: /health
    envVars:
      - key: DATABASE_URL
        fromDatabase: todo-db
      - key: SECRET_KEY
        sync: false
      - key: BETTER_AUTH_SECRET
        sync: false
      - key: OPENAI_API_KEY
        sync: false
databases:
  - name: todo-db
    region: frankfurt
    postgresMajorVersion: 15
```

## Docker Deployment

### Building and Running Locally

To test the deployment locally:

```bash
# Copy the example environment file and fill in your values
cp .env.example .env
# Edit .env with your actual values

# Build and run the services
docker-compose up --build
```

### Production Docker Deployment

For production deployment using Docker:

1. Set up a reverse proxy (e.g., nginx) to handle SSL termination
2. Use a container orchestration platform (Docker Swarm, Kubernetes)
3. Configure external database (Neon PostgreSQL)
4. Set up environment variables securely

## Health Checks

The backend service exposes a health check endpoint:
- GET `/health` - Returns 200 OK if the service is healthy

## Monitoring and Logging

### Backend Logs

Access backend logs using:
```bash
# Docker Compose
docker-compose logs backend

# Render
View logs in the Render dashboard
```

### Frontend Analytics

Consider setting up analytics tools like:
- Vercel Analytics (built-in)
- Google Analytics
- Sentry for error tracking

## Scaling Recommendations

### Backend Service

- Start with 1GB RAM, scale based on API usage
- Monitor response times and scale horizontally if needed
- Use connection pooling for database connections

### Frontend Service

- Leverage CDN for static assets (handled by Vercel automatically)
- Optimize bundle size for faster loading
- Implement proper caching strategies

## Troubleshooting

### Common Issues

1. **Database Connection Failures**
   - Verify `DATABASE_URL` is correctly configured
   - Check that the database service is running and accessible

2. **Authentication Issues**
   - Ensure `SECRET_KEY` and `BETTER_AUTH_SECRET` are properly set
   - Verify that domain allowlists are correctly configured

3. **API Key Issues**
   - Confirm OpenAI API key is valid and has sufficient quota
   - Check that the key has the necessary permissions

### Contact Support

For deployment assistance, contact your DevOps team or consult the respective platform documentation:
- [Vercel Documentation](https://vercel.com/docs)
- [Render Documentation](https://render.com/docs)
- [Neon Documentation](https://neon.tech/docs)