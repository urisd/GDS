import styled from 'styled-components';
import { useState, useRef } from 'react';
import { useDispatch } from 'react-redux';
import { toggleLike } from '../../reducer/feedSlice';
import {
  FaHeart,
  FaRegHeart,
  FaRegComment,
  FaShareFromSquare,
  FaEllipsis,
  FaImage,
  FaChartBar,
} from 'react-icons/fa6';

const API = 'https://gds-fastapi-app-f2ahc6bzg6eyfach.koreacentral-01.azurewebsites.net';

const Card = styled.article`
  background: ${({ theme }) => theme.bgSecondary};
  border: 1px solid ${({ theme }) => theme.borderColor};
  border-radius: ${({ theme }) => theme.radius};
  overflow: hidden;
  transition: border-color ${({ theme }) => theme.transition};

  &:hover:not([data-artist="true"]) {
    border-color: ${({ theme }) => theme.borderLight};
  }

  ${({ isArtist, theme }) =>
    isArtist &&
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

const CommentForm = styled.form`
  display: flex;
  align-items: flex-start;
  gap: 10px;
  margin-top: 12px;
`;

const CommentFormMain = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 4px;
  padding: 8px 10px;
  border-radius: 12px;
  background: ${({ theme }) => theme.bgTertiary};
`;

const CommentInput = styled.textarea`
  flex: 1;
  min-height: 40px;
  max-height: 72px;
  padding: 8px 0;
  border-radius: 0;
  border: none;
  background: transparent;
  color: ${({ theme }) => theme.textPrimary};
  font-family: inherit;
  font-size: 0.85rem;
  resize: none;
  overflow-y: auto;
  outline: none;

  &:focus {
    outline: none;
  }
`;

const CommentSubmit = styled.button`
  background: ${({ theme }) => theme.accent};
  color: #0f0f0f;
  border: none;
  padding: 8px 20px;
  border-radius: 20px;
  font-size: 0.85rem;
  font-weight: 600;
  cursor: pointer;
  transition: all ${({ theme }) => theme.transition};
  white-space: nowrap;

  &:hover:not(:disabled) {
    filter: brightness(1.1);
    transform: translateY(-1px);
  }

  &:disabled {
    background: ${({ theme }) => theme.bgTertiary};
    color: ${({ theme }) => theme.textTertiary};
    cursor: not-allowed;
    transform: none;
    filter: none;
  }
`;

const CommentBottom = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding-top: 8px;
  border-top: 1px solid ${({ theme }) => theme.borderColor};
`;

const CommentTools = styled.div`
  display: flex;
  gap: 4px;
`;

const CommentToolBtn = styled.button`
  background: none;
  border: none;
  color: ${({ theme }) => theme.accentText};
  font-size: 1rem;
  padding: 8px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: background ${({ theme }) => theme.transition};

  &:hover {
    background: ${({ theme }) => theme.accentDim};
  }
`;

const CommentMetaBar = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
`;

const CommentCharCount = styled.span`
  font-size: 0.8rem;
  color: ${({ isOver, theme }) => (isOver ? theme.dangerText : theme.textTertiary)};
`;

const ImagePreview = styled.div`
  position: relative;
  display: inline-block;
  margin-top: 8px;

  img {
    max-height: 120px;
    max-width: 100%;
    border-radius: 8px;
    object-fit: cover;
  }
`;

const RemoveImageBtn = styled.button`
  position: absolute;
  top: -6px;
  right: -6px;
  background: #333;
  color: white;
  border: none;
  border-radius: 50%;
  width: 20px;
  height: 20px;
  font-size: 0.7rem;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
`;

const HiddenInput = styled.input`
  display: none;
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

const CommentDelete = styled.button`
  margin-left: auto;
  background: none;
  border: none;
  color: ${({ theme }) => theme.textTertiary};
  font-family: inherit;
  font-size: 0.75rem;
  cursor: pointer;
  padding: 2px 4px;
  border-radius: 4px;
  transition: background ${({ theme }) => theme.transition}, color ${({ theme }) => theme.transition};

  &:hover {
    background: ${({ theme }) => theme.bgHover};
    color: ${({ theme }) => theme.textPrimary};
  }
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

const MAX_COMMENT_CHARS = 500;

