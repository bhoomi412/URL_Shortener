from .database import Base
from sqlalchemy import Boolean, String, Integer, Column, DateTime, ForeignKey, Text
from datetime import datetime
from sqlalchemy.orm import relationship


class URL(Base):
    __tablename__ = "urls"
    id=Column(Integer, primary_key=True)
    key= Column(String(10), unique= True, index=True,nullable= False)
    secret_key= Column(String(10), unique= True, index=True, nullable= False)
    target_url= Column(String,index=True, nullable= False)
    is_active= Column(Boolean, default= True)
    clicks= Column(Integer, default=0)
    is_guest = Column(Boolean, default=False)  # Track if created by guest
    created_at = Column(DateTime, default=datetime.now)

    # Foreign key to user (None for guests)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=True)
    
    # Relationships
    owner = relationship("User", back_populates="urls")
    visitors = relationship("Visitor", back_populates="url")

    def __init__(self, target_url: str, key: str, secret_key: str, **kwargs):
        super().__init__(**kwargs)
        self.target_url = target_url
        self.key = key
        self.secret_key = secret_key


    def __repr__(self):
        return f"<URL(id={self.id}, key={self.key}, target_url={self.target_url})>"

class User(Base):
    __tablename__ = "users"
    id=Column(Integer, primary_key=True, index=True)
    email= Column(String, unique=True, index=True, nullable=False)
    username= Column(String, unique=True, index=True, nullable=False)
    hashed_password= Column(String, nullable=False)
    is_active= Column(Boolean, default=True)
    created_at= Column(DateTime, default=datetime.now)

    #Relationship
    urls = relationship("URL", back_populates="owner")

    def __repr__(self):
        return f"<User(id={self.id}, email={self.email}, username={self.username})>"
    
class Visitor(Base):
    __tablename__ = "visitors"
    id = Column(Integer, primary_key=True, index=True)
    ip_address = Column(String, nullable=False)
    user_agent = Column(Text, nullable=False)
    visited_at = Column(DateTime, default=datetime.now)

    # Foreign key to URL
    url_id = Column(Integer, ForeignKey("urls.id"), nullable=False)

    # Relationship
    url = relationship("URL", back_populates="visitors")