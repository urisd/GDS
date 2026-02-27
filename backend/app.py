# -*- coding: utf-8 -*-
"""
댓글 넛지 시스템 — FastAPI 서버 (v3)
"""

import os
import json
import sqlite3
from datetime import datetime
from contextlib import asynccontextmanager

import pandas as pd
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.linear_model import LogisticRegression
from sklearn.model_selection import train_test_split
from sklearn.metrics import accuracy_score

# ============================================================
# 경로 설정
# ============================================================
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
DATA_DIR = os.path.join(BASE_DIR, "data")
DB_PATH = os.path.join(BASE_DIR, "nudge.db")

# ============================================================
# 모델 전역 변수
# ============================================================
model = None
vectorizer = None
model_accuracy = 0.0


def train_model():
    global model, vectorizer, model_accuracy
    tsv_path = os.path.join(DATA_DIR, "train_preprocessed.tsv")
    if not os.path.exists(tsv_path):
        print(f"⚠️  데이터 파일 없음: {tsv_path}")
        return False

    print("📊 데이터 로딩 중...")
    df = pd.read_csv(tsv_path, sep="\t")
    df = df.dropna(subset=["comments_clean", "hate"])
    print(f"   → {len(df)}건 로드 완료")

    df["is_malicious"] = df["hate"].apply(lambda x: 1 if x in ("hate", "offensive") else 0)
    X = df["comments_clean"]
    y = df["is_malicious"]

    X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)

    print("🔤 TF-IDF 벡터화 중...")
    vectorizer = TfidfVectorizer(max_features=10000)
    X_train_tfidf = vectorizer.fit_transform(X_train)
    X_test_tfidf = vectorizer.transform(X_test)

    print("🤖 로지스틱 회귀 모델 학습 중...")
    model = LogisticRegression(max_iter=1000, random_state=42)
    model.fit(X_train_tfidf, y_train)

    y_pred = model.predict(X_test_tfidf)
    model_accuracy = accuracy_score(y_test, y_pred)
    print(f"✅ 모델 학습 완료! 정확도: {model_accuracy:.4f}")
    return True


# ============================================================
# DB 초기화
# ============================================================
def init_db():
    conn = sqlite3.connect(DB_PATH)
    c = conn.cursor()
    c.execute("""
        CREATE TABLE IF NOT EXISTS posts (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            author TEXT NOT NULL,
            content TEXT NOT NULL,
            community TEXT DEFAULT '전체',
            created_at TEXT NOT NULL,
            is_deleted INTEGER DEFAULT 0,
            deleted_by TEXT DEFAULT NULL,
            deleted_at TEXT DEFAULT NULL
        )
    """)
    c.execute("""
        CREATE TABLE IF NOT EXISTS nudge_logs (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            post_id INTEGER,
            author TEXT NOT NULL,
            content TEXT NOT NULL,
            nudge_level TEXT NOT NULL,
            probability REAL NOT NULL,
            detected_words TEXT DEFAULT '[]',
            ignored_warning INTEGER DEFAULT 0,
            created_at TEXT NOT NULL,
            FOREIGN KEY (post_id) REFERENCES posts(id)
        )
    """)
    c.execute("""
        CREATE TABLE IF NOT EXISTS comments (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            post_id INTEGER NOT NULL,
            author TEXT NOT NULL,
            content TEXT NOT NULL,
            created_at TEXT NOT NULL,
            is_deleted INTEGER DEFAULT 0,
            FOREIGN KEY (post_id) REFERENCES posts(id)
        )
    """)
    conn.commit()
    conn.close()
    print("🗄️  DB 초기화 완료")


def get_db():
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    return conn


# ============================================================
# FastAPI 앱
# ============================================================
@asynccontextmanager
async def lifespan(app: FastAPI):
    init_db()
    train_model()
    yield

app = FastAPI(title="댓글 넛지 API", version="3.0.0", lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)


# ============================================================
# Pydantic 스키마
# ============================================================
class AnalyzeRequest(BaseModel):
    text: str = ""

class PostCreate(BaseModel):
    content: str
    author: str = "익명"
    community: str = "전체"
    nudgeLevel: str = "safe"
    probability: float = 0.0
    detectedWords: list = []

class DeletePost(BaseModel):
    deletedBy: str = "관리자"

class CommentCreate(BaseModel):
    content: str
    user: str = "사용자"
    postId: int


# ============================================================
# 분석 API
# ============================================================
@app.post("/api/analyze")
def analyze(req: AnalyzeRequest):
    text = req.text.strip()
    if not text:
        return {"probability": 0.0, "nudgeLevel": "safe", "nudgeMessage": "", "detectedWords": [], "isLocal": False}

    if model is not None and vectorizer is not None:
        text_vec = vectorizer.transform([text])
        probability = float(model.predict_proba(text_vec)[0][1])
        is_local = False
    else:
        probability = 0.1
        is_local = True

    danger_words = ["병신", "씨발", "개새끼", "죽어", "자살", "새끼", "지랄", "꺼져라"]
    warning_words = ["바보", "멍청", "짜증", "쓰레기", "노잼", "꺼져", "닥쳐", "못생"]
    detected = [w for w in danger_words + warning_words if w in text]

    if probability >= 0.9:
        level, message = "danger", "🚫 명백한 욕설/비방이 감지되었습니다. 게시가 차단됩니다."
    elif probability >= 0.7:
        level, message = "warning", "⚠️ 불쾌감을 줄 수 있는 표현이 감지되었어요. 부드럽게 표현해보는 건 어떨까요?"
    else:
        level, message = "safe", ""

    return {"probability": round(probability, 4), "nudgeLevel": level, "nudgeMessage": message, "detectedWords": detected, "isLocal": is_local}


