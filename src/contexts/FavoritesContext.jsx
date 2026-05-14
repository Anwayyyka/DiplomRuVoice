import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useAuth } from './AuthContext';
import { favoritesAPI } from '@/api/favorites';

const FavoritesContext = createContext();

const sameTrackId = (a, b) => Number(a) === Number(b);

export const FavoritesProvider = ({ children }) => {
  const { user } = useAuth();
  const [favorites, setFavorites] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadFavorites = useCallback(async () => {
    if (!user) {
      setFavorites([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      const favs = await favoritesAPI.getUserFavorites();
      setFavorites(Array.isArray(favs) ? favs : []);
    } catch (error) {
      console.error('Failed to load favorites:', error);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    loadFavorites();
  }, [loadFavorites]);

  const addFavorite = async (trackId) => {
    if (!user) return;
    const id = Number(trackId);
    if (!Number.isFinite(id)) return;
    try {
      await favoritesAPI.addFavorite(user.id, id);
      setFavorites(prev =>
        prev.some(f => sameTrackId(f.track_id, id)) ? prev : [...prev, { track_id: id }]
      );
    } catch (error) {
      console.error('Failed to add favorite:', error);
    }
  };

  const removeFavorite = async (trackId) => {
    if (!user) return;
    const id = Number(trackId);
    if (!Number.isFinite(id)) return;
    try {
      await favoritesAPI.removeFavorite(user.id, id);
      setFavorites(prev => prev.filter(f => !sameTrackId(f.track_id, id)));
    } catch (error) {
      console.error('Failed to remove favorite:', error);
    }
  };

  const isFavorite = (trackId) =>
    favorites.some(f => sameTrackId(f.track_id, trackId));

  return (
    <FavoritesContext.Provider value={{ favorites, loading, addFavorite, removeFavorite, isFavorite, reloadFavorites: loadFavorites }}>
      {children}
    </FavoritesContext.Provider>
  );
};

export const useFavorites = () => useContext(FavoritesContext);