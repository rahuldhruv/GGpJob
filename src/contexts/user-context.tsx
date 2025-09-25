
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
      const res = await fetch(`/api/users/${uid}`);
      if (res.ok) {
        const userProfile = await res.json();
        setUserState(userProfile);
        localStorage.setItem('ggp-user', JSON.stringify(userProfile));
      } else {
        throw new Error('Failed to fetch user profile');
      }
    } catch (error) {
      console.error(error);
      setUserState(null);
      localStorage.removeItem('ggp-user');
    }
  }, []);


  useEffect(() => {
    const auth = getAuth(firebaseApp);
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        // User is signed in, see docs for a list of available properties
        // https://firebase.google.com/docs/reference/js/firebase.User
        const storedUser = localStorage.getItem('ggp-user');
        if (storedUser) {
          try {
            setUserState(JSON.parse(storedUser));
          } catch {
             await fetchUserProfile(firebaseUser.uid);
          }
        } else {
            await fetchUserProfile(firebaseUser.uid);
        }
      } else {
        // User is signed out
        setUserState(null);
        localStorage.removeItem('ggp-user');
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, [fetchUserProfile]);

  const setUser = (user: User | null) => {
    setUserState(user);
    if (user) {
      localStorage.setItem('ggp-user', JSON.stringify(user));
    } else {
      localStorage.removeItem('ggp-user');
    }
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
    localStorage.removeItem('ggp-user');
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
