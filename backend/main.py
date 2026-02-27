from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import sqlite3
import os
from datetime import datetime

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

DB_PATH = os.path.join(os.path.dirname(os.path.abspath(__file__)), "nudge.db")

def init_db():
    conn = sqlite3.connect(DB_PATH)
    c = conn.cursor()
    c.execute("""
        CREATE TABLE IF NOT EXISTS comments (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            post_id INTEGER NOT NULL,
            author TEXT NOT NULL,
            content TEXT NOT NULL,
            created_at TEXT NOT NULL,
            is_deleted INTEGER DEFAULT 0
        )
    """)
    conn.commit()
    conn.close()

init_db()

def get_db():
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    return conn

class PostData(BaseModel):
    content: str
    author: str = "익명"
    nudge_level: str = "safe"
    probability: float = 0.0

class CommentCreate(BaseModel):
    content: str
    user: str = "사용자"
    postId: int

@app.post("/posts")
async def create_post(data: PostData):
    print("\n" + "="*50)
    print("📢 UI에서 새로운 댓글이 도착했습니다!")
    print(f"📝 내용: {data.content}")
    print(f"👤 작성자: {data.author}")
    print(f"🚨 넛지 레벨: {data.nudge_level}")
    print(f"📊 확률: {data.probability}")
    print("="*50 + "\n")
    return {"status": "success", "received_content": data.content}

@app.post("/comments", status_code=201)
def create_comment(req: CommentCreate):
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

@app.get("/comments/{post_id}")
def get_comments(post_id: int):
    db = get_db()
    rows = db.execute(
        "SELECT * FROM comments WHERE post_id = ? AND is_deleted = 0 ORDER BY created_at ASC",
        (post_id,)
    ).fetchall()
    db.close()
    return [dict(r) for r in rows]

@app.delete("/comments/{comment_id}")
def delete_comment(comment_id: int):
    db = get_db()
    db.execute("UPDATE comments SET is_deleted = 1 WHERE id = ?", (comment_id,))
    db.commit()
    db.close()
    return {"message": f"댓글 #{comment_id} 삭제 완료"}

@app.get("/")
def read_root():
    return {"message": "Hello Azure! Our FastAPI is running!"}

@app.get("/items/{item_id}")
def read_item(item_id: int, q: str = None):
    return {"item_id": item_id, "q": q}