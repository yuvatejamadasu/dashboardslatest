import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/context/AuthContext';
import { db } from '@/config/firebase';
import { ref, update } from 'firebase/database';

const ProfileContext = createContext();

const DEFAULT_PROFILE = {
  fullName: 'Super Admin',
  email: '',
  phone: '',
  location: '',
  role: 'Super Administrator',
  website: '',
  bio: '',
  profileImage: '',
};

export const ProfileProvider = ({ children }) => {
  const { user, userData } = useAuth();
  const [profile, setProfile] = useState(DEFAULT_PROFILE);
  const [loading, setLoading] = useState(true);
  const [saveError, setSaveError] = useState(null);
  const [isSaving, setIsSaving]   = useState(false);

  useEffect(() => {
    if (userData) {
      setProfile({ ...DEFAULT_PROFILE, ...userData });
      setLoading(false);
    } else if (!user) {
      setProfile(DEFAULT_PROFILE);
      setLoading(false);
    }
  }, [user, userData]);

  const updateProfile = useCallback(async (updatedData) => {
    if (!user) return { error: 'Not authenticated' };
    
    setIsSaving(true);
    setSaveError(null);

    try {
      const userRef = ref(db, `users/${user.uid}`);
      await update(userRef, updatedData);
      setProfile(prev => ({ ...prev, ...updatedData }));
      setSaveError(null);
      setIsSaving(false);
      return { error: null };
    } catch (error) {
      console.error('[ProfileContext] Firebase update failed:', error);
      setSaveError('Failed to save changes to database.');
      setIsSaving(false);
      return { error };
    }
  }, [user]);

  return (
    <ProfileContext.Provider value={{ profile, loading, isSaving, saveError, updateProfile }}>
      {children}
    </ProfileContext.Provider>
  );
};

export const useProfile = () => useContext(ProfileContext);
