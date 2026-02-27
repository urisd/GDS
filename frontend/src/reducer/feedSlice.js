import { createSlice } from '@reduxjs/toolkit';
import mockData from '../data/mockPosts.json';

const initialState = {
    posts: mockData.posts,
    communities: mockData.communities,
    trending: mockData.trending,
    activeCommunity: 'newjeans',
    activeTab: 'feed',
};

const feedSlice = createSlice({
    name: 'feed',
    initialState,
    reducers: {
        addPost: (state, action) => {
            const newPost = {
                id: Date.now(),
                author: '나',
                avatar: 'ME',
                avatarBg: '#3b82f6',
                avatarColor: '#fff',
                isArtist: false,
                content: action.payload,
                createdAt: '방금 전',
                likes: 0,
                commentCount: 0,
                comments: [],
            };
            state.posts.unshift(newPost);
        },
        toggleLike: (state, action) => {
            const post = state.posts.find(p => p.id === action.payload);
            if (post) {
                post.liked = !post.liked;
                post.likes += post.liked ? 1 : -1;
            }
        },
        setActiveCommunity: (state, action) => {
            state.activeCommunity = action.payload;
        },
        setActiveTab: (state, action) => {
            state.activeTab = action.payload;
        },
        addComment: (state, action) => {
            const { postId, comment } = action.payload;
            const post = state.posts.find(p => p.id === postId);
            if (post) {
                post.comments.push({
                    id: Date.now(),
                    author: '나',
                    avatar: 'ME',
                    avatarBg: '#3b82f6',
                    isArtist: false,
                    content: comment,
                    createdAt: '방금 전',
                    likes: 0,
                });
                post.commentCount += 1;
            }
        },
    },
});

export const { addPost, toggleLike, setActiveCommunity, setActiveTab, addComment } = feedSlice.actions;
export default feedSlice.reducer;
