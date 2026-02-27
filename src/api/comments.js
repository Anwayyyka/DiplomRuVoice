import { mockComments } from '@/mocks/trackPageData';

export const commentsAPI = {
  // Получить комментарии к треку
  getTrackComments: async (trackId) => {
    await new Promise(resolve => setTimeout(resolve, 400));
    // Возвращаем моковые комментарии (они привязаны к trackId в моке)
    return mockComments;
  },

  // Добавить комментарий
  addComment: async (userId, trackId, text) => {
    await new Promise(resolve => setTimeout(resolve, 300));
    console.log(`User ${userId} commented on track ${trackId}: ${text}`);
    const newComment = {
      id: `mock-${Date.now()}`,
      user_id: userId,
      track_id: trackId,
      user_name: 'Текущий пользователь', // в реальности нужно получить имя
      text,
      created_at: new Date().toISOString(),
    };
    return newComment;
  },
};