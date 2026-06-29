import { getGlobalLocalStorage, setGlobalLocalStorage } from './storage.js';

const STORAGE_KEY = 'blogCommentLikes';

export const getCommentLikeKey = (articleId, commentId, replyId = null) => (
  replyId ? `${articleId}:${commentId}:reply:${replyId}` : `${articleId}:${commentId}`
);

export const isCommentLikedByUser = (articleId, commentId, replyId = null) => {
  const store = getGlobalLocalStorage(STORAGE_KEY, {});
  return store[getCommentLikeKey(articleId, commentId, replyId)] === true;
};

export const setCommentLikedByUser = (articleId, commentId, liked, replyId = null) => {
  const store = { ...getGlobalLocalStorage(STORAGE_KEY, {}) };
  const key = getCommentLikeKey(articleId, commentId, replyId);
  if (liked) {
    store[key] = true;
  } else {
    delete store[key];
  }
  setGlobalLocalStorage(STORAGE_KEY, store);
};

export const toggleCommentLikeState = (item, articleId, commentId, replyId = null) => {
  const isLiked = isCommentLikedByUser(articleId, commentId, replyId);
  const currentLikes = Number(item.likes) || 0;
  const nextLiked = !isLiked;

  setCommentLikedByUser(articleId, commentId, nextLiked, replyId);

  return {
    ...item,
    liked: nextLiked,
    likes: nextLiked ? currentLikes + 1 : Math.max(0, currentLikes - 1),
  };
};

export const applyStoredLikeState = (comments, articleId) => (
  (comments || []).map((comment) => ({
    ...comment,
    liked: isCommentLikedByUser(articleId, comment.id),
    replies: (comment.replies || []).map((reply) => ({
      ...reply,
      liked: isCommentLikedByUser(articleId, comment.id, reply.id),
    })),
  }))
);
