#info about database
from .config import get_settings
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.orm import declarative_base

# entry point to the database
engine= create_engine(
    get_settings().db_url, connect_args={"check_same_thread": False})

# creates database session when instantiated
SessionLocal=sessionmaker(autocommit=False,autoflush=False,bind=engine)
#connects database engine to sqlalc functions
Base=declarative_base()