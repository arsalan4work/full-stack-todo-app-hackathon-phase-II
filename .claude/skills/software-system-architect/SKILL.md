---
name: software-system-architect-skill
description: Design and architect enterprise-grade, scalable web applications that handle millions of users. Use when planning system architecture, choosing tech stacks, designing databases, implementing authentication systems, setting up deployment pipelines, or making critical architectural decisions. Specializes in Python/FastAPI + Next.js + Neon PostgreSQL stack.
---

# Software System Architecture Skill

## Instructions

Design robust, scalable, and maintainable software systems following enterprise architecture principles using our available tech

### 1. **System Design Fundamentals**

#### Architecture Patterns
- **Monolithic Architecture**: Single deployable unit, good for MVPs and small teams
  - When to use: Small to medium apps, quick iteration, limited team
  - Limitations: Scaling challenges, deployment risks, tech stack lock-in
  
- **Microservices Architecture**: Distributed services with independent deployment
  - When to use: Large teams, different scaling needs, polyglot requirements
  - Trade-offs: Complexity, network overhead, distributed debugging
  
- **Serverless Architecture**: Event-driven, auto-scaling functions
  - When to use: Variable traffic, event processing, cost optimization
  - Considerations: Cold starts, vendor lock-in, debugging complexity
  
- **Hybrid Architecture**: Combination of patterns (recommended for most cases)
  - Core services: Monolith for business logic
  - Specialized services: Microservices for specific needs
  - Edge functions: Serverless for CDN/edge computing

#### Layered Architecture Pattern
```
┌─────────────────────────────────────┐
│     Presentation Layer (UI)         │ ← Next.js 16 (App Router, RSC)
├─────────────────────────────────────┤
│     API/Gateway Layer               │ ← Route Handlers, Server Actions
├─────────────────────────────────────┤
│     Business Logic Layer            │ ← FastAPI Services, Domain Logic
├─────────────────────────────────────┤
│     Data Access Layer               │ ← SQLModel, Repository Pattern
├─────────────────────────────────────┤
│     Data Storage Layer              │ ← Neon PostgreSQL, Redis Cache
└─────────────────────────────────────┘
```

### 2. **Tech Stack Selection (Modern Python + Next.js Stack)**

#### Frontend Stack
- **Framework**: Next.js 16 with App Router
  - Server Components for performance
  - Server Actions for mutations
  - Built-in optimizations (Image, Font, Script)
  - Edge runtime support
  
- **State Management**: 
  - Server state: React Server Components
  - Client state: React hooks (useState, useReducer)
  - Complex state: Zustand or Jotai (lightweight)
  - Avoid: Redux (too heavy for modern apps)
  
- **Styling**: Tailwind CSS
  - Utility-first, highly performant
  - Dark mode built-in
  - Custom design system via tailwind.config
  
- **UI Components**: shadcn/ui + Radix UI
  - Unstyled primitives
  - Accessible by default
  - Customizable styling
  
- **Forms**: React Hook Form + Zod
  - Type-safe validation
  - Minimal re-renders
  - Server-side validation integration

#### Backend Stack
- **API Framework**: FastAPI
  - Async/await for high concurrency
  - Automatic OpenAPI documentation
  - Type safety with Pydantic
  - High performance (comparable to Node.js)
  
- **ORM**: SQLModel
  - Combines SQLAlchemy + Pydantic
  - Type-safe database operations
  - FastAPI integration
  - Async support with asyncpg
  
- **Database**: Neon Serverless PostgreSQL
  - Auto-scaling compute and storage
  - Instant provisioning
  - Database branching for dev/staging
  - Built-in connection pooling
  - Point-in-time recovery
  
- **Authentication**: 
  - **Better Auth** (for full-featured auth system)
    - Email/password, OAuth, 2FA, passkeys
    - Session management
    - Framework-agnostic
  - **JWT Tokens** (for API-only auth)
    - Stateless authentication
    - Access + refresh tokens
    - Bcrypt for password hashing

#### Infrastructure & DevOps
- **Hosting**: 
  - Frontend: Vercel (optimized for Next.js)
  - Backend: DigitalOcean App Platform, Railway, or Vercel
  - Database: Neon (managed PostgreSQL)
  
