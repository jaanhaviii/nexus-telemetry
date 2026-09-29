from datetime import datetime
import os
from pathlib import Path
import random
import threading
import time
from typing import List, Optional

from fastapi import FastAPI, Depends, HTTPException, status, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from pydantic import BaseModel
from dotenv import load_dotenv
import google.generativeai as genai
import jwt
from passlib.context import CryptContext
from pypdf import PdfReader
import numpy as np
from sqlalchemy import create_engine, Column, Integer, String, DateTime, ForeignKey, Text
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker, Session

# -----------------------------
# Configuration & Paths
# -----------------------------
base_dir = Path(__file__).resolve().parent.parent
env_path = base_dir / ".env"
load_dotenv(dotenv_path=env_path)

GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")
SECRET_KEY = os.getenv("SECRET_KEY")
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 60
ADMIN_PASSWORD = os.getenv("ADMIN_PASSWORD")

if GEMINI_API_KEY:
    genai.configure(api_key=GEMINI_API_KEY)

# -----------------------------
# Database Setup (SQLAlchemy & SQLite)
# -----------------------------
DATABASE_URL = "sqlite:///./nexus_telemetry.db"
engine = create_engine(
    DATABASE_URL,
    connect_args={"check_same_thread": False}
)

SessionLocal = sessionmaker(
    autocommit=False,
    autoflush=False,
    bind=engine
)

Base = declarative_base()

# -----------------------------
# Database Models
# -----------------------------
class UserDB(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    username = Column(String, unique=True, index=True, nullable=False)
    password = Column(String, nullable=False)


class ServerDB(Base):
    __tablename__ = "servers"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, unique=True, index=True, nullable=False)
    region = Column(String, nullable=False)
    cpu = Column(Integer, default=20)
    memory = Column(Integer, default=30)
    disk = Column(Integer, default=40)
    network = Column(Integer, default=100)
    status = Column(String, default="Healthy")


class LogDB(Base):
    __tablename__ = "logs"

    id = Column(Integer, primary_key=True, index=True)
    server_id = Column(Integer, ForeignKey("servers.id"))
    time = Column(String, nullable=False)
    cpu = Column(Integer)
    status = Column(String)


class AIQueryDB(Base):
    __tablename__ = "ai_queries"

    id = Column(Integer, primary_key=True, index=True)
    question = Column(String, nullable=False)
    answer = Column(String, nullable=False)
    timestamp = Column(DateTime, default=datetime.utcnow)


# PHASE 3: Database Table for RAG Metadata Registry
class DocumentDB(Base):
    __tablename__ = "documents"

    id = Column(Integer, primary_key=True, index=True)
    filename = Column(String, nullable=False)
    uploaded_at = Column(DateTime, default=datetime.utcnow)


# -----------------------------
# Instantiate Database Engine Tables
# -----------------------------
Base.metadata.create_all(bind=engine)

# -----------------------------
# Global In-Memory RAG Storage Matrix
# -----------------------------
# Holds processed data structures:
# {"text": str, "embedding": List[float]}
KNOWLEDGE_BASE = []

# -----------------------------
# Security & Cryptography Cores
# -----------------------------
pwd_context = CryptContext(
    schemes=["bcrypt"],
    deprecated="auto"
)

oauth2_scheme = OAuth2PasswordBearer(
    tokenUrl="auth/login"
)


def hash_password(password: str) -> str:
    return pwd_context.hash(password)


def verify_password(
    plain_password: str,
    hashed_password: str
) -> bool:
    return pwd_context.verify(
        plain_password,
        hashed_password
    )


def create_access_token(data: dict):
    to_encode = data.copy()

    expire = time.time() + (
        ACCESS_TOKEN_EXPIRE_MINUTES * 60
    )

    to_encode.update({"exp": expire})

    return jwt.encode(
        to_encode,
        SECRET_KEY,
        algorithm=ALGORITHM
    )


# -----------------------------
# Dependency Injections
# -----------------------------
def get_db():
    db = SessionLocal()

    try:
        yield db
    finally:
        db.close()


def get_current_user(
    token: str = Depends(oauth2_scheme),
    db: Session = Depends(get_db)
):
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate matrix security credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )

    try:
        payload = jwt.decode(
            token,
            SECRET_KEY,
            algorithms=[ALGORITHM]
        )

        username: str = payload.get("sub")

        if username is None:
            raise credentials_exception

    except jwt.PyJWTError:
        raise credentials_exception

    user = db.query(UserDB).filter(
        UserDB.username == username
    ).first()

    if user is None:
        raise credentials_exception

    return user


