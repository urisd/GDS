# 🛡️ AI 댓글 넛지 시스템

> TF-IDF + 로지스틱 회귀 모델 기반 악성 댓글 감지 및 3단계 넛지 시스템

## 📋 프로젝트 구조

```
댓글_넛지_배포/
├── frontend/          # React 프론트엔드 (Weverse 스타일)
│   ├── src/
│   │   ├── pages/
│   │   │   ├── FeedPage.jsx      # 메인 피드 (댓글 넛지 통합)
│   │   │   ├── DemoPage.jsx      # AI 넛지 데모 페이지
│   │   │   └── AdminPage.jsx     # 관리자 모니터링 페이지
│   │   ├── components/
│   │   │   ├── Feed/             # 피드, 게시글 카드, 작성기
│   │   │   ├── NudgeSystem/      # 넛지 팝업, 통계
│   │   │   ├── Header/           # 헤더 (네비게이션 포함)
│   │   │   ├── Sidebar/          # 커뮤니티 사이드바
│   │   │   └── RightSidebar/     # 우측 통계 사이드바
│   │   ├── services/
│   │   │   └── nudgeAPI.js       # API 서비스 (분석, CRUD, 관리자)
│   │   ├── reducer/              # Redux 상태 관리
│   │   └── styles/               # 테마, 글로벌 스타일
│   └── package.json
│
├── backend/           # Flask 백엔드 API
│   ├── app.py                    # 메인 서버 (모델 학습 + SQLite DB)
│   ├── requirements.txt          # Python 의존성
│   └── data/
│       └── train_preprocessed.tsv  # 학습 데이터셋 (7,898건)
│
└── README.md
```

## 🚀 실행 방법

### 1. 백엔드 서버 (Python)

```bash
cd backend

# 가상환경 생성 (권장)
python -m venv venv
venv\Scripts\activate        # Windows
# source venv/bin/activate   # Mac/Linux

# 의존성 설치
pip install -r requirements.txt

# 서버 실행 (자동으로 모델 학습)
python app.py
```

서버가 시작되면 자동으로:
- `train_preprocessed.tsv` 데이터로 TF-IDF 모델을 학습합니다.
- SQLite 데이터베이스(`nudge.db`)를 초기화합니다.
- `http://localhost:5000` 에서 API를 제공합니다.

### 2. 프론트엔드 (React)

```bash
cd frontend

# 의존성 설치
npm install

# 개발 서버 실행
npm start
```

`http://localhost:3000` 에서 앱이 열립니다.

## 💡 주요 기능

### 3단계 넛지 시스템
| 레벨 | 확률 범위 | 동작 |
|------|-----------|------|
| ✅ 안전 | 0.0 ~ 0.7 | 자유롭게 게시 |
| ⚠️ 주의 | 0.7 ~ 0.9 | 경고 표시, 게시 가능 (기록됨) |
| 🚫 위험 | 0.9 ~ 1.0 | 강한 경고, 게시 차단 |

### 페이지 구성
- **`/`** — 메인 피드 (게시글 작성 + 실시간 넛지 적용)
- **`/demo`** — AI 넛지 시스템 인터랙티브 데모
- **`/admin`** — 관리자 모니터링 (경고 무시 목록, 게시글 삭제)

### API 엔드포인트
| 메서드 | 경로 | 설명 |
|--------|------|------|
| POST | `/api/analyze` | 텍스트 악성 확률 분석 |
| GET | `/api/posts` | 게시글 목록 조회 |
| POST | `/api/posts` | 게시글 작성 (넛지 로그 포함) |
| DELETE | `/api/posts/<id>` | 게시글 삭제 (관리자) |
| GET | `/api/admin/flagged` | 경고 무시 게시글 목록 |
| GET | `/api/admin/stats` | 관리자 통계 |
| GET | `/api/health` | 서버 상태 확인 |

### 데이터베이스 (SQLite)
- **posts** — 모든 게시글 (작성자, 내용, 삭제 상태)
- **nudge_logs** — 넛지 분석 이력 (경고 무시 여부, 확률, 감지된 단어)

## 🧠 AI 모델

- **알고리즘**: TF-IDF + Logistic Regression
- **데이터**: korean-hate-speech 데이터셋 (7,898건)
- **분류**: 이진 분류 (정상 vs 악성)
- **특성**: 형태소 분석된 텍스트, TF-IDF 가중치 상위 10,000개

## 🛠️ 기술 스택

| 구분 | 기술 |
|------|------|
| 프론트엔드 | React 18, Redux Toolkit, Styled-Components |
| 백엔드 | Python Flask, scikit-learn |
| 데이터베이스 | SQLite |
| 모델 | TF-IDF + Logistic Regression |
| 테마 | Weverse 스타일 (라이트 모드) |
