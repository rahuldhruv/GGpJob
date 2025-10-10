"use client";

import { createContext, useState, useContext, useEffect, ReactNode, useCallback } from 'react';
import type { User } from '@/lib/types';
import { getAuth, onAuthStateChanged, User as FirebaseUser } from "firebase/auth";
import { firebaseApp } from '@/firebase/config';

interface UserContextType {
  user: User | null;
  setUser: (user: User | null) => void;
  loading: boolean;
  login: (firebaseUser: FirebaseUser) => Promise<void>;
  logout: () => Promise<void>;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export function UserProvider({ children }: { children: ReactNode }) {
  const [user, setUserState] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchUserProfile = useCallback(async (uid: string) => {
    try {
      const res = await fetch(`/api/users?uid=${uid}`);
      if (res.ok) {
        const userProfile = await res.json();
        setUserState(userProfile);
      } else {
        // This error will be caught by the catch block
        throw new Error('Failed to fetch user profile');
      }
    } catch (error) {
      console.error(error);
      // If fetching fails, ensure the user is logged out of the app state
      setUserState(null);
      getAuth(firebaseApp).signOut();
    }
  }, []);

  useEffect(() => {
    // Check for Firebase config before initializing auth
    if (!process.env.NEXT_PUBLIC_FIREBASE_API_KEY) {
        console.error("Firebase config not found. Make sure .env.local is set up correctly.");
        setLoading(false);
        return;
    }
      
    const auth = getAuth(firebaseApp);
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      setLoading(true);
      if (firebaseUser) {
        await fetchUserProfile(firebaseUser.uid);
      } else {
        // User is signed out
        setUserState(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, [fetchUserProfile]);

  const setUser = (user: User | null) => {
    setUserState(user);
  };

  const login = async (firebaseUser: FirebaseUser) => {
    setLoading(true);
    await fetchUserProfile(firebaseUser.uid);
    setLoading(false);
  }

  const logout = async () => {
    const auth = getAuth(firebaseApp);
    await auth.signOut();
    setUserState(null);
  }
  
  return (
    <UserContext.Provider value={{ user, setUser, loading, login, logout }}>
      {children}
    </UserContext.Provider>
  );
}

export function useUser() {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
}
