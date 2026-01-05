---
name: neon-serverless-postgresql-skill
description: Use Neon Serverless PostgreSQL for database operations in FastAPI/SQLModel applications. Use for cloud-hosted PostgreSQL with instant setup, auto-scaling, branching, and connection pooling. Perfect for production deployments.
---

# Neon Serverless PostgreSQL

## Instructions

Neon is a serverless PostgreSQL platform that provides instant setup, auto-scaling, and modern developer features like database branching.

### 1. What is Neon Serverless PostgreSQL?

Neon provides:
- **Serverless** - Auto-scaling compute and storage
- **Instant setup** - Database ready in seconds
- **Branching** - Git-like database branches
- **Connection pooling** - Built-in pooling support
- **Auto-suspend** - Reduces costs when idle
- **Free tier** - Generous limits for development

**Key Features:**
- PostgreSQL 15+ compatible
- Automatic backups
- Point-in-time recovery
- SSL/TLS encryption
- Global deployment

### 2. Setup Neon Account

**Create Account:**
1. Go to [neon.tech](https://neon.tech)
2. Sign up with GitHub/Google/Email
3. Create your first project
4. Check .env file

**Or use CLI:**
```bash
# Install Neon CLI
npm install -g neonctl

# Login
neonctl auth

# Create project
neonctl projects create --name my-todo-app

# Get connection string
neonctl connection-string my-todo-app
```

### 3. Get Connection String

**From Dashboard:**
1. Go to your project dashboard
2. Click "Connection Details"
3. Copy the connection string
4. Database url must be in .env file and securely used in any file. DONT REVEAL IT!

**Connection String Format Example:**
```
postgresql://username:password@ep-xxx.us-east-2.aws.neon.tech/neondb?sslmode=require
```

**Components:**
- `username` - Database user
- `password` - Auto-generated password
- `ep-xxx.us-east-2.aws.neon.tech` - Endpoint hostname
- `neondb` - Database name (default)
- `sslmode=require` - SSL required

### 4. Environment Configuration
```python
# app/config.py
from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    # Neon Database
    database_url: str
    
    # Connection pool settings
    pool_size: int = 5
    max_overflow: int = 10
    pool_pre_ping: bool = True
    pool_recycle: int = 3600  # 1 hour
    
    # Echo SQL (development only)
    echo_sql: bool = False
    
    class Config:
        env_file = ".env"

settings = Settings()
```
```bash
# .env
DATABASE_URL=postgresql://user:pass@ep-xxx.us-east-2.aws.neon.tech/neondb?sslmode=require
POOL_SIZE=5
MAX_OVERFLOW=10
ECHO_SQL=false
```

### 5. Database Connection Setup
```python
# app/database.py
from sqlmodel import create_engine, SQLModel, Session
from app.config import settings

# Create engine with Neon-optimized settings
engine = create_engine(
    settings.database_url,
    echo=settings.echo_sql,
    pool_pre_ping=settings.pool_pre_ping,  # Verify connections before use
    pool_size=settings.pool_size,           # Connection pool size
    max_overflow=settings.max_overflow,     # Max overflow connections
    pool_recycle=settings.pool_recycle,     # Recycle connections after 1 hour
    connect_args={
        "sslmode": "require",                # SSL required
        "connect_timeout": 10,               # Connection timeout
    }
)

def create_db_and_tables():
    """Create all database tables."""
    SQLModel.metadata.create_all(engine)

def get_session():
    """Get database session with automatic cleanup."""
    with Session(engine) as session:
        yield session

def test_connection():
    """Test database connection."""
    try:
        with Session(engine) as session:
            session.exec("SELECT 1")
        print("✓ Database connection successful")
        return True
    except Exception as e:
        print(f"✗ Database connection failed: {e}")
        return False
```

### 6. Initialize Database
```python
# app/main.py
from fastapi import FastAPI
from app.database import create_db_and_tables, test_connection

app = FastAPI(title="Todo API with Neon")

@app.on_event("startup")
async def startup_event():
    """Initialize database on startup."""
    print("Starting up...")
    
    # Test connection
    if not test_connection():
        raise Exception("Failed to connect to database")
    
    # Create tables
    print("Creating database tables...")
    create_db_and_tables()
    print("Database initialized successfully!")

@app.get("/")
def read_root():
    return {"message": "Todo API with Neon PostgreSQL"}

@app.get("/health")
def health_check():
    """Health check with database status."""
    try:
        is_healthy = test_connection()
        return {
            "status": "healthy" if is_healthy else "unhealthy",
            "database": "connected" if is_healthy else "disconnected"
        }
    except Exception as e:
        return {
            "status": "unhealthy",
            "error": str(e)
        }
```

### 7. Using Connection Pooling
```python
# app/database.py (connection pooling)
from sqlalchemy.pool import QueuePool

engine = create_engine(
    settings.database_url,
    poolclass=QueuePool,
    pool_size=5,              # Maintain 5 connections
    max_overflow=10,          # Allow up to 10 additional connections
    pool_pre_ping=True,       # Verify connection before using
    pool_recycle=3600,        # Recycle connections after 1 hour
    pool_timeout=30,          # Wait 30s for connection
)
```

**Pool Configuration Guide:**
- `pool_size=5` - Good for small apps (5-10 concurrent requests)
- `pool_size=20` - Medium apps (20-50 concurrent requests)
- `pool_size=50` - Large apps (50+ concurrent requests)

### 8. Database Branching (Development)

**Create Branch:**
```bash
# Create development branch from main
neonctl branches create --name dev --parent main

# Get branch connection string
neonctl connection-string --branch dev
```

**Use Branch in Development:**
```bash
# .env.development
DATABASE_URL=postgresql://user:pass@ep-dev-xxx.neon.tech/neondb?sslmode=require

# .env.production
DATABASE_URL=postgresql://user:pass@ep-main-xxx.neon.tech/neondb?sslmode=require
```

**Branch Workflow:**
1. Create feature branch
2. Develop against branch database
3. Test changes
4. Merge to main branch
5. Deploy to production

### 9. Migrations with Alembic
```bash
# Install Alembic
pip install alembic

# Or with UV
uv add alembic
```
```bash
# Initialize Alembic
alembic init alembic

# This creates:
# alembic/
# ├── env.py
# ├── script.py.mako
# └── versions/
# alembic.ini
```

**Configure Alembic:**
```python
# alembic/env.py
from logging.config import fileConfig
from sqlalchemy import engine_from_config, pool
from alembic import context
from app.config import settings
from app.models import *  # Import all models
from sqlmodel import SQLModel

# this is the Alembic Config object
config = context.config

# Set database URL from settings
config.set_main_option("sqlalchemy.url", settings.database_url)

# Interpret the config file for Python logging
if config.config_file_name is not None:
    fileConfig(config.config_file_name)

# Add your model's MetaData object here for 'autogenerate' support
target_metadata = SQLModel.metadata

def run_migrations_offline() -> None:
    """Run migrations in 'offline' mode."""
    url = config.get_main_option("sqlalchemy.url")
    context.configure(
        url=url,
        target_metadata=target_metadata,
        literal_binds=True,
        dialect_opts={"paramstyle": "named"},
    )

    with context.begin_transaction():
        context.run_migrations()

def run_migrations_online() -> None:
    """Run migrations in 'online' mode."""
    connectable = engine_from_config(
        config.get_section(config.config_ini_section),
        prefix="sqlalchemy.",
        poolclass=pool.NullPool,
    )

    with connectable.connect() as connection:
        context.configure(
            connection=connection,
            target_metadata=target_metadata
        )

        with context.begin_transaction():
            context.run_migrations()

if context.is_offline_mode():
    run_migrations_offline()
else:
    run_migrations_online()
```

**Create and Run Migrations:**
```bash
# Generate migration from models
alembic revision --autogenerate -m "Initial migration"

# Review migration file in alembic/versions/

# Apply migration
alembic upgrade head

# Rollback migration
alembic downgrade -1

# Check current version
alembic current
```

### 10. Query Optimization
```python
# app/services/todo_service.py
from sqlmodel import Session, select, col
from typing import List

class TodoService:
    @staticmethod
    def get_todos_optimized(
        user_id: int,
        session: Session,
        skip: int = 0,
        limit: int = 100
    ) -> List[Todo]:
        """Get todos with optimized query."""
        statement = (
            select(Todo)
            .where(Todo.user_id == user_id)
            .offset(skip)
            .limit(limit)
            .order_by(Todo.created_at.desc())
        )
        
        # Execute query
        todos = session.exec(statement).all()
        return todos
    
    @staticmethod
    def get_todos_with_count(
        user_id: int,
        session: Session
    ) -> dict:
        """Get todos with total count (single query)."""
        from sqlalchemy import func
        
        # Get todos and count in one query
        statement = select(Todo, func.count().over()).where(
            Todo.user_id == user_id
        )
        
        results = session.exec(statement).all()
        
        if not results:
            return {"todos": [], "total": 0}
        
        todos = [r[0] for r in results]
        total = results[0][1] if results else 0
        
        return {"todos": todos, "total": total}
    
    @staticmethod
    def batch_create_todos(
        todos_data: List[TodoCreate],
        user_id: int,
        session: Session
    ) -> List[Todo]:
        """Create multiple todos efficiently."""
        todos = [
            Todo.from_orm(data, update={"user_id": user_id})
            for data in todos_data
        ]
        
        # Bulk insert
        session.add_all(todos)
        session.commit()
        
        # Refresh all
        for todo in todos:
            session.refresh(todo)
        
        return todos
```

## Examples

### Example 1: Complete Neon Setup
```python
# app/config.py
from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    # Neon PostgreSQL
    database_url: str
    
    # Connection pooling
    pool_size: int = 10
    max_overflow: int = 20
    pool_pre_ping: bool = True
    pool_recycle: int = 3600
    
    # Query settings
    echo_sql: bool = False
    
    # App settings
    app_name: str = "Todo API"
    environment: str = "production"
    
    class Config:
        env_file = ".env"

settings = Settings()
```
```python
# app/database.py
from sqlmodel import create_engine, SQLModel, Session
from sqlalchemy.pool import QueuePool
from app.config import settings
import logging

logger = logging.getLogger(__name__)

# Create engine with Neon optimizations
engine = create_engine(
    settings.database_url,
    echo=settings.echo_sql,
    poolclass=QueuePool,
    pool_size=settings.pool_size,
    max_overflow=settings.max_overflow,
    pool_pre_ping=True,
    pool_recycle=settings.pool_recycle,
    pool_timeout=30,
    connect_args={
        "sslmode": "require",
        "connect_timeout": 10,
        "application_name": settings.app_name,
    }
)

def create_db_and_tables():
    """Create all database tables."""
    try:
        SQLModel.metadata.create_all(engine)
        logger.info("Database tables created successfully")
    except Exception as e:
        logger.error(f"Failed to create tables: {e}")
        raise

def get_session():
    """Get database session."""
    with Session(engine) as session:
        try:
            yield session
        except Exception as e:
            logger.error(f"Session error: {e}")
            session.rollback()
            raise
        finally:
            session.close()

def test_connection() -> bool:
    """Test database connection."""
    try:
        with Session(engine) as session:
            result = session.exec("SELECT version()").first()
            logger.info(f"Connected to: {result}")
        return True
    except Exception as e:
        logger.error(f"Connection test failed: {e}")
        return False

def close_db_connection():
    """Close database connection pool."""
    engine.dispose()
    logger.info("Database connections closed")
```
```python
# app/main.py
from fastapi import FastAPI
from contextlib import asynccontextmanager
from app.database import create_db_and_tables, test_connection, close_db_connection
import logging

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

@asynccontextmanager
async def lifespan(app: FastAPI):
    """Manage application lifespan."""
    # Startup
    logger.info("Application starting up...")
    
    if not test_connection():
        raise Exception("Failed to connect to Neon database")
    
    create_db_and_tables()
    logger.info("Application ready!")
    
    yield
    
    # Shutdown
    logger.info("Application shutting down...")
    close_db_connection()
    logger.info("Application stopped")

app = FastAPI(
    title="Todo API with Neon",
    lifespan=lifespan
)

@app.get("/")
def read_root():
    return {"message": "Todo API powered by Neon PostgreSQL"}

@app.get("/health")
def health_check():
    """Detailed health check."""
    db_status = test_connection()
    
    return {
        "status": "healthy" if db_status else "unhealthy",
        "database": {
            "connected": db_status,
            "type": "PostgreSQL",
            "provider": "Neon Serverless"
        }
    }
```

### Example 2: Environment-Specific Databases
```bash
# .env.development
DATABASE_URL=postgresql://user:pass@ep-dev-xxx.neon.tech/neondb?sslmode=require
POOL_SIZE=5
ECHO_SQL=true
ENVIRONMENT=development

# .env.staging
DATABASE_URL=postgresql://user:pass@ep-staging-xxx.neon.tech/neondb?sslmode=require
POOL_SIZE=10
ECHO_SQL=false
ENVIRONMENT=staging

# .env.production
DATABASE_URL=postgresql://user:pass@ep-prod-xxx.neon.tech/neondb?sslmode=require
POOL_SIZE=20
ECHO_SQL=false
ENVIRONMENT=production
```
```python
# scripts/switch_env.py
import os
import shutil

def switch_environment(env: str):
    """Switch to different environment."""
    env_file = f".env.{env}"
    
    if not os.path.exists(env_file):
        print(f"Error: {env_file} not found")
        return
    
    # Backup current .env
    if os.path.exists(".env"):
        shutil.copy(".env", ".env.backup")
    
    # Copy environment file
    shutil.copy(env_file, ".env")
    print(f"✓ Switched to {env} environment")

if __name__ == "__main__":
    import sys
    if len(sys.argv) < 2:
        print("Usage: python switch_env.py [development|staging|production]")
    else:
        switch_environment(sys.argv[1])
```

### Example 3: Connection Retry Logic
```python
# app/database.py (with retry)
from sqlmodel import create_engine, Session
from tenacity import retry, stop_after_attempt, wait_exponential
import logging

logger = logging.getLogger(__name__)

@retry(
    stop=stop_after_attempt(3),
    wait=wait_exponential(multiplier=1, min=2, max=10),
    reraise=True
)
def create_engine_with_retry(database_url: str):
    """Create engine with retry logic."""
    logger.info("Attempting to connect to database...")
    
    engine = create_engine(
        database_url,
        pool_pre_ping=True,
        pool_size=10,
        max_overflow=20,
        connect_args={
            "sslmode": "require",
            "connect_timeout": 10,
        }
    )
    
    # Test connection
    with Session(engine) as session:
        session.exec("SELECT 1")
    
    logger.info("Database connection established")
    return engine

# Use in app
try:
    engine = create_engine_with_retry(settings.database_url)
except Exception as e:
    logger.error(f"Failed to connect after retries: {e}")
    raise
```

### Example 4: Read Replicas (Neon Scale Plan)
```python
# app/config.py
class Settings(BaseSettings):
    # Primary database (writes)
    database_url: str
    
    # Read replica (reads)
    database_read_url: str | None = None
    
    class Config:
        env_file = ".env"

settings = Settings()
```
```python
# app/database.py (with read replica)
from sqlmodel import create_engine

# Primary engine (writes)
write_engine = create_engine(
    settings.database_url,
    pool_size=10,
    max_overflow=20,
)

# Read replica engine (reads)
read_engine = create_engine(
    settings.database_read_url or settings.database_url,
    pool_size=20,  # More connections for reads
    max_overflow=30,
)

def get_write_session():
    """Get session for write operations."""
    with Session(write_engine) as session:
        yield session

def get_read_session():
    """Get session for read operations."""
    with Session(read_engine) as session:
        yield session
```
```python
# Usage in routes
@app.get("/todos/")
def get_todos(session: Session = Depends(get_read_session)):
    """Read from replica."""
    return session.exec(select(Todo)).all()

@app.post("/todos/")
def create_todo(
    todo: TodoCreate,
    session: Session = Depends(get_write_session)
):
    """Write to primary."""
    db_todo = Todo.from_orm(todo)
    session.add(db_todo)
    session.commit()
    return db_todo
```

### Example 5: Database Monitoring
```python
# app/monitoring/database.py
from sqlalchemy import event
from sqlalchemy.engine import Engine
from time import time
import logging

logger = logging.getLogger(__name__)

# Track query execution time
@event.listens_for(Engine, "before_cursor_execute")
def before_cursor_execute(conn, cursor, statement, parameters, context, executemany):
    """Log query start time."""
    conn.info.setdefault('query_start_time', []).append(time())

@event.listens_for(Engine, "after_cursor_execute")
def after_cursor_execute(conn, cursor, statement, parameters, context, executemany):
    """Log query execution time."""
    total = time() - conn.info['query_start_time'].pop(-1)
    
    if total > 1.0:  # Log slow queries (> 1 second)
        logger.warning(f"Slow query ({total:.2f}s): {statement[:100]}")

# Track connection pool stats
from sqlalchemy.pool import Pool

@event.listens_for(Pool, "connect")
def receive_connect(dbapi_conn, connection_record):
    """Track new connections."""
    logger.info("New database connection established")

@event.listens_for(Pool, "checkout")
def receive_checkout(dbapi_conn, connection_record, connection_proxy):
    """Track connection checkouts."""
    logger.debug("Connection checked out from pool")

@event.listens_for(Pool, "checkin")
def receive_checkin(dbapi_conn, connection_record):
    """Track connection checkins."""
    logger.debug("Connection returned to pool")
```
```python
# app/routers/monitoring.py
from fastapi import APIRouter, Depends
from sqlmodel import Session
from app.database import engine, get_session

router = APIRouter(prefix="/monitoring", tags=["monitoring"])

@router.get("/database/stats")
def get_database_stats():
    """Get database connection pool statistics."""
    pool = engine.pool
    
    return {
        "pool_size": pool.size(),
        "checked_in": pool.checkedin(),
        "checked_out": pool.checkedout(),
        "overflow": pool.overflow(),
        "total_connections": pool.size() + pool.overflow(),
    }

@router.get("/database/test")
def test_database_query(session: Session = Depends(get_session)):
    """Test database with simple query."""
    from time import time
    
    start = time()
    result = session.exec("SELECT 1 as test").first()
    duration = time() - start
    
    return {
        "status": "ok",
        "query_time_ms": round(duration * 1000, 2),
        "result": result
    }
```

### Example 6: Backup and Restore
```bash
# Backup database
pg_dump $DATABASE_URL > backup.sql

# Or with Neon CLI
neonctl branches create --name backup-$(date +%Y%m%d)

# Restore from backup
psql $DATABASE_URL < backup.sql

# Restore from Neon branch
neonctl branches restore --branch backup-20240104 --target main
```
```python
# scripts/backup.py
import subprocess
import os
from datetime import datetime
from app.config import settings

def backup_database():
    """Backup database to SQL file."""
    timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
    filename = f"backup_{timestamp}.sql"
    
    try:
        # Run pg_dump
        result = subprocess.run(
            ["pg_dump", settings.database_url, "-f", filename],
            capture_output=True,
            text=True
        )
        
        if result.returncode == 0:
            print(f"✓ Backup created: {filename}")
            return filename
        else:
            print(f"✗ Backup failed: {result.stderr}")
            return None
            
    except Exception as e:
        print(f"✗ Backup error: {e}")
        return None

if __name__ == "__main__":
    backup_database()
```

## Best Practices

### ✅ DO:

1. **Use connection pooling**
```python
   pool_size=10
   max_overflow=20
   pool_pre_ping=True
```

2. **Enable SSL/TLS**
```python
   connect_args={"sslmode": "require"}
```

3. **Set connection timeouts**
```python
   connect_args={"connect_timeout": 10}
```

4. **Use database branching for development**
```bash
   neonctl branches create --name dev
```

5. **Monitor slow queries**
```python
   # Log queries > 1 second
   if execution_time > 1.0:
       logger.warning(f"Slow query: {query}")
```

6. **Use migrations for schema changes**
```bash
   alembic revision --autogenerate -m "Add column"
   alembic upgrade head
```

### ❌ DON'T:

1. **Don't hardcode credentials**
```python
   # ❌ Bad
   DATABASE_URL = "postgresql://user:pass@host/db"
   
   # ✅ Good
   DATABASE_URL = os.getenv("DATABASE_URL")
```

2. **Don't skip connection pooling**
```python
   # ❌ Bad - no pooling
   engine = create_engine(url)
   
   # ✅ Good - with pooling
   engine = create_engine(url, pool_size=10)
```

3. **Don't ignore connection errors**
```python
   # ✅ Always handle connection errors
   try:
       session.exec(query)
   except Exception as e:
       logger.error(f"Database error: {e}")
       raise
```

4. **Don't use same pool size for all environments**
```python
   # ✅ Adjust per environment
   pool_size = 5 if is_dev else 20
```

5. **Don't expose connection strings in logs**
```python
   # ❌ Bad
   logger.info(f"Connecting to {DATABASE_URL}")
   
   # ✅ Good
   logger.info("Connecting to database")
```

---

## Summary

Neon Serverless PostgreSQL provides:
- ⚡ **Instant setup** - Database ready in seconds
- 🔄 **Auto-scaling** - Scales with your load
- 🌿 **Branching** - Git-like database branches
- 💰 **Cost-effective** - Pay only for what you use
- 🔒 **Secure** - SSL/TLS encryption built-in
- 🌍 **Global** - Deploy anywhere
- 📊 **PostgreSQL** - Full PostgreSQL compatibility
- 🆓 **Free tier** - Generous free plan

Use Neon for modern, scalable PostgreSQL databases in your FastAPI/SQLModel applications.