import { useEffect, useState } from 'react';
import { onSnapshot } from 'firebase/firestore';

export const useCollection = (queryRef, { map = (doc) => ({ id: doc.id, ...doc.data() }) } = {}) => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!queryRef) {
      setData([]);
      setLoading(false);
      return undefined;
    }

    setLoading(true);
    const unsubscribe = onSnapshot(
      queryRef,
      (snapshot) => {
        const mapped = snapshot.docs.map(map);
        setData(mapped);
        setLoading(false);
      },
      (err) => {
        setError(err);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [queryRef, map]);

  return { data, loading, error };
};
