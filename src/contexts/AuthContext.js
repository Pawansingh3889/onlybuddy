import { createContext, useContext, useEffect, useState } from 'react';
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  updateProfile,
} from 'firebase/auth';
import { doc, setDoc, getDoc, getDocs, collection, query, where, updateDoc, serverTimestamp } from 'firebase/firestore';
import { auth, db } from '../firebase';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null);
  const [userRole, setUserRole]       = useState(null);
  const [loading, setLoading]         = useState(true);

  const signup = async (email, password, name, phone = '') => {
    const { user } = await createUserWithEmailAndPassword(auth, email, password);
    await updateProfile(user, { displayName: name });
    await setDoc(doc(db, 'users', user.uid), {
      name,
      email,
      phone,
      role: 'customer',
      status: 'active',
      createdAt: serverTimestamp(),
    });
    setUserRole('customer');
    return user;
  };

  const login = (email, password) => signInWithEmailAndPassword(auth, email, password);

  const logout = () => signOut(auth);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (user) => {
      setCurrentUser(user);
      if (user) {
        try {
          const snap = await getDoc(doc(db, 'users', user.uid));
          let role = snap.exists() ? (snap.data()?.role || 'customer') : 'customer';
          // Auto-promote: if customer has an approved application, upgrade to buddy
          if (role === 'customer' && user.email) {
            try {
              const appSnap = await getDocs(query(
                collection(db, 'applications'),
                where('email', '==', user.email),
                where('status', '==', 'approved')
              ));
              if (!appSnap.empty) {
                await updateDoc(doc(db, 'users', user.uid), {
                  role: 'buddy', status: 'approved', tier: 'new', updatedAt: serverTimestamp(),
                });
                role = 'buddy';
              }
            } catch { /* non-critical */ }
          }
          setUserRole(role);
        } catch {
          setUserRole('customer');
        }
      } else {
        setUserRole(null);
      }
      setLoading(false);
    });
    return unsub;
  }, []);

  return (
    <AuthContext.Provider value={{ currentUser, userRole, loading, signup, login, logout }}>
      {!loading && children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
