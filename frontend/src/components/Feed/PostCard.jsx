import styled from 'styled-components';
import { useState } from 'react';
import { useDispatch } from 'react-redux';
import { toggleLike } from '../../reducer/feedSlice';
import { FaHeart, FaRegHeart, FaRegComment, FaShareFromSquare, FaEllipsis } from 'react-icons/fa6';

const Card = styled.article`
  background: ${({ theme }) => theme.bgSecondary};
  border: 1px solid ${({ theme }) => theme.borderColor};
  border-radius: ${({ theme }) => theme.radius};
  overflow: hidden;
  transition: border-color ${({ theme }) => theme.transition};

  &:hover {
    border-color: ${({ theme }) => theme.borderLight};
  }

  ${({ isArtist, hasArtistReply, theme }) =>
    (isArtist || hasArtistReply) &&
    `border-left: 3px solid ${theme.accent};`}
`;

const CardHeader = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 16px 16px 0;
`;

const Avatar = styled.img`
  width: 36px;
  height: 36px;
  border-radius: 50%;
  object-fit: cover;
  flex-shrink: 0;
`;

const AvatarSm = styled.img`
  width: 28px;
  height: 28px;
  border-radius: 50%;
  object-fit: cover;
  flex-shrink: 0;
`;

const AuthorInfo = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
`;

const AuthorName = styled.span`
  font-weight: 600;
  font-size: 0.95rem;
  display: flex;
  align-items: center;
  gap: 8px;
`;

const ArtistBadge = styled.span`
  background: ${({ theme }) => theme.accent};
  color: #0f0f0f;
  font-size: ${({ small }) => small ? '0.55rem' : '0.65rem'};
  font-weight: 700;
  padding: ${({ small }) => small ? '1px 6px' : '2px 8px'};
  border-radius: 10px;
  letter-spacing: 0.5px;
  text-transform: uppercase;
`;

const CardTime = styled.span`
  font-size: 0.8rem;
  color: ${({ theme }) => theme.textTertiary};
`;

const MoreBtn = styled.button`
  background: none;
  border: none;
  color: ${({ theme }) => theme.textTertiary};
  padding: 8px;
  border-radius: 50%;
  transition: all ${({ theme }) => theme.transition};
  display: flex;

  &:hover {
    background: ${({ theme }) => theme.bgHover};
    color: ${({ theme }) => theme.textPrimary};
  }
`;

const CardBody = styled.div`
  padding: 12px 16px;
  p {
    font-size: 0.95rem;
    line-height: 1.7;
    white-space: pre-wrap;
  }
`;

const CardActions = styled.div`
  display: flex;
  padding: 4px 8px;
  border-top: 1px solid ${({ theme }) => theme.borderColor};
`;

const ActionBtn = styled.button`
  flex: 1;
  background: none;
  border: none;
  color: ${({ theme }) => theme.textSecondary};
  font-size: 0.85rem;
  padding: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  border-radius: 8px;
  transition: all ${({ theme }) => theme.transition};

  &:hover {
    background: ${({ theme }) => theme.bgHover};
    color: ${({ theme }) => theme.textPrimary};
  }

  ${({ liked, theme }) =>
    liked &&
    `
    color: ${theme.likeColor};
    background: ${theme.likeBg};
  `}
`;

const CommentsSection = styled.div`
  padding: 0 16px 12px;
`;

const CommentItem = styled.div`
  display: flex;
  gap: 10px;
  padding: 10px 0;

  & + & {
    border-top: 1px solid ${({ theme }) => theme.borderColor};
  }

  ${({ isArtist, theme }) =>
    isArtist &&
    `
    background: ${theme.accentDim};
    margin: 0 -16px;
    padding: 12px 16px;
    border-radius: ${theme.radiusSm};
    margin-bottom: 4px;
  `}
`;

const CommentBody = styled.div`
  flex: 1;
`;

const CommentAuthor = styled.span`
  font-weight: 600;
  font-size: 0.85rem;
  display: inline-flex;
  align-items: center;
  gap: 6px;
`;