- **Caching**: Redis (Upstash or self-hosted)
  - Session storage
  - Rate limiting
  - API response caching
  - Real-time features (pub/sub)
  
- **CDN**: Vercel Edge Network or Cloudflare
  - Static asset delivery
  - Edge functions for dynamic content
  - DDoS protection
  
- **Monitoring**: 
  - Application: Sentry (error tracking)
  - Performance: Vercel Analytics or Posthog
  - Logs: Better Stack or Datadog
  - Uptime: UptimeRobot or Pingdom

### 3. **Database Design for Scale**

#### Schema Design Principles
```sql
-- ✅ Good: Normalized, indexed, with constraints
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    username VARCHAR(50) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    is_active BOOLEAN DEFAULT true,
    INDEX idx_email (email),
    INDEX idx_username (username)
);

CREATE TABLE posts (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    content TEXT,
    slug VARCHAR(255) UNIQUE NOT NULL,
    published_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_user_id (user_id),
    INDEX idx_slug (slug),
    INDEX idx_published (published_at) WHERE published_at IS NOT NULL
);
```

#### Indexing Strategy
- **Primary Keys**: Auto-incrementing integers (SERIAL)
- **Foreign Keys**: Always indexed for JOIN performance
- **Unique Constraints**: Email, username, slugs
- **Composite Indexes**: For common query patterns
```sql
  INDEX idx_user_status (user_id, status, created_at DESC)
```
- **Partial Indexes**: For filtered queries
```sql
  INDEX idx_active_users (email) WHERE is_active = true
```

#### Query Optimization
- **N+1 Problem**: Use eager loading with SQLModel
```python
  # ❌ Bad: N+1 queries
  users = await session.exec(select(User)).all()
  for user in users:
      posts = await session.exec(select(Post).where(Post.user_id == user.id)).all()
  
  # ✅ Good: Single query with join
  statement = select(User).options(selectinload(User.posts))
  users = await session.exec(statement).all()
```

- **Pagination**: Always paginate large datasets
```python
  statement = select(Post).offset(skip).limit(page_size).order_by(Post.created_at.desc())
```

- **Connection Pooling**: Configure for concurrent requests
```python
  engine = create_async_engine(
      DATABASE_URL,
      pool_size=20,          # Base connections
      max_overflow=10,       # Extra connections under load
      pool_pre_ping=True,    # Verify connection health
      pool_recycle=3600      # Recycle connections every hour
  )
```

### 4. **API Design Best Practices**

#### RESTful API Structure
```
/api/v1/
├── /auth
│   ├── POST /register
│   ├── POST /login
│   ├── POST /refresh
│   └── POST /logout
├── /users
│   ├── GET    /users          (list with pagination)
│   ├── POST   /users          (create)
│   ├── GET    /users/{id}     (retrieve)
│   ├── PUT    /users/{id}     (full update)
│   ├── PATCH  /users/{id}     (partial update)
│   └── DELETE /users/{id}     (delete)
└── /posts
    ├── GET    /posts
    ├── POST   /posts
    ├── GET    /posts/{slug}
    ├── PUT    /posts/{id}
    └── DELETE /posts/{id}
```

#### Response Standards
```python
# Success Response (200, 201)
{
  "success": true,
  "data": {...},
  "meta": {
    "page": 1,
    "per_page": 20,
    "total": 150
  }
}

# Error Response (400, 401, 403, 404, 500)
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid input data",
    "details": [
      {"field": "email", "message": "Invalid email format"}
    ]
  }
}
```

#### API Versioning
- **URL Versioning**: `/api/v1/`, `/api/v2/` (recommended)
- **Header Versioning**: `Accept: application/vnd.api+json; version=1`
- **Backward Compatibility**: Maintain old versions for 6-12 months

#### Rate Limiting
```python
from fastapi import Request
from fastapi.responses import JSONResponse
import time

# Simple in-memory rate limiter (use Redis in production)
rate_limit_store = {}

async def rate_limit_middleware(request: Request, call_next):
    client_ip = request.client.host
    current_time = time.time()
    
    if client_ip in rate_limit_store:
        requests, window_start = rate_limit_store[client_ip]
        if current_time - window_start < 60:  # 1-minute window
            if requests >= 100:  # 100 requests per minute
                return JSONResponse(
                    status_code=429,
                    content={"error": "Rate limit exceeded"}
                )
            rate_limit_store[client_ip] = (requests + 1, window_start)
        else:
            rate_limit_store[client_ip] = (1, current_time)
    else:
        rate_limit_store[client_ip] = (1, current_time)
    
    return await call_next(request)
```

