import styled, { keyframes } from 'styled-components';
import { useState, useRef } from 'react';
import { analyzeText } from '../services/nudgeAPI';
import NudgePopup from '../components/NudgeSystem/NudgePopup';
import Header from '../components/Header/Header';
import { FaArrowLeft, FaFlask, FaShieldHalved, FaTriangleExclamation, FaCircleXmark, FaCircleCheck } from 'react-icons/fa6';
import { Link } from 'react-router-dom';

const Layout = styled.div`
  margin-top: ${({ theme }) => theme.headerHeight};
  min-height: calc(100vh - ${({ theme }) => theme.headerHeight});
  display: flex;
  justify-content: center;
  padding: 40px 24px;
`;

const Container = styled.div`
  max-width: 720px;
  width: 100%;
`;

const BackLink = styled(Link)`
  display: inline-flex;
  align-items: center;
  gap: 8px;
  color: ${({ theme }) => theme.accent};
  font-size: 0.9rem;
  margin-bottom: 32px;
  transition: opacity 0.2s;

  &:hover {
    opacity: 0.8;
  }
`;

const Title = styled.h1`
  font-size: 2rem;
  font-weight: 700;
  margin-bottom: 8px;

  span {
    color: ${({ theme }) => theme.accent};
  }
`;

const Subtitle = styled.p`
  color: ${({ theme }) => theme.textSecondary};
  font-size: 1rem;
  line-height: 1.6;
  margin-bottom: 40px;
`;

const Section = styled.section`
  margin-bottom: 40px;
`;

const SectionTitle = styled.h2`
  font-size: 1.1rem;
  font-weight: 600;
  margin-bottom: 16px;
  display: flex;
  align-items: center;
  gap: 10px;

  svg {
    color: ${({ theme }) => theme.accent};
  }
`;

const DemoInput = styled.div`
  background: ${({ theme }) => theme.bgSecondary};
  border: 1px solid ${({ theme, level }) =>
    level === 'danger' ? theme.dangerBorder :
      level === 'warning' ? theme.warnBorder :
        theme.borderColor};
  border-radius: ${({ theme }) => theme.radius};
  overflow: hidden;
  transition: border-color ${({ theme }) => theme.transition};
`;

const TextArea = styled.textarea`
  width: 100%;
  min-height: 120px;
  padding: 20px;
  background: transparent;
  border: none;
  outline: none;
  color: ${({ theme, level }) =>
    level === 'danger' ? theme.dangerText :
      level === 'warning' ? theme.warnText :
        theme.textPrimary};
  font-family: inherit;
  font-size: 1rem;
  resize: none;
  line-height: 1.7;

  &::placeholder {
    color: ${({ theme }) => theme.textTertiary};
  }
`;

const ResultBox = styled.div`
  background: ${({ theme }) => theme.bgTertiary};
  border-radius: ${({ theme }) => theme.radiusSm};
  padding: 20px;
  margin-top: 16px;
`;

const ResultRow = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 0;
  border-bottom: 1px solid ${({ theme }) => theme.borderColor};

  &:last-child {
    border-bottom: none;
  }
`;

const ResultLabel = styled.span`
  color: ${({ theme }) => theme.textSecondary};
  font-size: 0.9rem;
`;

const ResultValue = styled.span`
  font-weight: 600;
  font-size: 0.95rem;
  color: ${({ color }) => color || '#f5f5f5'};
`;

const LevelCards = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr 1fr;
  gap: 12px;
`;

const LevelCard = styled.div`
  background: ${({ theme }) => theme.bgSecondary};
  border: 1px solid ${({ theme }) => theme.borderColor};
  border-radius: ${({ theme }) => theme.radiusSm};
  padding: 20px 16px;
  text-align: center;

  svg {
    font-size: 1.5rem;
    margin-bottom: 8px;
  }

  h4 {
    font-size: 0.85rem;
    margin-bottom: 4px;
  }

  p {
    font-size: 0.75rem;
    color: ${({ theme }) => theme.textTertiary};
    line-height: 1.5;
  }
`;

const ExampleBtns = styled.div`
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
  margin-top: 12px;
`;

const ExampleBtn = styled.button`
  background: ${({ theme }) => theme.bgTertiary};
  border: 1px solid ${({ theme }) => theme.borderColor};
  color: ${({ theme }) => theme.textSecondary};
  padding: 6px 14px;
  border-radius: 20px;
  font-size: 0.8rem;
  transition: all ${({ theme }) => theme.transition};

  &:hover {
    border-color: ${({ theme }) => theme.accent};
    color: ${({ theme }) => theme.accent};
  }
`;

const EXAMPLES = [
  { text: '오늘 컴백 너무 기대돼요! 💕', label: '안전' },
  { text: '진짜 노잼이야 짜증나', label: '주의' },
  { text: '진짜 병신같다 씨발', label: '위험' },
];