const PostCard = ({ post }) => {
  const dispatch = useDispatch();
  const [showComments, setShowComments] = useState(post.comments && post.comments.length > 0);
  const [comments, setComments] = useState(post.comments || []);
  const [newComment, setNewComment] = useState('');
  const [commentCount, setCommentCount] = useState(post.commentCount || (post.comments ? post.comments.length : 0));
  const [commentImage, setCommentImage] = useState(null);
  const fileInputRef = useRef(null);

  const handleLike = () => {
    dispatch(toggleLike(post.id));
  };

  const handleToggleComments = () => {
    setShowComments(!showComments);
  };

  const handleImageSelect = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const url = URL.createObjectURL(file);
    setCommentImage(url);
  };

  const handleAddComment = async (e) => {
    e.preventDefault();
    const trimmed = newComment.trim();
    if (!trimmed && !commentImage) return;
    if (trimmed.length > MAX_COMMENT_CHARS) return;

    const tempComment = {
      id: Date.now(),
      author: '사용자',
      avatar: 'ME',
      avatarBg: '#3b82f6',
      avatarColor: '#ffffff',
      isArtist: false,
      content: trimmed,
      image: commentImage,
      createdAt: '방금 전',
      likes: 0,
    };

    setComments((prev) => [...prev, tempComment]);
    setNewComment('');
    setCommentImage(null);
    setCommentCount((prev) => prev + 1);
    if (!showComments) setShowComments(true);

    try {
      await fetch(`${API}/comments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: trimmed, user: '사용자', postId: post.id }),
      });
    } catch (error) {
      console.error('댓글 저장 실패:', error);
    }
  };

  const handleDeleteComment = async (id) => {
    setComments((prev) => prev.filter((c) => c.id !== id));
    setCommentCount((prev) => Math.max(0, prev - 1));

    try {
      await fetch(`${API}/comments/${id}`, { method: 'DELETE' });
    } catch (error) {
      console.error('댓글 삭제 실패:', error);
    }
  };

  return (
    <Card isArtist={post.isArtist} data-artist={post.isArtist} hasArtistReply={post.hasArtistReply}>
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
        <ActionBtn onClick={handleToggleComments}>
          <FaRegComment />
          <span>{commentCount}</span>
        </ActionBtn>
        <ActionBtn>
          <FaShareFromSquare />
        </ActionBtn>
      </CardActions>

      {showComments && (
        <CommentsSection>
          <CommentForm onSubmit={handleAddComment}>
            <AvatarSm
              src="https://ui-avatars.com/api/?name=ME&background=3b82f6&color=fff&size=28"
              alt="나"
            />
            <CommentFormMain>
              <CommentInput
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                placeholder="댓글을 입력해 보세요..."
              />
              {commentImage && (
                <ImagePreview>
                  <img src={commentImage} alt="첨부 이미지" />
                  <RemoveImageBtn type="button" onClick={() => setCommentImage(null)}>✕</RemoveImageBtn>
                </ImagePreview>
              )}
              <CommentBottom>
                <CommentTools>
                  <HiddenInput
                    type="file"
                    accept="image/*"
                    ref={fileInputRef}
                    onChange={handleImageSelect}
                  />
                  <CommentToolBtn type="button" aria-label="사진" onClick={() => fileInputRef.current.click()}>
                    <FaImage />
                  </CommentToolBtn>
                  <CommentToolBtn type="button" aria-label="투표">
                    <FaChartBar />
                  </CommentToolBtn>
                </CommentTools>
                <CommentMetaBar>
                  <CommentCharCount isOver={newComment.length > MAX_COMMENT_CHARS}>
                    {newComment.length} / {MAX_COMMENT_CHARS}
                  </CommentCharCount>
                  <CommentSubmit
                    type="submit"
                    disabled={(!newComment.trim() && !commentImage) || newComment.length > MAX_COMMENT_CHARS}
                  >
                    게시
                  </CommentSubmit>
                </CommentMetaBar>
              </CommentBottom>
            </CommentFormMain>
          </CommentForm>

          {comments.map((comment) => (
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
                {comment.image && (
                  <img src={comment.image} alt="댓글 이미지" style={{ maxHeight: '120px', borderRadius: '8px', marginTop: '6px', display: 'block' }} />
                )}
                <CommentMeta>
                  <CommentTime>{comment.createdAt}</CommentTime>
                  <CommentLike isArtist={comment.isArtist}>
                    {comment.isArtist ? <FaHeart /> : <FaRegHeart />} {comment.likes}
                  </CommentLike>
                  {comment.author === '사용자' && (
                    <CommentDelete type="button" onClick={() => handleDeleteComment(comment.id)}>
                      삭제
                    </CommentDelete>
                  )}
                </CommentMeta>
              </CommentBody>
            </CommentItem>
          ))}
          {commentCount > comments.length && (
            <ViewAll>댓글 {commentCount}개 모두 보기</ViewAll>
          )}
        </CommentsSection>
      )}
    </Card>
  );
};

export default PostCard;