# -----------------------------
# Data Seeding Matrix Initializer
# -----------------------------
def seed_initial_data():
    db = SessionLocal()

    if not db.query(UserDB).filter(
        UserDB.username == "admin"
    ).first():
        db.add(
            UserDB(
                username="admin",
                password=hash_password(ADMIN_PASSWORD)
            )
        )

    if db.query(ServerDB).count() == 0:
        default_servers = [
            {
                "name": "Payroll Database",
                "region": "India",
                "cpu": 28,
                "memory": 42,
                "disk": 51,
                "network": 120,
                "status": "Healthy"
            },
            {
                "name": "Customer Database",
                "region": "Singapore",
                "cpu": 67,
                "memory": 73,
                "disk": 60,
                "network": 215,
                "status": "Warning"
            },
            {
                "name": "Production API",
                "region": "Virginia",
                "cpu": 91,
                "memory": 88,
                "disk": 72,
                "network": 450,
                "status": "Critical"
            },
            {
                "name": "AWS Production Account",
                "region": "Mumbai",
                "cpu": 45,
                "memory": 39,
                "disk": 68,
                "network": 185,
                "status": "Healthy"
            },
            {
                "name": "GitLab Repository",
                "region": "London",
                "cpu": 53,
                "memory": 48,
                "disk": 44,
                "network": 140,
                "status": "Healthy"
            }
        ]

        for srv in default_servers:
            db.add(
                ServerDB(**srv)
            )

    db.commit()
    db.close()


seed_initial_data()

# -----------------------------
# Background Telemetry Simulator Engine
# -----------------------------
def run_telemetry_simulator():
    while True:
        db = SessionLocal()

        try:
            servers = db.query(ServerDB).all()

            for server in servers:
                server.cpu = max(
                    0,
                    min(
                        100,
                        server.cpu + random.randint(-5, 5)
                    )
                )

                server.memory = max(
                    0,
                    min(
                        100,
                        server.memory + random.randint(-4, 4)
                    )
                )

                server.disk = max(
                    0,
                    min(
                        100,
                        server.disk + random.randint(-3, 3)
                    )
                )

                server.network = max(
                    50,
                    (server.network or 100)
                    + random.randint(-25, 25)
                )

                if server.cpu >= 90 or server.memory >= 85:
                    server.status = "Critical"

                elif server.cpu >= 65 or server.memory >= 60:
                    server.status = "Warning"

                else:
                    server.status = "Healthy"

                db.add(
                    LogDB(
                        server_id=server.id,
                        time=datetime.now().strftime("%H:%M:%S"),
                        cpu=server.cpu,
                        status=server.status
                    )
                )

            db.commit()

        except Exception as e:
            print(
                f"Error in telemetry loop simulator thread: {e}"
            )

        finally:
            db.close()

        time.sleep(2)


threading.Thread(
    target=run_telemetry_simulator,
    daemon=True
).start()

