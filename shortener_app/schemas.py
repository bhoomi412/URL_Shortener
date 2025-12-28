from pydantic import BaseModel, EmailStr
from typing import Optional
from datetime import datetime

#user schemas
class UserSignup(BaseModel):
    email: EmailStr
    password: str
    username: str

class UserSignin(BaseModel):
    email: EmailStr
    password: str

class UserResponse(BaseModel):
    id: int
    email: str
    username: str
    access_token: str

class UserInfo(BaseModel):
    id: int
    email: EmailStr
    username: str
    is_active: bool
    created_at: datetime

# Schemas for URL shortening
class URLBase(BaseModel):
    target_url: str

class URL(URLBase):
    clicks: int
    is_active: bool
    class Config():
        from_attributes= True

class URLinfo(URL):
    target_url: str
    clicks: int
    is_active: bool
    url: str
    admin_url: str

# VISITOR SCHEMAS
class VisitorInfo(BaseModel):
    ip_address: str
    user_agent: str
    visited_at: datetime
    
    class Config:
        from_attributes = True