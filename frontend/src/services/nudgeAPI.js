/**
 * 넛지 API 서비스
 * - 백엔드 연동 (실패 시 로컬 Mock 폴백)
 * - 게시글 CRUD
 * - 관리자 API
 */

const API_BASE = 'http://localhost:5000';

// ============================================================
// 1) 텍스트 분석
// services/nudgeAPI.js
export const analyzeText = async (text) => {
  try {
    const response = await fetch('http://127.0.0.1:8000/analyze', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ content: text })
    });
    return await response.json(); 
    // 반환값 예시: { nudgeLevel: 'warning', message: '비속어가 포함되어 있습니다.', probability: 0.85 }
  } catch (error) {
    console.error("분석 실패:", error);
    return { nudgeLevel: 'safe', message: '', probability: 0 };
  }
};

function localAnalyze(text) {
    const dangerWords = ['병신', '씨발', '개새끼', '죽어', '자살', '새끼', '지랄'];
    const warningWords = ['바보', '멍청', '짜증', '쓰레기', '노잼', '꺼져', '닥쳐', '못생'];

    let probability = 0.1;
    const detected = [];

    for (const w of dangerWords) {
        if (text.includes(w)) {
            probability = Math.max(probability, 0.92 + Math.random() * 0.07);
            detected.push(w);
        }
    }
    if (probability < 0.7) {
        for (const w of warningWords) {
            if (text.includes(w)) {
                probability = Math.max(probability, 0.72 + Math.random() * 0.15);
                detected.push(w);
            }
        }
    }

    let level = 'safe', message = '';
    if (probability >= 0.9) {
        level = 'danger';
        message = '🚫 명백한 욕설/비방이 감지되었습니다. 게시가 차단됩니다.';
    } else if (probability >= 0.7) {
        level = 'warning';
        message = '⚠️ 불쾌감을 줄 수 있는 표현이 감지되었어요.';
    }

    return {
        probability: Math.round(probability * 1000) / 1000,
        nudgeLevel: level,
        nudgeMessage: message,
        detectedWords: detected,
        isLocal: true,
    };
}

// ============================================================
// 2) 게시글 API
// ============================================================
export const fetchPosts = async () => {
    try {
        const res = await fetch(`${API_BASE}/api/posts`);
        if (!res.ok) throw new Error();
        return await res.json();
    } catch {
        return [];
    }
};

export const createPost = async ({ content, author, community, nudgeLevel, probability, detectedWords }) => {
    try {
        const res = await fetch(`${API_BASE}/api/posts`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ content, author, community, nudgeLevel, probability, detectedWords }),
        });
        if (!res.ok) throw new Error();
        return await res.json();
    } catch {
        return null;
    }
};

export const deletePost = async (postId) => {
    try {
        const res = await fetch(`${API_BASE}/api/posts/${postId}`, {
            method: 'DELETE',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ deletedBy: '관리자' }),
        });
        if (!res.ok) throw new Error();
        return await res.json();
    } catch {
        return null;
    }
};

// ============================================================
// 3) 관리자 API
// ============================================================
export const fetchFlagged = async () => {
    try {
        const res = await fetch(`${API_BASE}/api/admin/flagged`);
        if (!res.ok) throw new Error();
        return await res.json();
    } catch {
        return [];
    }
};

export const fetchAdminStats = async () => {
    try {
        const res = await fetch(`${API_BASE}/api/admin/stats`);
        if (!res.ok) throw new Error();
        return await res.json();
    } catch {
        return {
            totalPosts: 0, deletedPosts: 0, activePosts: 0,
            totalChecks: 0, warningsIgnored: 0, dangersIgnored: 0,
            safePosts: 0, modelAccuracy: 0, modelLoaded: false,
        };
    }
};