const CommentText = styled.p`
  font-size: 0.9rem;
  margin: 2px 0;
  line-height: 1.5;
`;

const CommentMeta = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  margin-top: 4px;
`;

const CommentTime = styled.span`
  font-size: 0.75rem;
  color: ${({ theme }) => theme.textTertiary};
`;

const CommentLike = styled.button`
  background: none;
  border: none;
  color: ${({ isArtist, theme }) => isArtist ? theme.likeColor : theme.textTertiary};
  font-family: inherit;
  font-size: 0.75rem;
  display: flex;
  align-items: center;
  gap: 4px;
  transition: color ${({ theme }) => theme.transition};

  &:hover {
    color: ${({ theme }) => theme.likeColor};
  }
`;

const ViewAll = styled.button`
  background: none;
  border: none;
  color: ${({ theme }) => theme.textTertiary};
  font-family: inherit;
  font-size: 0.85rem;
  padding: 8px 0;
  transition: color ${({ theme }) => theme.transition};

  &:hover {
    color: ${({ theme }) => theme.textPrimary};
  }
`;

const PostCard = ({ post }) => {
  const dispatch = useDispatch();
  const [showComments, setShowComments] = useState(post.comments && post.comments.length > 0);

  const handleLike = () => {
    dispatch(toggleLike(post.id));
  };

  return (
    <Card isArtist={post.isArtist} hasArtistReply={post.hasArtistReply}>
      <CardHeader>
        <Avatar
          src={`https://ui-avatars.com/api/?name=${post.avatar}&background=${post.avatarBg?.replace('#', '') || '3b82f6'}&color=${post.avatarColor?.replace('#', '') || 'fff'}&bold=true&size=36`}
          alt={post.author}
        />
        <AuthorInfo>
          <AuthorName>
            {post.author}
            {post.isArtist && <ArtistBadge>Artist</ArtistBadge>}
          </AuthorName>
          <CardTime>{post.createdAt}</CardTime>
        </AuthorInfo>
        <MoreBtn><FaEllipsis /></MoreBtn>
      </CardHeader>

      <CardBody>
        <p>{post.content}</p>
      </CardBody>

      <CardActions>
        <ActionBtn liked={post.liked} onClick={handleLike}>
          {post.liked ? <FaHeart /> : <FaRegHeart />}
          <span>{post.likes?.toLocaleString()}</span>
        </ActionBtn>
        <ActionBtn onClick={() => setShowComments(!showComments)}>
          <FaRegComment />
          <span>{post.commentCount || 0}</span>
        </ActionBtn>
        <ActionBtn>
          <FaShareFromSquare />
        </ActionBtn>
      </CardActions>

      {showComments && post.comments && post.comments.length > 0 && (
        <CommentsSection>
          {post.comments.map((comment) => (
            <CommentItem key={comment.id} isArtist={comment.isArtist}>
              <AvatarSm
                src={`https://ui-avatars.com/api/?name=${comment.avatar}&background=${comment.avatarBg?.replace('#', '') || '818cf8'}&color=${comment.avatarColor?.replace('#', '') || 'fff'}&size=28`}
                alt={comment.author}
              />
              <CommentBody>
                <CommentAuthor>
                  {comment.author}
                  {comment.isArtist && <ArtistBadge small>Artist</ArtistBadge>}
                </CommentAuthor>
                <CommentText>{comment.content}</CommentText>
                <CommentMeta>
                  <CommentTime>{comment.createdAt}</CommentTime>
                  <CommentLike isArtist={comment.isArtist}>
                    {comment.isArtist ? <FaHeart /> : <FaRegHeart />} {comment.likes}
                  </CommentLike>
                </CommentMeta>
              </CommentBody>
            </CommentItem>
          ))}
          {post.commentCount > post.comments.length && (
            <ViewAll>댓글 {post.commentCount}개 모두 보기</ViewAll>
          )}
        </CommentsSection>
      )}
    </Card>
  );
};

export default PostCard;
