import styled from 'styled-components';
import { useState, useEffect, useCallback } from 'react';
import { fetchFlagged, fetchAdminStats, deletePost, fetchPosts } from '../services/nudgeAPI';
import Header from '../components/Header/Header';
import { FaArrowLeft, FaShieldHalved, FaTrashCan, FaTriangleExclamation, FaCircleXmark, FaChartBar } from 'react-icons/fa6';
import { Link } from 'react-router-dom';

const Layout = styled.div`
  margin-top: ${({ theme }) => theme.headerHeight};
  min-height: calc(100vh - ${({ theme }) => theme.headerHeight});
  display: flex;
  justify-content: center;
  padding: 40px 24px;
`;

const Container = styled.div`
  max-width: 900px;
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
  &:hover { opacity: 0.8; }
`;

const Title = styled.h1`
  font-size: 1.8rem;
  font-weight: 700;
  margin-bottom: 8px;
  span { color: ${({ theme }) => theme.accent}; }
`;

const Subtitle = styled.p`
  color: ${({ theme }) => theme.textSecondary};
  margin-bottom: 32px;
`;

const StatsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 12px;
  margin-bottom: 32px;
`;

const StatCard = styled.div`
  background: ${({ theme }) => theme.bgSecondary};
  border: 1px solid ${({ theme }) => theme.borderColor};
  border-radius: ${({ theme }) => theme.radiusSm};
  padding: 16px;
  text-align: center;

  .value {
    font-size: 1.6rem;
    font-weight: 700;
    color: ${({ color, theme }) => color || theme.textPrimary};
  }
  .label {
    font-size: 0.75rem;
    color: ${({ theme }) => theme.textTertiary};
    margin-top: 4px;
  }
`;

const SectionTitle = styled.h2`
  font-size: 1.1rem;
  font-weight: 600;
  margin-bottom: 16px;
  display: flex;
  align-items: center;
  gap: 10px;
  svg { color: ${({ theme }) => theme.accent}; }
`;

const Table = styled.table`
  width: 100%;
  border-collapse: collapse;
  margin-bottom: 32px;
  background: ${({ theme }) => theme.bgSecondary};
  border: 1px solid ${({ theme }) => theme.borderColor};
  border-radius: ${({ theme }) => theme.radiusSm};
  overflow: hidden;
`;

const Th = styled.th`
  padding: 12px 14px;
  text-align: left;
  font-size: 0.8rem;
  font-weight: 600;
  color: ${({ theme }) => theme.textSecondary};
  border-bottom: 1px solid ${({ theme }) => theme.borderColor};
  background: ${({ theme }) => theme.bgTertiary};
`;

const Td = styled.td`
  padding: 10px 14px;
  font-size: 0.85rem;
  border-bottom: 1px solid ${({ theme }) => theme.borderColor};
  vertical-align: middle;
  max-width: 300px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

const Badge = styled.span`
  display: inline-block;
  padding: 2px 10px;
  border-radius: 12px;
  font-size: 0.7rem;
  font-weight: 600;
  background: ${({ level, theme }) =>
        level === 'danger' ? theme.dangerBg :
            level === 'warning' ? theme.warnBg : theme.safeBg};
  color: ${({ level, theme }) =>
        level === 'danger' ? theme.dangerText :
            level === 'warning' ? theme.warnText : theme.safeText};
`;

const DeletedBadge = styled.span`
  display: inline-block;
  padding: 2px 8px;
  border-radius: 12px;
  font-size: 0.7rem;
  font-weight: 600;
  background: rgba(239, 68, 68, 0.15);
  color: #ef4444;
`;

const DeleteBtn = styled.button`
  background: ${({ theme }) => theme.dangerBg};
  border: 1px solid ${({ theme }) => theme.dangerBorder};
  color: ${({ theme }) => theme.dangerText};
  padding: 4px 12px;
  border-radius: 6px;
  font-size: 0.75rem;
  display: inline-flex;
  align-items: center;
  gap: 4px;
  transition: all 0.2s;
  &:hover {
    background: ${({ theme }) => theme.dangerBorder};
    color: white;
  }
`;

const EmptyMsg = styled.p`
  text-align: center;
  color: ${({ theme }) => theme.textTertiary};
  padding: 40px 0;
`;

const TabBar = styled.div`
  display: flex;
  gap: 4px;
  margin-bottom: 24px;
`;

const Tab = styled.button`
  padding: 8px 20px;
  border-radius: 8px;
  font-size: 0.85rem;
  font-weight: 500;
  border: 1px solid ${({ active, theme }) => active ? theme.accent : theme.borderColor};
  background: ${({ active, theme }) => active ? theme.accentDim : 'transparent'};
  color: ${({ active, theme }) => active ? theme.accentText : theme.textSecondary};
  transition: all 0.2s;
`;