const DemoPage = () => {
  const [text, setText] = useState('');
  const [result, setResult] = useState(null);
  const [level, setLevel] = useState('safe');
  const timerRef = useRef(null);

  const handleChange = (e) => {
    const value = e.target.value;
    setText(value);

    clearTimeout(timerRef.current);
    if (value.trim().length > 0) {
      timerRef.current = setTimeout(async () => {
        const res = await analyzeText(value);
        setResult(res);
        setLevel(res.nudgeLevel);
      }, 400);
    } else {
      setResult(null);
      setLevel('safe');
    }
  };

  const handleExample = (exText) => {
    setText(exText);
    setTimeout(async () => {
      const res = await analyzeText(exText);
      setResult(res);
      setLevel(res.nudgeLevel);
    }, 100);
  };

  const getLevelColor = (l) => {
    if (l === 'danger') return '#f87171';
    if (l === 'warning') return '#fbbf24';
    return '#4ade80';
  };

  const getLevelText = (l) => {
    if (l === 'danger') return '🚫 위험';
    if (l === 'warning') return '⚠️ 주의';
    return '✅ 안전';
  };

  return (
    <>
      <Header />
      <Layout>
        <Container>
          <BackLink to="/"><FaArrowLeft /> 커뮤니티로 돌아가기</BackLink>

          <Title>AI 댓글 <span>넛지</span> 시스템</Title>
          <Subtitle>
            TF-IDF + 로지스틱 회귀 모델을 활용하여 작성 중인 텍스트의 악성 확률을 실시간으로 분석합니다.
            확률에 따라 3단계 넛지(안전 / 주의 / 위험)를 적용하여 건전한 소통 문화를 유도합니다.
          </Subtitle>

          {/* 3단계 설명 */}
          <Section>
            <SectionTitle><FaShieldHalved /> 3단계 넛지 시스템</SectionTitle>
            <LevelCards>
              <LevelCard>
                <FaCircleCheck style={{ color: '#4ade80' }} />
                <h4>안전 (0.0 ~ 0.7)</h4>
                <p>정상적인 댓글입니다. 자유롭게 게시할 수 있습니다.</p>
              </LevelCard>
              <LevelCard>
                <FaTriangleExclamation style={{ color: '#fbbf24' }} />
                <h4>주의 (0.7 ~ 0.9)</h4>
                <p>불쾌감을 줄 수 있는 표현이 감지되었습니다. 부드러운 표현을 권장합니다.</p>
              </LevelCard>
              <LevelCard>
                <FaCircleXmark style={{ color: '#f87171' }} />
                <h4>위험 (0.9 ~ 1.0)</h4>
                <p>명백한 욕설/비방이 감지되었습니다. 게시가 차단됩니다.</p>
              </LevelCard>
            </LevelCards>
          </Section>

          {/* 데모 */}
          <Section>
            <SectionTitle><FaFlask /> 실시간 데모</SectionTitle>
            <DemoInput level={level}>
              <TextArea
                value={text}
                onChange={handleChange}
                placeholder="여기에 텍스트를 입력해 보세요..."
                level={level}
              />
              {level !== 'safe' && result && (
                <NudgePopup
                  level={level}
                  message={result.nudgeMessage}
                  probability={result.probability}
                />
              )}
            </DemoInput>

            <ExampleBtns>
              {EXAMPLES.map((ex, idx) => (
                <ExampleBtn key={idx} onClick={() => handleExample(ex.text)}>
                  {ex.label}: &quot;{ex.text.slice(0, 15)}...&quot;
                </ExampleBtn>
              ))}
            </ExampleBtns>

            {result && (
              <ResultBox>
                <ResultRow>
                  <ResultLabel>악성 확률</ResultLabel>
                  <ResultValue color={getLevelColor(result.nudgeLevel)}>
                    {(result.probability * 100).toFixed(1)}%
                  </ResultValue>
                </ResultRow>
                <ResultRow>
                  <ResultLabel>넛지 레벨</ResultLabel>
                  <ResultValue color={getLevelColor(result.nudgeLevel)}>
                    {getLevelText(result.nudgeLevel)}
                  </ResultValue>
                </ResultRow>
                {result.detectedWords && result.detectedWords.length > 0 && (
                  <ResultRow>
                    <ResultLabel>감지된 표현</ResultLabel>
                    <ResultValue color="#f87171">
                      {result.detectedWords.join(', ')}
                    </ResultValue>
                  </ResultRow>
                )}
                <ResultRow>
                  <ResultLabel>분석 방식</ResultLabel>
                  <ResultValue color="#555">
                    {result.isLocal ? '🔧 로컬 Mock' : '🤖 AI 모델'}
                  </ResultValue>
                </ResultRow>
              </ResultBox>
            )}
          </Section>
        </Container>
      </Layout>
    </>
  );
};

export default DemoPage;