### 5. **Authentication & Security Architecture**

#### Authentication Flow (JWT)
```
1. User Login
   ↓
2. Validate Credentials (bcrypt)
   ↓
3. Generate Access Token (15 min expiry)
   ↓
4. Generate Refresh Token (7 days expiry)
   ↓
5. Store Refresh Token (database, hashed)
   ↓
6. Return Both Tokens
   ↓
7. Client Stores Tokens (httpOnly cookies or secure storage)
   ↓
8. API Requests (Authorization: Bearer {access_token})
   ↓
9. Token Expiry → Use Refresh Token
   ↓
10. Refresh Token Rotation (one-time use)
```

#### Security Checklist
- [x] **Password Security**
  - Bcrypt with 12+ rounds
  - Minimum length: 8 characters
  - Complexity requirements
  - Password history (prevent reuse)
  
- [x] **Token Security**
  - Short-lived access tokens (15-30 min)
  - Long-lived refresh tokens (7-30 days)
  - Token rotation on refresh
  - Refresh token blacklist/whitelist
  
- [x] **API Security**
  - HTTPS only in production
  - CORS configuration
  - Rate limiting per IP/user
  - Input validation (Pydantic)
  - SQL injection prevention (parameterized queries)
  - XSS prevention (sanitize inputs)
  - CSRF protection (SameSite cookies)
  
- [x] **Infrastructure Security**
  - Environment variables for secrets
  - Secret rotation policy
  - Database connection encryption (SSL)
  - Regular dependency updates
  - Security headers (helmet.js equivalent)

### 6. **Scalability Patterns**

#### Horizontal Scaling
```
Load Balancer (Vercel/Nginx)
    ↓
┌────────┬────────┬────────┐
│ App 1  │ App 2  │ App 3  │ ← Multiple instances
└────────┴────────┴────────┘
    ↓
Database (Neon with connection pooling)
```

#### Caching Strategy (Multi-Layer)
```
Request
  ↓
┌──────────────────┐
│ CDN Cache        │ ← Static assets (CSS, JS, images)
│ (Vercel/CF)      │   TTL: 1 year
└──────────────────┘
  ↓ (cache miss)
┌──────────────────┐
│ Redis Cache      │ ← API responses, sessions
│ (Upstash)        │   TTL: 5-60 minutes
└──────────────────┘
  ↓ (cache miss)
┌──────────────────┐
│ Database         │ ← Source of truth
│ (Neon)           │
└──────────────────┘
```

#### Database Scaling
- **Read Replicas**: Neon supports read replicas for read-heavy workloads
- **Connection Pooling**: PgBouncer or Neon's built-in pooler
- **Query Optimization**: Indexes, EXPLAIN ANALYZE, slow query logs
- **Sharding**: Partition data by user ID, region (only if absolutely necessary)

#### Async Processing
```python
# For long-running tasks
from fastapi import BackgroundTasks

@app.post("/send-email")
async def send_email(
    email: EmailSchema,
    background_tasks: BackgroundTasks
):
    background_tasks.add_task(send_email_task, email)
    return {"message": "Email queued"}

# For complex workflows: Use Celery + Redis
from celery import Celery

celery_app = Celery('tasks', broker='redis://localhost:6379/0')

@celery_app.task
def process_video(video_id: int):
    # Heavy processing here
    pass
```

### 7. **Observability & Monitoring**

#### Logging Strategy
```python
import logging
import structlog

# Structured logging for production
logger = structlog.get_logger()

logger.info(
    "user_login",
    user_id=user.id,
    ip_address=request.client.host,
    user_agent=request.headers.get("user-agent")
)

# Error logging with context
try:
    result = await process_payment(payment_data)
except Exception as e:
    logger.error(
        "payment_processing_failed",
        user_id=user.id,
        amount=payment_data.amount,
        error=str(e),
        exc_info=True
    )
    raise
```

