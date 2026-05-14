// src/lib/authUser.js
export function normalizeAuthUser(userData, options = {}) {
  if (!userData || typeof userData !== 'object') return null;
  const { previousUser } = options;

  const normalized = {
    id: userData.id,
    email: userData.email,
    full_name: userData.full_name || null,
    nickname: userData.nickname || userData.full_name || null,
    role: userData.role || 'user',
    avatar_url: userData.avatar_url || null,
    banner_url: userData.banner_url || null,
    bio: userData.bio || null,
    telegram: userData.telegram || null,
    vk: userData.vk || null,
    youtube: userData.youtube || null,
    website: userData.website || null,
    artist_name: userData.artist_name || null,
  };

  if (previousUser && typeof previousUser === 'object') {
    return { ...previousUser, ...normalized };
  }
  return normalized;
}