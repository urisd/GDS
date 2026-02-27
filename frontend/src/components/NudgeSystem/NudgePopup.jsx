import styled, { keyframes } from 'styled-components';
import { FaCircleExclamation, FaCircleXmark, FaTriangleExclamation } from 'react-icons/fa6';

const fadeInUp = keyframes`
  from {
    opacity: 0;
    transform: translateY(8px) scaleY(0.9);
    max-height: 0;
    margin: 0 16px;
    padding: 0 16px;
  }
  to {
    opacity: 1;
    transform: translateY(0) scaleY(1);
    max-height: 200px;
    margin: 8px 16px;
    padding: 12px 16px;
  }
`;

const PopupWrap = styled.div`
  margin: 8px 16px;
  padding: 12px 16px;
  border-radius: ${({ theme }) => theme.radiusSm};
  display: flex;
  align-items: flex-start;
  gap: 12px;
  backdrop-filter: blur(10px);
  animation: ${fadeInUp} 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards;

  ${({ level, theme }) =>
    level === 'warning'
      ? `
    background: ${theme.warnBg};
    border: 1px solid rgba(245, 158, 11, 0.3);
  `
      : `
    background: ${theme.dangerBg};
    border: 1px solid rgba(239, 68, 68, 0.3);
  `}
`;

const IconWrap = styled.div`
  font-size: 1.2rem;
  margin-top: 2px;
  color: ${({ level, theme }) =>
    level === 'warning' ? theme.warnText : theme.dangerText};
`;

const Body = styled.div`
  flex: 1;
`;

const Title = styled.strong`
  font-size: 0.8rem;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  display: block;
  margin-bottom: 2px;
  color: ${({ level, theme }) =>
    level === 'warning' ? theme.warnText : theme.dangerText};
`;

const Message = styled.p`
  font-size: 0.9rem;
  color: ${({ theme }) => theme.textSecondary};
  margin: 0;
  line-height: 1.5;
`;

const ProbBar = styled.div`
  margin-top: 8px;
  height: 4px;
  border-radius: 2px;
  background: rgba(0, 0, 0, 0.05);
  overflow: hidden;
`;

const ProbFill = styled.div`
  height: 100%;
  border-radius: 2px;
  transition: width 0.4s ease;
  width: ${({ prob }) => `${prob * 100}%`};
  background: ${({ level, theme }) =>
    level === 'warning'
      ? `linear-gradient(90deg, ${theme.warnBorder}, ${theme.warnText})`
      : `linear-gradient(90deg, ${theme.dangerBorder}, ${theme.dangerText})`};
`;

const NudgePopup = ({ level, title, message, probability }) => {
  if (level === 'safe') return null;

  const Icon = level === 'danger' ? FaCircleXmark : FaTriangleExclamation;

  return (
    <PopupWrap level={level}>
      <IconWrap level={level}>
        <Icon />
      </IconWrap>
      <Body>
        <Title level={level}>{title || (level === 'danger' ? '경고' : '잠깐만요')}</Title>
        <Message>{message}</Message>
        <ProbBar>
          <ProbFill prob={probability} level={level} />
        </ProbBar>
      </Body>
    </PopupWrap>
  );
};

export default NudgePopup;
