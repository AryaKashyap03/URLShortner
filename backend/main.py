from datetime import datetime, timedelta, timezone
from typing import Annotated, List
from fastapi import Body, Depends, FastAPI, HTTPException, Request
from pydantic import BaseModel, HttpUrl
from fastapi.responses import RedirectResponse
import secrets, string
from starlette import status
from database import Base
from schemas import URLCreate, URLResponse, URLUpdate
from database import SessionLocal, engine
from sqlalchemy.orm import Session
from Models import UrlData, Users
import io
import qrcode
from fastapi.responses import StreamingResponse
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv
import os

from passlib.context import CryptContext
from fastapi.security import OAuth2PasswordRequestForm, OAuth2PasswordBearer
from jose import jwt, JWTError

app = FastAPI()

origins = ["http://localhost:5173",]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"], # Allows GET, POST, PUT, DELETE
    allow_headers=["*"],
)

Base.metadata.create_all(bind=engine)

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

db_dependency = Annotated[Session, Depends(get_db)]


load_dotenv()
SECRET_KEY = os.getenv("SECRET_KEY")
ALGORITHM = 'HS256'

bcrypt_context = CryptContext(schemes=['bcrypt'], deprecated = 'auto')
oauth2_bearer = OAuth2PasswordBearer(tokenUrl='auth/token')

#Authentication and Authorization Below


def authenticate_user(username: str, password: str, db):

    user = db.query(Users).filter(Users.username == username).first()

    if not user:
        return False
    if not bcrypt_context.verify(password, user.hashed_password):
        return False
    return user

def create_access_token(username: str, user_id : int, expires_delta: timedelta):

    encode = {'sub' : username, 'id': user_id}
    expires = datetime.now(timezone.utc) + expires_delta
    encode.update({'exp': expires})
    return jwt.encode(encode, SECRET_KEY, algorithm=ALGORITHM)

async def get_current_user(token: Annotated[str, Depends(oauth2_bearer)]):
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        username: str = payload.get('sub')
        user_id : int = payload.get('id')

        if username is None or user_id is None:
            raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED,
                                detail="Could not validate credentials")
        return {
            "username" : username,
            "id" : user_id
        }
    except JWTError:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED,
                            detail="Could not validate credentials")


class CreateUserRequest(BaseModel):
    username: str
    email: str
    first_name : str
    last_name : str
    password: str
    role: str

class Token(BaseModel):
    access_token: str
    token_type: str


@app.post("/auth", status_code=status.HTTP_201_CREATED)
async def create_user(create_user_request: CreateUserRequest, db: db_dependency):
    create_user_model = Users(
        email= create_user_request.email,
        username = create_user_request.username,
        first_name = create_user_request.first_name,
        last_name = create_user_request.last_name,
        role = create_user_request.role,
        hashed_password = bcrypt_context.hash(create_user_request.password),
        is_active = True)

    db.add(create_user_model)
    db.commit()

    return{
        "message": "user created successfully"
    }

@app.post("/auth/token", response_model = Token)
async def login_for_access_token(form_data: Annotated[OAuth2PasswordRequestForm, Depends()],
                                 db: db_dependency):
    
    user = authenticate_user(form_data.username, form_data.password,db)

    if not user:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED,
                                        detail="Could not validate credentials")

    token = create_access_token(user.username, user.id, timedelta(minutes=20))

    return {
        'access_token': token, 
        'token_type': "bearer"
    }

user_dependency = Annotated[dict, Depends(get_current_user)]

#Endpoints below

@app.post("/shorten", response_model=URLResponse)
def create_url(db:db_dependency, userdata: URLCreate,
               user: user_dependency):

    if user is None: 
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED)
    
    data = db.query(UrlData).filter(UrlData.original_url == str(userdata.original_url), UrlData.owner_id == user["id"]).first()

    if data is not None:
        return data
    else:
        data = userdata.model_dump()
        data["original_url"] = str(data["original_url"])
        token = secrets.token_urlsafe(4)[:6]
        while(db.query(UrlData).filter(UrlData.short_token == token).first() is not None):
            token = secrets.token_urlsafe(4)[:6]
        data["short_token"] = token
        data["clicks"] = 0

        data = UrlData(**data, owner_id = user.get('id'))
        db.add(data)
        db.commit()
        db.refresh(data)
        return data


@app.get("/urls", response_model=List[URLResponse])
def get_urls(db:db_dependency, user: user_dependency):
    data = db.query(UrlData).filter(UrlData.owner_id == user["id"]).all()
    return data


@app.get('/urls/{input_token}')
def get_url(input_token : str, db:db_dependency, user: user_dependency):
    data = db.query(UrlData).filter(UrlData.short_token == input_token, UrlData.owner_id == user["id"]).first()

    if data is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND)

    return data

@app.put("/urls/{input_token}") 
def update_url(input_token: str, db: db_dependency, update: URLUpdate, user: user_dependency):
    data = db.query(UrlData).filter(UrlData.short_token == input_token, UrlData.owner_id == user["id"]).first()

    if data is None:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND)

    data.original_url = str(update.original_url)
    data.clicks = 0
    db.commit()
    db.refresh(data)
    return{"message" : "URL updated successfully"}

    

@app.get("/{input_token}")
def token_redirect(input_token : str, db: db_dependency):
    data = db.query(UrlData).filter(UrlData.short_token == input_token).first()

    if data is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND)

    data.clicks = data.clicks+1
    db.commit()
    return RedirectResponse(url = data.original_url)


@app.delete("/urls/{input_token}")
def delete_url(input_token: str, db: db_dependency, user:user_dependency):
    data = db.query(UrlData).filter(UrlData.short_token == input_token, UrlData.owner_id == user["id"]).first()

    if data is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND)

    db.delete(data)
    db.commit()
    return {
    "message": "URL deleted successfully"
    }

@app.get("/urls/{input_token}/qr")
def generate_qr(input_token: str, db: db_dependency, request: Request, user: user_dependency):
    data = db.query(UrlData).filter(UrlData.short_token == input_token, UrlData.owner_id == user["id"]).first()

    if data is None:
        raise HTTPException(status_code = status.HTTP_404_NOT_FOUND)

    short_url = str(request.base_url) + data.short_token

    img = qrcode.make(short_url)

    buffer = io.BytesIO()
    img.save(buffer, format="PNG")
    buffer.seek(0)

    return StreamingResponse(
    buffer,
    media_type="image/png")

