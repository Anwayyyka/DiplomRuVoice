import { mockLikes } from '@/mocks/trackPageData';

export const likesAPI = {
  // Получить все лайки трека
  getTrackLikes: async (trackId) => {
    await new Promise(resolve => setTimeout(resolve, 300));
    // Возвращаем моковые лайки (они привязаны к trackId)
    return mockLikes;
  },

  // Лайкнуть трек
  likeTrack: async (userId, trackId) => {
    await new Promise(resolve => setTimeout(resolve, 200));
    console.log(`User ${userId} liked track ${trackId}`);
    return { id: Date.now(), user_id: userId, track_id: trackId };
  },

  // Убрать лайк
  unlikeTrack: async (userId, trackId) => {
    await new Promise(resolve => setTimeout(resolve, 200));
    console.log(`User ${userId} unliked track ${trackId}`);
    return { success: true };
  },
};