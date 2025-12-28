from fastapi import Depends, FastAPI, HTTPException, Request
from fastapi.responses import RedirectResponse
from fastapi.middleware.cors import CORSMiddleware
from shortener_app import schemas, models, crud
from .database import SessionLocal, engine
from sqlalchemy.orm import Session
import validators
from contextlib import asynccontextmanager
import jwt
from datetime import datetime, timedelta
from passlib.context import CryptContext
import string

# Password hashing
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
secret_key = "your_secret_key_here"
ALGORITHM = "HS256"

@asynccontextmanager
async def lifespan(app: FastAPI):
    models.Base.metadata.create_all(bind=engine) # type: ignore
    yield

app= FastAPI(lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],  # React dev server
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

def get_db():
    db=SessionLocal()
    try:
        yield db
    finally:
        db.close()

def raise_badrequest(message):
    raise HTTPException(status_code=400, detail=message)

def hash_password(password: str) -> str:
    # Bcrypt has a 72-byte limit, so truncate password if necessary
    # We truncate the string directly to avoid encoding issues
    if len(password.encode('utf-8')) > 72:
        # Truncate to ensure it fits in 72 bytes
        truncated = password.encode('utf-8')[:72].decode('utf-8', errors='ignore')
        return pwd_context.hash(truncated)
    return pwd_context.hash(password)

def verify_password(plain_password: str, hashed_password: str) -> bool:
    # Bcrypt has a 72-byte limit, so truncate password if necessary
    # We truncate the string directly to match how we hashed it
    if len(plain_password.encode('utf-8')) > 72:
        truncated = plain_password.encode('utf-8')[:72].decode('utf-8', errors='ignore')
        return pwd_context.verify(truncated, hashed_password)
    return pwd_context.verify(plain_password, hashed_password)

def create_access_token(data: dict, expires_delta: timedelta | None = None):
    to_encode=data.copy()
    if expires_delta:
        expire=datetime.now()+ expires_delta
    else:
        expire=datetime.now()+ timedelta(hours=3)
    to_encode.update({"exp": expire})
    encode_jwt=jwt.encode(to_encode,secret_key,algorithm=ALGORITHM)
    return encode_jwt

def verify_token(token: str):
    try:
        payload=jwt.decode(token, secret_key, algorithms=[ALGORITHM])
        user_id: int=payload.get("sub")
        if user_id is None:
            return None
        return user_id
    except jwt.PyJWTError:
        return None

# User signup endpoint
@app.post("/api/auth/signup", response_model=schemas.UserResponse)
def signup(user_data: schemas.UserSignup, db: Session = Depends(get_db)):
    # Check if email already exists
    if crud.get_user_by_email(db, user_data.email):
        raise HTTPException(status_code=400, detail="Email already registered")
    
    # Check if username already exists
    if crud.get_user_by_username(db, user_data.username):
        raise HTTPException(status_code=400, detail="Username already taken")
    
    # Hash the password
    hashed_password = hash_password(user_data.password)
    
    # Create the user
    db_user = crud.create_user(db, user_data, hashed_password)
    
    # Create access token
    access_token = create_access_token(data={"sub": db_user.id})
    
    return {
        "id": db_user.id,
        "email": db_user.email,
        "username": db_user.username,
        "access_token": access_token
    }

# User signin endpoint
@app.post("/api/auth/signin", response_model=schemas.UserResponse)
def signin(user_data: schemas.UserSignin, db: Session = Depends(get_db)):
    # Find user by email
    db_user = crud.get_user_by_email(db, user_data.email)
    
    if not db_user:
        raise HTTPException(status_code=401, detail="Invalid email or password")
    
    # Verify password
    if not verify_password(user_data.password, db_user.hashed_password):
        raise HTTPException(status_code=401, detail="Invalid email or password")
    
    # Check if user is active
    if not db_user.is_active:
        raise HTTPException(status_code=403, detail="Account is deactivated")
    
    # Create access token
    access_token = create_access_token(data={"sub": db_user.id})
    
    return {
        "id": db_user.id,
        "email": db_user.email,
        "username": db_user.username,
        "access_token": access_token
    }

# Create URL endpoint
@app.post("/url",response_model=schemas.URLinfo)

def create_url(url:schemas.URLBase, db:Session=Depends(get_db)): 

    input_url = url.target_url
    # Add scheme if missing
    if not input_url.startswith("http://") and not input_url.startswith("https://"):
        url.target_url = "https://" + url.target_url
    if not validators.url(url.target_url): # type: ignore
        raise_badrequest(message="you have provided invalid url")

    
    db_url= crud.create_db_url(db=db,url=url)
    db_url.url=db_url.key
    db_url.admin_url=db_url.secret_key

    return db_url

def raise_not_found(request):
    message = f"URL '{request.url}' doesn't exist"
    raise HTTPException(status_code=404, detail=message)
@app.get("/{url_key}")
def forward_to_url(url_key: str,
        request: Request,
        db: Session = Depends(get_db)):
    
    if db_url := crud.get_db_url_by_key(db, url_key):
        return RedirectResponse(db_url.target_url,status_code=307) # type: ignore
    else:
        raise_not_found(request)
