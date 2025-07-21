import React, { createContext, useEffect, useState, useContext } from 'react';
import { auth, db } from './firebase';
import { onAuthStateChanged } from 'firebase/auth';
import { collection, query, where, getDocs } from 'firebase/firestore';

interface AuthContextType {
  user: any;
  teamMember: any;
  authLoading: boolean;
}

export const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [teamMember, setTeamMember] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      console.log('onAuthStateChanged fired', firebaseUser);
      setUser(firebaseUser);
      if (firebaseUser) {
        const q = query(collection(db, 'teamMembers'), where('email', '==', firebaseUser.email));
        const snap = await getDocs(q);
        setTeamMember(snap.docs[0]?.data() || null);
      } else {
        setTeamMember(null);
      }
      setAuthLoading(false);
      console.log('authLoading set to false');
    });
    return () => unsubscribe();
  }, []);

  return (
    <AuthContext.Provider value={{ user, teamMember, authLoading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext); 