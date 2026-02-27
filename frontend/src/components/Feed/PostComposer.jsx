import styled from 'styled-components';
import { useState, useRef, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { addPost } from '../../reducer/feedSlice';
import { setNudgeResult, clearNudge } from '../../reducer/nudgeSlice';
import { analyzeText } from '../../services/nudgeAPI';
import NudgePopup from '../NudgeSystem/NudgePopup';
import { FaImage, FaChartBar } from 'react-icons/fa6';

const ComposerWrap = styled.div`
  background: ${({ theme }) => theme.bgSecondary};
  border: 1px solid ${({ theme, level }) =>
        level === 'danger' ? theme.dangerBorder :
            level === 'warning' ? theme.warnBorder :
                theme.borderColor};
  border-radius: ${({ theme }) => theme.radius};
  margin: 20px 0;
  overflow: hidden;
  transition: border-color ${({ theme }) => theme.transition};

  &.shake-animation {
    animation: shake 0.5s ease-in-out;
  }
`;

const ComposerTop = styled.div`
  display: flex;
  gap: 12px;
  padding: 16px 16px 0;
`;

const Avatar = styled.img`
  width: 36px;
  height: 36px;
  border-radius: 50%;
  object-fit: cover;
  flex-shrink: 0;
`;

const TextArea = styled.textarea`
  flex: 1;
  min-height: 80px;
  background: transparent;
  border: none;
  outline: none;
  color: ${({ theme, level }) =>
        level === 'danger' ? theme.dangerText :
            level === 'warning' ? theme.warnText :
                theme.textPrimary};
  font-family: inherit;
  font-size: 0.95rem;
  resize: none;
  line-height: 1.6;
  transition: color ${({ theme }) => theme.transition};

  &::placeholder {
    color: ${({ theme }) => theme.textTertiary};
  }
`;

const ComposerBottom = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 16px;
  border-top: 1px solid ${({ theme }) => theme.borderColor};
`;

const Tools = styled.div`
  display: flex;
  gap: 4px;
`;

const ToolBtn = styled.button`
  background: none;
  border: none;
  color: ${({ theme }) => theme.accentText};
  font-size: 1rem;
  padding: 8px;
  border-radius: 8px;
  transition: all ${({ theme }) => theme.transition};
  display: flex;
  align-items: center;

  &:hover {
    background: ${({ theme }) => theme.accentDim};
  }
`;

const Meta = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
`;

const CharCount = styled.span`
  font-size: 0.8rem;
  color: ${({ isOver, theme }) => isOver ? theme.dangerText : theme.textTertiary};
`;

const PostBtn = styled.button`
  background: ${({ theme }) => theme.accent};
  color: #0f0f0f;
  border: none;
  padding: 8px 20px;
  border-radius: 20px;
  font-size: 0.85rem;
  font-weight: 600;
  transition: all ${({ theme }) => theme.transition};

  &:hover:not(:disabled) {
    filter: brightness(1.1);
    transform: translateY(-1px);
  }

  &:disabled {
    background: ${({ theme }) => theme.bgTertiary};
    color: ${({ theme }) => theme.textTertiary};
    cursor: not-allowed;
  }
`;

const MAX_CHARS = 500;
const TYPING_INTERVAL = 500;

const PostComposer = () => {
    const dispatch = useDispatch();
    const { currentLevel, message, probability } = useSelector((state) => state.nudge);
    const [text, setText] = useState('');
    const composerRef = useRef(null);
    const timerRef = useRef(null);

    const handleChange = useCallback((e) => {
        const value = e.target.value;
        setText(value);

        clearTimeout(timerRef.current);

        if (value.trim().length > 0) {
            timerRef.current = setTimeout(async () => {
                const result = await analyzeText(value);
                dispatch(setNudgeResult(result));

                // Shake animation for danger
                if (result.nudgeLevel === 'danger' && composerRef.current) {
                    composerRef.current.classList.remove('shake-animation');
                    void composerRef.current.offsetWidth;
                    composerRef.current.classList.add('shake-animation');
                }
            }, TYPING_INTERVAL);
        } else {
            dispatch(clearNudge());
        }
    }, [dispatch]);

    const handleSubmit = async () => {
    if (!text.trim() || text.length > MAX_CHARS) return;
    if (currentLevel === 'danger') return;

    // 1. FastAPI 서버로 데이터 전송 및 DB 저장
    try {
        const response = await fetch('https://gds-fastapi-app-f2ahc6bzg6eyfach.koreacentral-01.azurewebsites.net/', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                content: text,
                author: 'ai9', // 현재 로그인된 유저가 있다면 그 값을 사용
                nudge_level: currentLevel,
                probability: probability
            })
        });

        if (response.ok) {
            const newPost = await response.json();
            // 2. 서버 저장 성공 시 리덕스 업데이트 (화면에 즉시 반영)
            dispatch(addPost(newPost)); 
            setText('');
            dispatch(clearNudge());
        }
    } catch (error) {
        alert("게시글 저장에 실패했습니다.");
    }
};

    const isDisabled = text.length === 0 || text.length > MAX_CHARS || currentLevel === 'danger';

    return (
        <ComposerWrap ref={composerRef} level={currentLevel}>
            <ComposerTop>
                <Avatar
                    src="https://ui-avatars.com/api/?name=ME&background=3b82f6&color=fff&size=36"
                    alt="프로필"
                />
                <TextArea
                    value={text}
                    onChange={handleChange}
                    placeholder="커뮤니티에 글을 남겨보세요..."
                    level={currentLevel}
                />
            </ComposerTop>

            {currentLevel !== 'safe' && (
                <NudgePopup
                    level={currentLevel}
                    message={message}
                    probability={probability}
                />
            )}

            <ComposerBottom>
                <Tools>
                    <ToolBtn aria-label="사진"><FaImage /></ToolBtn>
                    <ToolBtn aria-label="투표"><FaChartBar /></ToolBtn>
                </Tools>
                <Meta>
                    <CharCount isOver={text.length > MAX_CHARS}>
                        {text.length} / {MAX_CHARS}
                    </CharCount>
                    <PostBtn disabled={isDisabled} onClick={handleSubmit}>
                        게시
                    </PostBtn>
                </Meta>
            </ComposerBottom>
        </ComposerWrap>
    );
};

export default PostComposer;