#### Metrics to Track
- **Application Metrics**
  - Request rate (requests/second)
  - Response time (p50, p95, p99)
  - Error rate (4xx, 5xx)
  - Active users (concurrent)
  
- **Database Metrics**
  - Query duration
  - Connection pool usage
  - Slow queries (>100ms)
  - Deadlocks and lock waits
  
- **Infrastructure Metrics**
  - CPU usage
  - Memory usage
  - Disk I/O
  - Network bandwidth

#### Health Check Endpoints
```python
@app.get("/health")
async def health_check():
    return {
        "status": "healthy",
        "timestamp": datetime.utcnow(),
        "version": "1.0.0"
    }

@app.get("/health/detailed")
async def detailed_health_check(session: AsyncSession):
    checks = {
        "database": await check_database(session),
        "redis": await check_redis(),
        "external_api": await check_external_service()
    }
    
    all_healthy = all(check["status"] == "healthy" for check in checks.values())
    
    return {
        "status": "healthy" if all_healthy else "degraded",
        "checks": checks,
        "timestamp": datetime.utcnow()
    }
```

### 8. **CI/CD Pipeline**

#### GitHub Actions Workflow
```yaml
name: CI/CD Pipeline

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Set up Python
        uses: actions/setup-python@v4
        with:
          python-version: '3.13'
      
      - name: Install dependencies
        run: |
          pip install uv
          uv pip install -r requirements.txt
      
      - name: Run tests
        run: pytest tests/ --cov=app --cov-report=xml
      
      - name: Lint code
        run: ruff check .
      
      - name: Type check
        run: mypy app/

  deploy:
    needs: test
    if: github.ref == 'refs/heads/main'
    runs-on: ubuntu-latest
    steps:
      - name: Deploy to Vercel
        uses: amondnet/vercel-action@v20
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.ORG_ID }}
          vercel-project-id: ${{ secrets.PROJECT_ID }}
```

### 9. **Disaster Recovery & Backup**

#### Backup Strategy
- **Database Backups**
  - Automated daily backups (Neon built-in)
  - Point-in-time recovery (PITR)
  - Test recovery process quarterly
  - Off-site backup storage
  
- **Application State**
  - Configuration as code (Git)
  - Environment variables in secret manager
  - Infrastructure as code (Terraform/Pulumi)
  
- **Recovery Time Objective (RTO)**: < 1 hour
- **Recovery Point Objective (RPO)**: < 15 minutes

#### Rollback Strategy
```bash
# Blue-green deployment on Vercel
vercel deploy --prod  # Deploy new version (green)
# If issues detected:
vercel rollback       # Instant rollback to previous (blue)

# Database migrations rollback
alembic downgrade -1  # Rollback last migration
```

### 10. **Performance Optimization**

#### Frontend Optimization
- **Code Splitting**: Automatic with Next.js App Router
- **Image Optimization**: next/image with WebP/AVIF
- **Font Optimization**: next/font with font subsetting
- **Static Generation**: Use generateStaticParams for static pages
- **Incremental Static Regeneration (ISR)**: Revalidate static pages
```typescript
  export const revalidate = 3600 // Revalidate every hour
```

#### Backend Optimization
- **Database Query Optimization**
```python
  # Use select_related / prefetch_related equivalent
  statement = select(User).options(
      selectinload(User.posts),
      selectinload(User.profile)
  )
```
  
- **API Response Caching**
```python
  from fastapi_cache import FastAPICache
  from fastapi_cache.backends.redis import RedisBackend
  
  @app.get("/posts")
  @cache(expire=300)  # Cache for 5 minutes
  async def get_posts():
      return await fetch_posts()
```
  
- **Compression**: Enable gzip/brotli compression
- **Connection Keep-Alive**: Reuse HTTP connections

## Examples

