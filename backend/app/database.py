import os
from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
import time

# Use different database URLs based on environment
if os.getenv('DOCKER_ENV') == 'true':
    SQLALCHEMY_DATABASE_URL = "postgresql://postgres:postgres@db:5432/location_tracker"
else:
    SQLALCHEMY_DATABASE_URL = "postgresql://postgres:postgres@localhost:5432/location_tracker"

# Add connection retry logic
def get_engine():
    max_retries = 5
    retry_interval = 5
    
    for attempt in range(max_retries):
        try:
            engine = create_engine(SQLALCHEMY_DATABASE_URL)
            # Test the connection
            with engine.connect() as conn:
                pass
            return engine
        except Exception as e:
            if attempt == max_retries - 1:
                raise e
            print(f"Database connection attempt {attempt + 1} failed. Retrying in {retry_interval} seconds...")
            time.sleep(retry_interval)

engine = get_engine()
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()

def init_db():
    """Initialize database tables if they don't exist"""
    # Import models here to avoid circular imports
    from . import models
    Base.metadata.create_all(bind=engine)

# Initialize database when module is imported
init_db()

def get_db():
    """Get database session"""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()