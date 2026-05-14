import { mockComments } from '@/mocks/trackPageData';

const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

export const commentsAPI = {
  getTrackComments: async (trackId) => {
    await delay(200);
    return mockComments.filter((comment) => comment.track_id === trackId || comment.trackId === trackId);
  },

  addComment: async (userId, trackId, text) => {
    await delay(150);

    const newComment = {
      id: `mock-${Date.now()}`,
      user_id: userId,
      track_id: trackId,
      user_name: 'Текущий пользователь',
      text,
      created_at: new Date().toISOString(),
    };

    return newComment;
  },
};