### Example 1: High-Traffic Blog Platform Architecture
```
Tech Stack:
- Frontend: Next.js 16 (Vercel)
- Backend: FastAPI (DigitalOcean)
- Database: Neon PostgreSQL
- Cache: Upstash Redis
- Auth: Better Auth
- Monitoring: Sentry + Vercel Analytics

Architecture:
┌──────────────┐
│    Users     │
└──────┬───────┘
       │
┌──────▼───────────────────────┐
│  Vercel CDN + Edge Network   │
└──────┬───────────────────────┘
       │
┌──────▼───────────────────────┐
│  Next.js App (Server + Client)│
│  - Static blog posts (ISR)    │
│  - Dynamic user dashboard     │
└──────┬───────────────────────┘
       │
┌──────▼───────────────────────┐
│  FastAPI Backend             │
│  - REST API                  │
│  - Admin operations          │
└──────┬───────────────────────┘
       │
┌──────▼──────┬────────────────┐
│  Neon DB    │  Redis Cache   │
│  (Primary)  │  (Sessions)    │
└─────────────┴────────────────┘

Scalability:
- Handles 10M page views/month
- 100K registered users
- <200ms API response time
- 99.9% uptime
```

### Example 2: SaaS Application with Multi-Tenancy
```python
# Multi-tenant data isolation
class Tenant(SQLModel, table=True):
    id: int | None = Field(default=None, primary_key=True)
    name: str
    subdomain: str = Field(unique=True)
    plan: str  # free, pro, enterprise
    created_at: datetime = Field(default_factory=datetime.utcnow)

class User(SQLModel, table=True):
    id: int | None = Field(default=None, primary_key=True)
    tenant_id: int = Field(foreign_key="tenant.id")
    email: str
    # Row-level security
    
# Middleware to inject tenant context
@app.middleware("http")
async def tenant_middleware(request: Request, call_next):
    subdomain = request.headers.get("host").split(".")[0]
    tenant = await get_tenant_by_subdomain(subdomain)
    request.state.tenant = tenant
    return await call_next(request)

# Queries automatically filtered by tenant
async def get_users(request: Request, session: AsyncSession):
    tenant_id = request.state.tenant.id
    statement = select(User).where(User.tenant_id == tenant_id)
    return await session.exec(statement).all()
```

### Example 3: Real-Time Features with WebSockets
```python
from fastapi import WebSocket
from typing import List

class ConnectionManager:
    def __init__(self):
        self.active_connections: List[WebSocket] = []
    
    async def connect(self, websocket: WebSocket):
        await websocket.accept()
        self.active_connections.append(websocket)
    
    def disconnect(self, websocket: WebSocket):
        self.active_connections.remove(websocket)
    
    async def broadcast(self, message: str):
        for connection in self.active_connections:
            await connection.send_text(message)

manager = ConnectionManager()

@app.websocket("/ws/notifications")
async def websocket_endpoint(websocket: WebSocket, user_id: int):
    await manager.connect(websocket)
    try:
        while True:
            data = await websocket.receive_text()
            await manager.broadcast(f"User {user_id}: {data}")
    except WebSocketDisconnect:
        manager.disconnect(websocket)
```

## Architecture Decision Records (ADR)

### ADR Template
```markdown
# ADR-001: Choose Next.js 16 for Frontend

## Status
Accepted

## Context
Need to build a modern, SEO-friendly web application with excellent performance.

## Decision
Use Next.js 16 with App Router as the frontend framework.

## Consequences
Positive:
- Excellent SEO with Server Components
- Built-in optimizations (Image, Font, Script)
- Great developer experience
- Vercel deployment optimization

Negative:
- Learning curve for Server Components
- Vendor preference for Vercel hosting
- Less flexibility than pure React

## Alternatives Considered
- Remix: Similar features but smaller ecosystem
- Vite + React: More flexibility but manual optimization
- SvelteKit: Great performance but smaller community
```

## System Design Checklist

Before finalizing architecture:

- [ ] **Scalability**: Can handle 10x current traffic?
- [ ] **Reliability**: Single points of failure identified and mitigated?
- [ ] **Security**: Authentication, authorization, encryption in place?
- [ ] **Performance**: Response times under 200ms for most requests?
- [ ] **Observability**: Logging, monitoring, alerting configured?
- [ ] **Disaster Recovery**: Backup and rollback procedures documented?
- [ ] **Cost**: Infrastructure costs fit within budget at scale?
- [ ] **Maintainability**: Code is testable, documented, and organized?
- [ ] **Developer Experience**: Easy to set up locally and deploy?
- [ ] **Compliance**: Meets regulatory requirements (GDPR, HIPAA, etc.)?