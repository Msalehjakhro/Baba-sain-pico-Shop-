import React, { createContext, useContext, useEffect, useState } from 'react';
import { User, onAuthStateChanged, signInWithPopup, signOut } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { auth, db, googleProvider } from '../firebase';

// Designated owner email provided by user runtime configuration
export const OWNER_EMAIL = 'digitaltteem@gmail.com';

interface AuthContextType {
  user: User | null;
  isAdmin: boolean;
  isOwner: boolean;
  loading: boolean;
  loginWithGoogle: () => Promise<boolean>;
  logout: () => Promise<void>;
  authError: string | null;
  clearAuthError: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isAdmin, setIsAdmin] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(true);
  const [authError, setAuthError] = useState<string | null>(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      if (currentUser && currentUser.email) {
        const userEmail = currentUser.email.toLowerCase();
        const isOwnerAccount = userEmail === OWNER_EMAIL.toLowerCase();

        if (isOwnerAccount) {
          setIsAdmin(true);
        } else {
          // Check if registered in admins collection
          try {
            const adminDoc = await getDoc(doc(db, 'admins', currentUser.uid));
            setIsAdmin(adminDoc.exists());
          } catch {
            setIsAdmin(false);
          }
        }
      } else {
        setIsAdmin(false);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const loginWithGoogle = async (): Promise<boolean> => {
    setAuthError(null);
    try {
      const result = await signInWithPopup(auth, googleProvider);
      const email = result.user.email?.toLowerCase();
      if (email === OWNER_EMAIL.toLowerCase()) {
        setIsAdmin(true);
        return true;
      }
      // Check admin doc
      const adminDoc = await getDoc(doc(db, 'admins', result.user.uid));
      if (adminDoc.exists()) {
        setIsAdmin(true);
        return true;
      } else {
        setIsAdmin(false);
        setAuthError(`Signed in as ${result.user.email}. Only the shop owner (${OWNER_EMAIL}) has admin editing permissions.`);
        return false;
      }
    } catch (err: any) {
      const errorCode = err?.code || '';
      const currentHost = typeof window !== 'undefined' ? window.location.hostname : '';
      
      if (errorCode === 'auth/popup-closed-by-user') {
        // User voluntarily dismissed the sign-in modal; no need for warning or alert
        setAuthError(null);
        return false;
      }
      
      console.warn('Firebase Auth Notification:', errorCode || err?.message || err);
      
      if (errorCode === 'auth/unauthorized-domain' || (err?.message && err.message.includes('unauthorized-domain'))) {
        setAuthError(
          `Domain Unauthorized: Aapki Vercel website ("${currentHost}") Firebase ke Authorized Domains mein shamil nahi hai. Firebase Console mein Authentication > Settings > Authorized domains mein "${currentHost}" add karein.`
        );
      } else if (errorCode === 'auth/popup-blocked') {
        setAuthError('Browser ne Google login popup block kar diya hai. Apne browser mein Pop-ups allow karein aur dobara try karein.');
      } else {
        const msg = err instanceof Error ? err.message : 'Login failed. Please try again.';
        setAuthError(msg);
      }
      return false;
    }
  };

  const logout = async () => {
    try {
      await signOut(auth);
      setUser(null);
      setIsAdmin(false);
      setAuthError(null);
    } catch (err: unknown) {
      console.error('Logout failed', err);
    }
  };

  const clearAuthError = () => setAuthError(null);

  const isOwner = !!(user && user.email?.toLowerCase() === OWNER_EMAIL.toLowerCase());

  return (
    <AuthContext.Provider
      value={{
        user,
        isAdmin,
        isOwner,
        loading,
        loginWithGoogle,
        logout,
        authError,
        clearAuthError,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
