import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/context/AuthContext';
import { db } from '@/config/firebase';
import { ref, update, get } from 'firebase/database';
import { hubAdminService } from '@/services/hub-admin/hubAdminService';

const ProfileContext = createContext();

const DEFAULT_PROFILE = {
  fullName: 'Hub Admin',
  email: '',
  phone: '',
  location: '',
  role: 'Hub Administrator',
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
    const loadFullProfile = async () => {
      if (userData) {
        setLoading(true);
        const baseData = { ...DEFAULT_PROFILE, ...userData };
        
        // Fetch additional details from hubs table based on email
        try {
          const hubDetails = await hubAdminService.getHubByEmail(userData.email);
          if (hubDetails) {
            setProfile({
              ...baseData,
              phone: hubDetails.mobile || hubDetails.phone || hubDetails.phoneNumber || '',
              location: hubDetails.location || hubDetails.address || '',
              bio: hubDetails.bio || '',
              profileImage: hubDetails.profileImage || hubDetails.image || '',
              hubId: hubDetails.id,
              // Use names from hub table if user table is generic
              fullName: hubDetails.ownerName || hubDetails.name || baseData.fullName
            });
          } else {
            setProfile(baseData);
          }
        } catch (error) {
          console.error("Error loading hub details:", error);
          setProfile(baseData);
        } finally {
          setLoading(false);
        }
      } else if (!user) {
        setProfile(DEFAULT_PROFILE);
        setLoading(false);
      }
    };

    loadFullProfile();
  }, [user, userData]);

  const updateProfile = useCallback(async (updatedData) => {
    if (!user) return { error: 'Not authenticated' };
    
    setIsSaving(true);
    setSaveError(null);

    try {
      const userRef = ref(db, `users/${user.uid}`);
      await update(userRef, updatedData);
      
      // Also update hub record if hubId exists
      if (profile.hubId) {
        const hubData = {
          ownerName: updatedData.fullName || profile.fullName,
          mobile: updatedData.phone || profile.phone,
          location: updatedData.location || profile.location,
          bio: updatedData.bio || profile.bio,
          profileImage: updatedData.profileImage || profile.profileImage
        };
        await hubAdminService.updateHub(profile.hubId, hubData);
      }

      setProfile(prev => ({ ...prev, ...updatedData }));
      setSaveError(null);
      setIsSaving(false);
      return { error: null };
    } catch (error) {
      console.error('[Hub ProfileContext] Firebase update failed:', error);
      setSaveError('Failed to save changes to database.');
      setIsSaving(false);
      return { error };
    }
  }, [user, profile.hubId]);

  return (
    <ProfileContext.Provider value={{ profile, loading, isSaving, saveError, updateProfile }}>
      {children}
    </ProfileContext.Provider>
  );
};

export const useProfile = () => useContext(ProfileContext);
