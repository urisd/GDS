# -*- coding: utf-8 -*-
"""
댓글 넛지 시스템 — Flask API 서버 (v2)
========================================
- TF-IDF + 로지스틱 회귀 모델로 실시간 악성 댓글 분석
- SQLite DB로 게시글/경고 무시 이력 저장
- 관리자 모니터링 API (flagged 댓글, 삭제 기능)
"""

import os
import sys
import json
import sqlite3
from datetime import datetime

import pandas as pd
from flask import Flask, request, jsonify, g
from flask_cors import CORS
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

app = Flask(__name__)
CORS(app)

# ============================================================
# 1. 모델 학습 (서버 시작 시)
# ============================================================
model = None
vectorizer = None
model_accuracy = 0.0


def train_model():
    """train_preprocessed.tsv를 사용하여 모델을 학습합니다."""
    global model, vectorizer, model_accuracy

    tsv_path = os.path.join(DATA_DIR, "train_preprocessed.tsv")
    if not os.path.exists(tsv_path):
        print(f"⚠️  데이터 파일 없음: {tsv_path}")
        return False

    print("📊 데이터 로딩 중...")
    df = pd.read_csv(tsv_path, sep="\t")
    df = df.dropna(subset=["comments_clean", "hate"])
    print(f"   → {len(df)}건 로드 완료")

    # 이진 분류: hate/offensive → 1 (악성), none → 0 (정상)
    df["is_malicious"] = df["hate"].apply(lambda x: 1 if x in ("hate", "offensive") else 0)

    X = df["comments_clean"]
    y = df["is_malicious"]

    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=0.2, random_state=42
    )

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
# 2. SQLite 데이터베이스
# ============================================================
def init_db():
    """데이터베이스 테이블을 초기화합니다."""
    conn = sqlite3.connect(DB_PATH)
    c = conn.cursor()

    # 게시글 테이블
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

    # 넛지 로그 테이블 (경고를 무시하고 게시한 기록)
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

    conn.commit()
    conn.close()
    print("🗄️  DB 초기화 완료")


def get_db():
    """Flask 요청 컨텍스트에서 DB 커넥션을 얻습니다."""
    if "db" not in g:
        g.db = sqlite3.connect(DB_PATH)
        g.db.row_factory = sqlite3.Row
    return g.db


@app.teardown_appcontext
def close_db(exception):
    db = g.pop("db", None)
    if db is not None:
        db.close()


# ============================================================
# 3. 텍스트 분석 API
# ============================================================
@app.route("/api/analyze", methods=["POST"])
def analyze():
    """텍스트의 악성 확률을 분석합니다."""
    data = request.get_json()
    text = data.get("text", "").strip()

    if not text:
        return jsonify({
            "probability": 0.0,
            "nudgeLevel": "safe",
            "nudgeMessage": "",
            "detectedWords": [],
            "isLocal": False,
        })

    if model is not None and vectorizer is not None:
        text_vec = vectorizer.transform([text])
        probability = float(model.predict_proba(text_vec)[0][1])
        is_local = False
    else:
        probability = 0.1
        is_local = True

    # 위험 단어 감지
    danger_words = ["병신", "씨발", "개새끼", "죽어", "자살", "새끼", "지랄", "꺼져라"]
    warning_words = ["바보", "멍청", "짜증", "쓰레기", "노잼", "꺼져", "닥쳐", "못생"]
    detected = []
    for w in danger_words:
        if w in text:
            detected.append(w)
    for w in warning_words:
        if w in text:
            detected.append(w)

    # 넛지 레벨 결정
    if probability >= 0.9:
        level = "danger"
        message = "🚫 명백한 욕설/비방이 감지되었습니다. 게시가 차단됩니다."
    elif probability >= 0.7:
        level = "warning"
        message = "⚠️ 불쾌감을 줄 수 있는 표현이 감지되었어요. 부드럽게 표현해보는 건 어떨까요?"
    else:
        level = "safe"
        message = ""

    return jsonify({
        "probability": round(probability, 4),
        "nudgeLevel": level,
        "nudgeMessage": message,
        "detectedWords": detected,
        "isLocal": is_local,
    })


# ============================================================
# 4. 게시글 CRUD API
# ============================================================
@app.route("/api/posts", methods=["GET"])
def get_posts():
    """게시글 목록 조회 (삭제되지 않은 것만)"""
    db = get_db()
    rows = db.execute(
        "SELECT * FROM posts WHERE is_deleted = 0 ORDER BY created_at DESC"
    ).fetchall()
    posts = [dict(r) for r in rows]
    return jsonify(posts)


