import { useEffect, useState } from 'react';
import { onSnapshot } from 'firebase/firestore';

export const useDocument = (docRef, { map = (doc) => ({ id: doc.id, ...doc.data() }) } = {}) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(Boolean(docRef));
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!docRef) {
      setData(null);
      setLoading(false);
      return undefined;
    }

    setLoading(true);
    const unsubscribe = onSnapshot(
      docRef,
      (snapshot) => {
        if (snapshot.exists()) {
          setData(map(snapshot));
        } else {
          setData(null);
        }
        setLoading(false);
      },
      (err) => {
        setError(err);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [docRef, map]);

  return { data, loading, error };
};
