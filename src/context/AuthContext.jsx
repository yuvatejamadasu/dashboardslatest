import React, { createContext, useContext, useEffect, useState } from 'react';
import { auth, db } from '@/config/firebase';
import { onAuthStateChanged, signInWithEmailAndPassword, signOut, createUserWithEmailAndPassword, setPersistence, browserSessionPersistence } from 'firebase/auth';
import { ref, get, set } from 'firebase/database';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const saved = sessionStorage.getItem('pb_user');
    return saved ? JSON.parse(saved) : null;
  });
  const [userData, setUserData] = useState(() => {
    const saved = sessionStorage.getItem('pb_user_data');
    return saved ? JSON.parse(saved) : null;
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Set persistence to session (auth state is cleared when tab is closed)
    setPersistence(auth, browserSessionPersistence)
      .catch((error) => console.error("Error setting persistence:", error));

    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser) {
        setUser(currentUser);
        // Fetch additional user data from Realtime Database
        try {
          const userRef = ref(db, `users/${currentUser.uid}`);
          const snapshot = await get(userRef);
          if (snapshot.exists()) {
            const data = snapshot.val();
            // Fix potential NaN bug from previous setup
            if (data.storeId === 'NaN' || data.storeId === NaN) delete data.storeId;
            if (data.entityId === 'NaN' || data.entityId === NaN) delete data.entityId;
            if (data.hubId === 'NaN' || data.hubId === NaN) delete data.hubId;
            
            setUserData(data);
            sessionStorage.setItem('pb_user_data', JSON.stringify(data));
            sessionStorage.setItem('pb_user', JSON.stringify({ email: currentUser.email, uid: currentUser.uid }));
          }
        } catch (error) {
          console.error("Error fetching user data:", error);
        }
      } else {
        // If no Firebase user, only clear if there's no manual user
        const manualUser = sessionStorage.getItem('pb_user');
        if (!manualUser) {
          setUser(null);
          setUserData(null);
        }
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const login = async (email, password) => {
    const res = await signInWithEmailAndPassword(auth, email, password);
    return res;
  };

  const signup = async (email, password, additionalData) => {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;
    
    // Save additional data to Realtime Database
    await set(ref(db, `users/${user.uid}`), {
      email,
      uid: user.uid,
      password, // Store password for custom verification
      createdAt: new Date().toISOString(),
      ...additionalData
    });
    
    return userCredential;
  };

  const logout = async () => {
    sessionStorage.removeItem('pb_user');
    sessionStorage.removeItem('pb_user_data');
    setUser(null);
    setUserData(null);
    return signOut(auth);
  };

  const manualLogin = (data) => {
    setUserData(data);
    const simplifiedUser = { email: data.email, uid: data.uid || data.id };
    setUser(simplifiedUser);
    sessionStorage.setItem('pb_user', JSON.stringify(simplifiedUser));
    sessionStorage.setItem('pb_user_data', JSON.stringify(data));
  };

  return (
    <AuthContext.Provider value={{ user, userData, loading, login, signup, logout, manualLogin }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