@app.route("/api/posts", methods=["POST"])
def create_post():
    """게시글 작성 (넛지 분석 후 DB 저장)"""
    data = request.get_json()
    content = data.get("content", "").strip()
    author = data.get("author", "익명")
    community = data.get("community", "전체")
    nudge_level = data.get("nudgeLevel", "safe")
    probability = data.get("probability", 0.0)
    detected_words = data.get("detectedWords", [])

    if not content:
        return jsonify({"error": "내용을 입력해주세요"}), 400

    now = datetime.now().isoformat()
    db = get_db()

    # 게시글 저장
    cursor = db.execute(
        "INSERT INTO posts (author, content, community, created_at) VALUES (?, ?, ?, ?)",
        (author, content, community, now)
    )
    post_id = cursor.lastrowid

    # 넛지 로그 저장 (경고/위험 무시한 경우)
    ignored = 1 if nudge_level in ("warning", "danger") else 0
    db.execute(
        """INSERT INTO nudge_logs 
           (post_id, author, content, nudge_level, probability, detected_words, ignored_warning, created_at)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?)""",
        (post_id, author, content, nudge_level, probability,
         json.dumps(detected_words, ensure_ascii=False), ignored, now)
    )
    db.commit()

    return jsonify({
        "id": post_id,
        "author": author,
        "content": content,
        "community": community,
        "created_at": now,
        "nudgeLevel": nudge_level,
        "ignoredWarning": bool(ignored),
    }), 201


@app.route("/api/posts/<int:post_id>", methods=["DELETE"])
def delete_post(post_id):
    """게시글 삭제 (관리자용, 소프트 삭제)"""
    data = request.get_json() or {}
    deleted_by = data.get("deletedBy", "관리자")
    now = datetime.now().isoformat()

    db = get_db()
    db.execute(
        "UPDATE posts SET is_deleted = 1, deleted_by = ?, deleted_at = ? WHERE id = ?",
        (deleted_by, now, post_id)
    )
    db.commit()
    return jsonify({"message": f"게시글 #{post_id} 삭제 완료", "deletedAt": now})


# ============================================================
# 5. 관리자 모니터링 API
# ============================================================
@app.route("/api/admin/flagged", methods=["GET"])
def get_flagged():
    """경고를 무시하고 게시된 댓글 목록"""
    db = get_db()
    rows = db.execute("""
        SELECT nl.*, p.is_deleted 
        FROM nudge_logs nl
        LEFT JOIN posts p ON nl.post_id = p.id
        WHERE nl.ignored_warning = 1
        ORDER BY nl.created_at DESC
    """).fetchall()
    flagged = [dict(r) for r in rows]
    return jsonify(flagged)


@app.route("/api/admin/stats", methods=["GET"])
def get_stats():
    """관리자 대시보드 통계"""
    db = get_db()

    total_posts = db.execute("SELECT COUNT(*) FROM posts").fetchone()[0]
    deleted_posts = db.execute("SELECT COUNT(*) FROM posts WHERE is_deleted = 1").fetchone()[0]
    total_checks = db.execute("SELECT COUNT(*) FROM nudge_logs").fetchone()[0]
    warnings_ignored = db.execute(
        "SELECT COUNT(*) FROM nudge_logs WHERE nudge_level = 'warning' AND ignored_warning = 1"
    ).fetchone()[0]
    dangers_ignored = db.execute(
        "SELECT COUNT(*) FROM nudge_logs WHERE nudge_level = 'danger' AND ignored_warning = 1"
    ).fetchone()[0]
    safe_posts = db.execute(
        "SELECT COUNT(*) FROM nudge_logs WHERE nudge_level = 'safe'"
    ).fetchone()[0]

    return jsonify({
        "totalPosts": total_posts,
        "deletedPosts": deleted_posts,
        "activePosts": total_posts - deleted_posts,
        "totalChecks": total_checks,
        "warningsIgnored": warnings_ignored,
        "dangersIgnored": dangers_ignored,
        "safePosts": safe_posts,
        "modelAccuracy": round(model_accuracy, 4),
        "modelLoaded": model is not None,
    })


@app.route("/api/admin/posts", methods=["GET"])
def admin_all_posts():
    """모든 게시글 (삭제된 것 포함)"""
    db = get_db()
    rows = db.execute("SELECT * FROM posts ORDER BY created_at DESC").fetchall()
    posts = [dict(r) for r in rows]
    return jsonify(posts)


@app.route("/api/health", methods=["GET"])
def health():
    return jsonify({
        "status": "ok",
        "modelLoaded": model is not None,
        "modelAccuracy": round(model_accuracy, 4),
    })


# ============================================================
# 서버 시작
# ============================================================
if __name__ == "__main__":
    print("=" * 60)
    print("🚀 댓글 넛지 API 서버 v2")
    print("=" * 60)

    init_db()
    train_model()

    print()
    print("📡 서버:     http://localhost:5000")
    print("📡 분석 API: POST /api/analyze")
    print("📡 게시 API: POST /api/posts, GET /api/posts")
    print("📡 관리자:   GET  /api/admin/flagged, /api/admin/stats")
    print("📡 삭제:     DELETE /api/posts/<id>")
    print("=" * 60)

    app.run(host="0.0.0.0", port=5000, debug=True)
