import styled from 'styled-components';
import { useSelector } from 'react-redux';
import Header from '../components/Header/Header';
import Sidebar from '../components/Sidebar/Sidebar';
import PostComposer from '../components/Feed/PostComposer';
import PostCard from '../components/Feed/PostCard';
import RightSidebar from '../components/RightSidebar/RightSidebar';

const Layout = styled.div`
  display: flex;
  margin-top: ${({ theme }) => theme.headerHeight};
  min-height: calc(100vh - ${({ theme }) => theme.headerHeight});
`;

const MainFeed = styled.main`
  flex: 1;
  margin-left: ${({ theme }) => theme.sidebarWidth};
  margin-right: ${({ theme }) => theme.rightSidebarWidth};
  max-width: 680px;
  padding: 0 24px;
  margin-left: calc(${({ theme }) => theme.sidebarWidth} + (100% - ${({ theme }) => theme.sidebarWidth} - ${({ theme }) => theme.rightSidebarWidth} - 680px) / 2);
`;

const FeedTabs = styled.nav`
  position: sticky;
  top: ${({ theme }) => theme.headerHeight};
  background: rgba(255, 255, 255, 0.9);
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
  display: flex;
  border-bottom: 1px solid ${({ theme }) => theme.borderColor};
  z-index: 10;
`;

const Tab = styled.button`
  flex: 1;
  padding: 16px 0;
  background: none;
  border: none;
  color: ${({ active, theme }) => active ? theme.accent : theme.textSecondary};
  font-family: inherit;
  font-size: 0.95rem;
  font-weight: 500;
  position: relative;
  transition: color ${({ theme }) => theme.transition};

  &:hover {
    color: ${({ theme }) => theme.textPrimary};
  }

  ${({ active, theme }) =>
    active &&
    `
    &::after {
      content: '';
      position: absolute;
      bottom: 0;
      left: 50%;
      transform: translateX(-50%);
      width: 40px;
      height: 3px;
      background: ${theme.accent};
      border-radius: 3px 3px 0 0;
    }
  `}
`;

const FeedList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 16px;
  padding-bottom: 40px;
`;

const FeedPage = () => {
  const { posts, activeTab } = useSelector((state) => state.feed);

  return (
    <>
      <Header />
      <Layout>
        <Sidebar />
        <MainFeed>
          <FeedTabs>
            <Tab active={activeTab === 'feed'}>Feed</Tab>
            <Tab active={activeTab === 'artist'}>Artist</Tab>
            <Tab active={activeTab === 'media'}>Media</Tab>
          </FeedTabs>

          <PostComposer />

          <FeedList>
            {posts.map((post) => (
              <PostCard key={post.id} post={post} />
            ))}
          </FeedList>
        </MainFeed>
        <RightSidebar />
      </Layout>
    </>
  );
};

export default FeedPage;