const AdminPage = () => {
    const [stats, setStats] = useState(null);
    const [flagged, setFlagged] = useState([]);
    const [allPosts, setAllPosts] = useState([]);
    const [tab, setTab] = useState('flagged');

    const loadData = useCallback(async () => {
        const [s, f, p] = await Promise.all([
            fetchAdminStats(),
            fetchFlagged(),
            fetchPosts(),
        ]);
        setStats(s);
        setFlagged(f);
        setAllPosts(p);
    }, []);

    useEffect(() => { loadData(); }, [loadData]);

    const handleDelete = async (postId) => {
        if (!window.confirm(`게시글 #${postId}를 삭제하시겠습니까?`)) return;
        await deletePost(postId);
        loadData();
    };

    return (
        <>
            <Header />
            <Layout>
                <Container>
                    <BackLink to="/"><FaArrowLeft /> 커뮤니티로 돌아가기</BackLink>
                    <Title><span>관리자</span> 모니터링</Title>
                    <Subtitle>경고를 무시하고 게시된 댓글을 추적하고 관리합니다.</Subtitle>

                    {stats && (
                        <StatsGrid>
                            <StatCard>
                                <div className="value">{stats.totalPosts}</div>
                                <div className="label">총 게시글</div>
                            </StatCard>
                            <StatCard color="#16a34a">
                                <div className="value">{stats.safePosts}</div>
                                <div className="label">✅ 안전 게시</div>
                            </StatCard>
                            <StatCard color="#d97706">
                                <div className="value">{stats.warningsIgnored}</div>
                                <div className="label">⚠️ 주의 무시</div>
                            </StatCard>
                            <StatCard color="#dc2626">
                                <div className="value">{stats.dangersIgnored + stats.deletedPosts}</div>
                                <div className="label">🚫 위험/삭제</div>
                            </StatCard>
                        </StatsGrid>
                    )}

                    <TabBar>
                        <Tab active={tab === 'flagged'} onClick={() => setTab('flagged')}>
                            <FaTriangleExclamation /> 경고 무시 목록
                        </Tab>
                        <Tab active={tab === 'all'} onClick={() => setTab('all')}>
                            <FaChartBar /> 전체 게시글
                        </Tab>
                    </TabBar>

                    {tab === 'flagged' && (
                        <>
                            <SectionTitle><FaShieldHalved /> 경고를 무시하고 게시된 댓글</SectionTitle>
                            {flagged.length === 0 ? (
                                <EmptyMsg>경고를 무시하고 작성된 댓글이 없습니다. 👍</EmptyMsg>
                            ) : (
                                <Table>
                                    <thead>
                                        <tr>
                                            <Th>#</Th>
                                            <Th>작성자</Th>
                                            <Th>내용</Th>
                                            <Th>레벨</Th>
                                            <Th>확률</Th>
                                            <Th>상태</Th>
                                            <Th>조치</Th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {flagged.map((log) => (
                                            <tr key={log.id}>
                                                <Td>{log.post_id}</Td>
                                                <Td>{log.author}</Td>
                                                <Td title={log.content}>{log.content}</Td>
                                                <Td><Badge level={log.nudge_level}>{log.nudge_level}</Badge></Td>
                                                <Td>{(log.probability * 100).toFixed(1)}%</Td>
                                                <Td>
                                                    {log.is_deleted
                                                        ? <DeletedBadge>삭제됨</DeletedBadge>
                                                        : <span style={{ color: '#16a34a', fontSize: '0.8rem' }}>게시중</span>}
                                                </Td>
                                                <Td>
                                                    {!log.is_deleted && (
                                                        <DeleteBtn onClick={() => handleDelete(log.post_id)}>
                                                            <FaTrashCan /> 삭제
                                                        </DeleteBtn>
                                                    )}
                                                </Td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </Table>
                            )}
                        </>
                    )}

                    {tab === 'all' && (
                        <>
                            <SectionTitle><FaChartBar /> 전체 게시글 목록</SectionTitle>
                            {allPosts.length === 0 ? (
                                <EmptyMsg>아직 게시된 글이 없습니다.</EmptyMsg>
                            ) : (
                                <Table>
                                    <thead>
                                        <tr>
                                            <Th>#</Th>
                                            <Th>작성자</Th>
                                            <Th>내용</Th>
                                            <Th>커뮤니티</Th>
                                            <Th>작성일</Th>
                                            <Th>조치</Th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {allPosts.map((p) => (
                                            <tr key={p.id}>
                                                <Td>{p.id}</Td>
                                                <Td>{p.author}</Td>
                                                <Td title={p.content}>{p.content}</Td>
                                                <Td>{p.community}</Td>
                                                <Td style={{ fontSize: '0.75rem' }}>{new Date(p.created_at).toLocaleString('ko-KR')}</Td>
                                                <Td>
                                                    <DeleteBtn onClick={() => handleDelete(p.id)}>
                                                        <FaTrashCan /> 삭제
                                                    </DeleteBtn>
                                                </Td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </Table>
                            )}
                        </>
                    )}
                </Container>
            </Layout>
        </>
    );
};

export default AdminPage;
