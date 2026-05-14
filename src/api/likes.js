import { mockLikes } from '@/mocks/trackPageData';

const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

export const likesAPI = {
  getTrackLikes: async (trackId) => {
    await delay(200);
    return mockLikes.filter((like) => like.track_id === trackId || like.trackId === trackId);
  },

  likeTrack: async (userId, trackId) => {
    await delay(100);
    return { id: Date.now(), user_id: userId, track_id: trackId };
  },

  unlikeTrack: async (_userId, _trackId) => {
    await delay(100);
    return { success: true };
  },
};