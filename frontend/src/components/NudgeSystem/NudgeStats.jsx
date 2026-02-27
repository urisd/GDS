import styled from 'styled-components';
import { useSelector } from 'react-redux';
import { FaShieldHalved, FaTriangleExclamation, FaCircleXmark, FaChartLine } from 'react-icons/fa6';

const StatsWrap = styled.div`
  background: ${({ theme }) => theme.bgSecondary};
  border: 1px solid ${({ theme }) => theme.borderColor};
  border-radius: ${({ theme }) => theme.radiusSm};
  padding: 16px;
`;

const StatsTitle = styled.h3`
  font-size: 0.95rem;
  font-weight: 600;
  margin-bottom: 12px;
  display: flex;
  align-items: center;
  gap: 8px;

  svg {
    color: ${({ theme }) => theme.accent};
  }
`;

const StatsGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 8px;
`;

const StatItem = styled.div`
  background: ${({ theme }) => theme.bgTertiary};
  border-radius: 8px;
  padding: 10px;
  text-align: center;
`;

const StatValue = styled.div`
  font-size: 1.3rem;
  font-weight: 700;
  color: ${({ color, theme }) => color || theme.textPrimary};
`;

const StatLabel = styled.div`
  font-size: 0.7rem;
  color: ${({ theme }) => theme.textTertiary};
  margin-top: 2px;
`;

const NudgeStats = () => {
    const { stats } = useSelector((state) => state.nudge);

    return (
        <StatsWrap>
            <StatsTitle>
                <FaChartLine /> 넛지 통계
            </StatsTitle>
            <StatsGrid>
                <StatItem>
                    <StatValue color="#00FAD9">{stats.totalChecks}</StatValue>
                    <StatLabel>총 검사</StatLabel>
                </StatItem>
                <StatItem>
                    <StatValue color="#fbbf24">{stats.warningCount}</StatValue>
                    <StatLabel>⚠️ 주의</StatLabel>
                </StatItem>
                <StatItem>
                    <StatValue color="#f87171">{stats.dangerCount}</StatValue>
                    <StatLabel>🚫 위험</StatLabel>
                </StatItem>
                <StatItem>
                    <StatValue color="#4ade80">{stats.totalChecks - stats.warningCount - stats.dangerCount}</StatValue>
                    <StatLabel>✅ 안전</StatLabel>
                </StatItem>
            </StatsGrid>
        </StatsWrap>
    );
};

export default NudgeStats;