# -----------------------------
# FastAPI Core & Routing
# -----------------------------
app = FastAPI(
    title="Nexus Matrix Enterprise AI Platform"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


class ChatRequest(BaseModel):
    message: str


# -----------------------------
# Authentication Endpoints
# -----------------------------
@app.post("/auth/login")
def login(
    form_data: OAuth2PasswordRequestForm = Depends(),
    db: Session = Depends(get_db)
):
    user = db.query(UserDB).filter(
        UserDB.username == form_data.username
    ).first()

    if not user or not verify_password(
        form_data.password,
        user.password
    ):
        raise HTTPException(
            status_code=400,
            detail="Incorrect username or password matrix mapping"
        )

    access_token = create_access_token(
        data={"sub": user.username}
    )

    return {
        "access_token": access_token,
        "token_type": "bearer"
    }


# -----------------------------
# Protected System Operations Routes
# -----------------------------
@app.get("/servers")
def get_servers(
    current_user: UserDB = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    return db.query(ServerDB).all()


@app.get("/logs")
def get_logs(
    current_user: UserDB = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    return db.query(LogDB).order_by(
        LogDB.id.desc()
    ).limit(25).all()


# -----------------------------
# RAG Processing Pipeline
# -----------------------------
@app.post("/upload-doc")
async def upload_document(
    file: UploadFile = File(...),
    current_user: UserDB = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    if not file.filename.endswith(".pdf"):
        raise HTTPException(
            status_code=400,
            detail="Invalid media payload. System only processes .pdf data configurations."
        )

    if not GEMINI_API_KEY:
        raise HTTPException(
            status_code=500,
            detail="Gemini configuration matrix missing."
        )

    try:
        pdf_content = await file.read()

        import io

        pdf_file = io.BytesIO(pdf_content)
        reader = PdfReader(pdf_file)

        extracted_text = ""

        for page in reader.pages:
            text = page.extract_text()

            if text:
                extracted_text += text + "\n"

        if not extracted_text.strip():
            raise HTTPException(
                status_code=400,
                detail="PDF text processing vector resolved to blank data."
            )

        # Chunking
        chunks = []
        chunk_size = 700
        step = 500

        for i in range(
            0,
            len(extracted_text),
            step
        ):
            slice_segment = extracted_text[
                i:i + chunk_size
            ]

            if len(slice_segment) > 50:
                chunks.append(slice_segment)

        # Batch compute embeddings using Gemini
        global KNOWLEDGE_BASE
        KNOWLEDGE_BASE.clear()

        for chunk in chunks:
            result = genai.embed_content(
                model="models/text-embedding-004",
                content=chunk,
                task_type="retrieval_document"
            )

            KNOWLEDGE_BASE.append(
                {
                    "text": chunk,
                    "embedding": result["embedding"]
                }
            )

            time.sleep(0.05)

        # Log entry to file audit table
        db_doc = DocumentDB(
            filename=file.filename
        )

        db.add(db_doc)
        db.commit()

        return {
            "status": "SUCCESS",
            "filename": file.filename,
            "chunks_indexed": len(chunks)
        }

    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"RAG Compilation failure thread fault: {str(e)}"
        )


# -----------------------------
# Upgraded Contextual Chat Endpoint
# -----------------------------
@app.post("/chat")
def chat(
    request: ChatRequest,
    current_user: UserDB = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    if not GEMINI_API_KEY:
        return {
            "reply": "Gemini core API key connection matrix unbound."
        }

    try:
        # 1. Fetch telemetry runtime status context
        servers = db.query(ServerDB).all()

        server_context = [
            {
                "name": s.name,
                "cpu": s.cpu,
                "status": s.status,
                "region": s.region
            }
            for s in servers
        ]

        # 2. Compute runtime user search similarity metrics
        document_context_snippet = ""

        global KNOWLEDGE_BASE

        if KNOWLEDGE_BASE:
            query_embed = genai.embed_content(
                model="models/text-embedding-004",
                content=request.message,
                task_type="retrieval_query"
            )["embedding"]

            scores = []

            for item in KNOWLEDGE_BASE:
                dot_product = np.dot(
                    query_embed,
                    item["embedding"]
                )

                norm_q = np.linalg.norm(
                    query_embed
                )

                norm_i = np.linalg.norm(
                    item["embedding"]
                )

                similarity = (
                    dot_product / (norm_q * norm_i)
                    if norm_q and norm_i
                    else 0
                )

                scores.append(
                    (
                        similarity,
                        item["text"]
                    )
                )

            scores.sort(
                key=lambda x: x[0],
                reverse=True
            )

            top_chunks = [
                text
                for score, text in scores[:2]
                if score > 0.35
            ]

            if top_chunks:
                document_context_snippet = (
                    "\n--- EXTRACTED INFRASTRUCTURE MANUAL CONTEXT ---\n"
                    + "\n".join(top_chunks)
                )

        # 3. Compile Master Prompt
        # UPDATED MODEL:
        # gemini-2.5-flash -> gemini-3.8-flash
        model = genai.GenerativeModel(
            "gemini-3.8-flash"
        )

        base_system_prompt = (
            f"You are the senior Operations AI Monitor for Nexus Telemetry. "
            f"Active system matrix parameters: {server_context}. "
            f"Analyze logs or infrastructure data using the document snippets attached below if present. "
            f"{document_context_snippet}\n"
        )

        response = model.generate_content(
            base_system_prompt
            + f"Query: {request.message}"
        )

        db.add(
            AIQueryDB(
                question=request.message,
                answer=response.text
            )
        )

        db.commit()

        return {
            "reply": response.text
        }

    except Exception as e:
        return {
            "reply": f"Error running analytical response pipeline: {str(e)}"
        }