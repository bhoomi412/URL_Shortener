from sqlalchemy.orm import Session
from . import models, schemas, keygen

def create_db_url(db: Session, url: schemas.URLBase) -> models.URL:
    unique_key=keygen.create_unique_key(db)
    db_url = models.URL(
        target_url=url.target_url,
        key=unique_key,
        secret_key=f"{unique_key}_{keygen.create_key(length=8)}"
    )
    db.add(db_url)
    db.commit()
    db.refresh(db_url)
    return db_url

def get_db_url_by_key(db: Session, url_key: str) -> models.URL:
    return (
        db.query(models.URL)
        .filter(models.URL.key == url_key, models.URL.is_active) # type: ignore
        .first()
    )

def create_user(db: Session, user: schemas.UserSignup, hashed_password: str) -> models.User:
    db_user = models.User(
        email=user.email,
        username=user.username,
        hashed_password=hashed_password
    )
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    return db_user

def get_user_by_email(db: Session, email: str) -> models.User | None:
    return db.query(models.User).filter(models.User.email == email).first()

def get_user_by_username(db: Session, username: str) -> models.User | None:
    return db.query(models.User).filter(models.User.username == username).first()