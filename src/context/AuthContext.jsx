import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import {
  onAuthStateChanged,
  signInWithPopup,
  signOut as firebaseSignOut,
  updateProfile
} from 'firebase/auth';
import {
  collection,
  doc,
  onSnapshot,
  serverTimestamp,
  setDoc,
  updateDoc
} from 'firebase/firestore';
import { auth, googleProvider, db } from '../firebase.js';

const AuthContext = createContext(undefined);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [userDocument, setUserDocument] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      setUser(firebaseUser);
      setLoading(false);

      if (firebaseUser) {
        const userRef = doc(collection(db, 'users'), firebaseUser.uid);
        const payload = {
          uid: firebaseUser.uid,
          displayName: firebaseUser.displayName,
          email: firebaseUser.email,
          photoURL: firebaseUser.photoURL,
          title: 'Ekip Üyesi',
          timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
          status: 'online',
          lastActiveAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
          createdAt: serverTimestamp()
        };

        try {
          await setDoc(userRef, payload, { merge: true });
          if (!firebaseUser.displayName && firebaseUser.email) {
            const fallbackName = firebaseUser.email.split('@')[0];
            await updateProfile(firebaseUser, { displayName: fallbackName });
            await updateDoc(userRef, { displayName: fallbackName });
          }
        } catch (error) {
          console.error('Kullanıcı profili güncellenemedi', error);
        }
      }
    });

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (!user) {
      setUserDocument(null);
      return undefined;
    }

    const userRef = doc(db, 'users', user.uid);
    const unsubscribe = onSnapshot(userRef, (snapshot) => {
      if (snapshot.exists()) {
        setUserDocument({ id: snapshot.id, ...snapshot.data() });
      }
    });

    return () => unsubscribe();
  }, [user]);

  useEffect(() => {
    if (!user) {
      return undefined;
    }

    const userRef = doc(db, 'users', user.uid);
    const interval = setInterval(async () => {
      try {
        await updateDoc(userRef, {
          lastActiveAt: serverTimestamp(),
          status: 'online'
        });
      } catch (error) {
        console.warn('Kullanıcı durumu güncellenemedi', error);
      }
    }, 60_000);

    const handleVisibilityChange = async () => {
      if (document.visibilityState === 'hidden') {
        try {
          await updateDoc(userRef, { status: 'away', lastActiveAt: serverTimestamp() });
        } catch (error) {
          console.warn('Kullanıcı görünürlük durumu güncellenemedi', error);
        }
      } else {
        try {
          await updateDoc(userRef, { status: 'online', lastActiveAt: serverTimestamp() });
        } catch (error) {
          console.warn('Kullanıcı görünürlük durumu güncellenemedi', error);
        }
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      clearInterval(interval);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      updateDoc(userRef, { status: 'offline', lastActiveAt: serverTimestamp() }).catch(() => undefined);
    };
  }, [user]);

  const signInWithGoogle = async () => {
    await signInWithPopup(auth, googleProvider);
  };

  const signOut = async () => {
    if (user) {
      await updateDoc(doc(db, 'users', user.uid), { status: 'offline', lastActiveAt: serverTimestamp() }).catch(
        () => undefined
      );
    }
    await firebaseSignOut(auth);
  };

  const value = useMemo(
    () => ({
      user,
      loading,
      profile: userDocument,
      signInWithGoogle,
      signOut
    }),
    [user, loading, userDocument]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth sadece AuthProvider içinde kullanılabilir');
  }
  return context;
};