# ============================================================
# 게시글 API
# ============================================================
@app.get("/api/posts")
def get_posts():
    db = get_db()
    rows = db.execute("SELECT * FROM posts WHERE is_deleted = 0 ORDER BY created_at DESC").fetchall()
    db.close()
    return [dict(r) for r in rows]


@app.post("/api/posts", status_code=201)
def create_post(req: PostCreate):
    if not req.content.strip():
        raise HTTPException(status_code=400, detail="내용을 입력해주세요")

    now = datetime.now().isoformat()
    db = get_db()
    cursor = db.execute(
        "INSERT INTO posts (author, content, community, created_at) VALUES (?, ?, ?, ?)",
        (req.author, req.content, req.community, now)
    )
    post_id = cursor.lastrowid
    ignored = 1 if req.nudgeLevel in ("warning", "danger") else 0
    db.execute(
        "INSERT INTO nudge_logs (post_id, author, content, nudge_level, probability, detected_words, ignored_warning, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?)",
        (post_id, req.author, req.content, req.nudgeLevel, req.probability, json.dumps(req.detectedWords, ensure_ascii=False), ignored, now)
    )
    db.commit()
    db.close()
    return {"id": post_id, "author": req.author, "content": req.content, "community": req.community, "created_at": now}


@app.delete("/api/posts/{post_id}")
def delete_post(post_id: int, req: DeletePost):
    now = datetime.now().isoformat()
    db = get_db()
    db.execute("UPDATE posts SET is_deleted = 1, deleted_by = ?, deleted_at = ? WHERE id = ?", (req.deletedBy, now, post_id))
    db.commit()
    db.close()
    return {"message": f"게시글 #{post_id} 삭제 완료", "deletedAt": now}


# ============================================================
# 댓글 API
# ============================================================
@app.get("/api/posts/{post_id}/comments")
def get_comments(post_id: int):
    db = get_db()
    rows = db.execute("SELECT * FROM comments WHERE post_id = ? AND is_deleted = 0 ORDER BY created_at ASC", (post_id,)).fetchall()
    db.close()
    return [dict(r) for r in rows]


@app.post("/comments", status_code=201)
def create_comment(req: CommentCreate):
    if not req.content.strip():
        raise HTTPException(status_code=400, detail="내용을 입력해주세요")
    now = datetime.now().isoformat()
    db = get_db()
    cursor = db.execute(
        "INSERT INTO comments (post_id, author, content, created_at) VALUES (?, ?, ?, ?)",
        (req.postId, req.user, req.content, now)
    )
    comment_id = cursor.lastrowid
    db.commit()
    db.close()
    return {"id": comment_id, "postId": req.postId, "author": req.user, "content": req.content, "created_at": now}


@app.delete("/comments/{comment_id}")
def delete_comment(comment_id: int):
    db = get_db()
    db.execute("UPDATE comments SET is_deleted = 1 WHERE id = ?", (comment_id,))
    db.commit()
    db.close()
    return {"message": f"댓글 #{comment_id} 삭제 완료"}


# ============================================================
# 관리자 API
# ============================================================
@app.get("/api/admin/flagged")
def get_flagged():
    db = get_db()
    rows = db.execute("SELECT nl.*, p.is_deleted FROM nudge_logs nl LEFT JOIN posts p ON nl.post_id = p.id WHERE nl.ignored_warning = 1 ORDER BY nl.created_at DESC").fetchall()
    db.close()
    return [dict(r) for r in rows]


@app.get("/api/admin/stats")
def get_stats():
    db = get_db()
    total_posts = db.execute("SELECT COUNT(*) FROM posts").fetchone()[0]
    deleted_posts = db.execute("SELECT COUNT(*) FROM posts WHERE is_deleted = 1").fetchone()[0]
    total_checks = db.execute("SELECT COUNT(*) FROM nudge_logs").fetchone()[0]
    warnings_ignored = db.execute("SELECT COUNT(*) FROM nudge_logs WHERE nudge_level = 'warning' AND ignored_warning = 1").fetchone()[0]
    dangers_ignored = db.execute("SELECT COUNT(*) FROM nudge_logs WHERE nudge_level = 'danger' AND ignored_warning = 1").fetchone()[0]
    safe_posts = db.execute("SELECT COUNT(*) FROM nudge_logs WHERE nudge_level = 'safe'").fetchone()[0]
    db.close()
    return {"totalPosts": total_posts, "deletedPosts": deleted_posts, "activePosts": total_posts - deleted_posts, "totalChecks": total_checks, "warningsIgnored": warnings_ignored, "dangersIgnored": dangers_ignored, "safePosts": safe_posts, "modelAccuracy": round(model_accuracy, 4), "modelLoaded": model is not None}


@app.get("/api/admin/posts")
def admin_all_posts():
    db = get_db()
    rows = db.execute("SELECT * FROM posts ORDER BY created_at DESC").fetchall()
    db.close()
    return [dict(r) for r in rows]


@app.get("/api/health")
def health():
    return {"status": "ok", "modelLoaded": model is not None, "modelAccuracy": round(model_accuracy, 4)}


# ============================================================
# 서버 시작
# ============================================================
if __name__ == "__main__":
    import uvicorn
    print("=" * 60)
    print("🚀 댓글 넛지 API 서버 v3 (FastAPI)")
    print("=" * 60)
    uvicorn.run("app:app", host="0.0.0.0", port=5000, reload=True)