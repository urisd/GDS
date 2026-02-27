import styled from 'styled-components';
import { useSelector } from 'react-redux';
import NudgeStats from '../NudgeSystem/NudgeStats';
import { Link } from 'react-router-dom';
import { FaArrowRight, FaFire, FaFlask } from 'react-icons/fa6';

const SidebarWrap = styled.aside`
  position: fixed;
  top: ${({ theme }) => theme.headerHeight};
  right: 0;
  width: ${({ theme }) => theme.rightSidebarWidth};
  height: calc(100vh - ${({ theme }) => theme.headerHeight});
  padding: 20px 16px;
  display: flex;
  flex-direction: column;
  gap: 16px;
  overflow-y: auto;
  border-left: 1px solid ${({ theme }) => theme.borderColor};
`;

const SidebarCard = styled.div`
  background: ${({ theme }) => theme.bgSecondary};
  border: 1px solid ${({ theme }) => theme.borderColor};
  border-radius: ${({ theme }) => theme.radiusSm};
  padding: 16px;
`;

const CardTitle = styled.h3`
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

const TrendingList = styled.ul`
  list-style: none;
`;

const TrendingItem = styled.li`
  padding: 8px 0;
  font-size: 0.85rem;
  color: ${({ theme }) => theme.textSecondary};
  display: flex;
  align-items: center;
  gap: 10px;
  border-bottom: 1px solid ${({ theme }) => theme.borderColor};
  cursor: pointer;
  transition: color ${({ theme }) => theme.transition};

  &:last-child {
    border-bottom: none;
  }

  &:hover {
    color: ${({ theme }) => theme.textPrimary};
  }
`;

const Rank = styled.span`
  color: ${({ theme }) => theme.accent};
  font-weight: 700;
  font-size: 0.9rem;
  min-width: 18px;
`;

const Notice = styled.p`
  font-size: 0.85rem;
  color: ${({ theme }) => theme.textSecondary};
  line-height: 1.6;
`;

const DemoButton = styled(Link)`
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  justify-content: center;
  gap: 6px;
  width: 100%;
  padding: 12px 12px;
  border-radius: 10px;
  background: ${({ theme }) => theme.bgTertiary};
  border: 1px solid ${({ theme }) => theme.borderColor};
  color: ${({ theme }) => theme.textPrimary};
  text-decoration: none;
  font-size: 0.9rem;
  transition: all ${({ theme }) => theme.transition};

  &:hover {
    background: ${({ theme }) => theme.bgHover};
    border-color: ${({ theme }) => theme.accent};
  }

  &:focus-visible {
    outline: 2px solid ${({ theme }) => theme.accent};
    outline-offset: 2px;
  }
`;

const DemoButtonRight = styled.span`
  display: inline-flex;
  align-items: center;
  gap: 6px;
  color: ${({ theme }) => theme.textSecondary};
  font-size: 0.85rem;
  align-self: flex-end;
`;

const RightSidebar = () => {
  const { trending } = useSelector((state) => state.feed);

  return (
    <SidebarWrap>
      {/* 실시간 데모 */}
      <SidebarCard>
        <CardTitle><FaFlask /> 실시간 데모</CardTitle>
        <DemoButton to="/demo" aria-label="실시간 데모 바로가기">
          실시간 댓글을 분석해보세요
          <DemoButtonRight>
            바로가기 <FaArrowRight />
          </DemoButtonRight>
        </DemoButton>
      </SidebarCard>

      {/* 넛지 통계 */}
      <NudgeStats />

      {/* 인기 게시글 */}
      <SidebarCard>
        <CardTitle><FaFire style={{ color: '#f59e0b' }} /> 인기 게시글</CardTitle>
        <TrendingList>
          {trending.map((item, idx) => (
            <TrendingItem key={idx}>
              <Rank>{idx + 1}</Rank>
              {item}
            </TrendingItem>
          ))}
        </TrendingList>
      </SidebarCard>

      {/* 커뮤니티 안내 */}
      <SidebarCard>
        <CardTitle>커뮤니티 안내</CardTitle>
        <Notice>
          건전한 소통 문화를 위해 AI 기반 댓글 넛지 시스템이 운영되고 있습니다.
          타인을 존중하는 댓글을 작성해주세요. 💚
        </Notice>
      </SidebarCard>
    </SidebarWrap>
  );
};

export default RightSidebar;
