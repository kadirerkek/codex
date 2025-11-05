'use client';

import { useState, useEffect } from 'react';
import Layout from '../../components/Layout';
import { motion } from 'framer-motion';
import { db } from '../../firebase/config';
import { collection, onSnapshot } from 'firebase/firestore';
import { useAuth } from '../../context/AuthContext';

export default function Dashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState([
    { name: 'Total Projects', value: '0' },
    { name: 'Active Users', value: '0' },
    { name: 'Latest Uploads', value: '0' },
    { name: 'Recent Messages', value: '0' },
  ]);

  useEffect(() => {
    const projectsUnsubscribe = onSnapshot(collection(db, 'projects'), (snapshot) => {
      setStats((prevStats) =>
        prevStats.map((stat) =>
          stat.name === 'Total Projects' ? { ...stat, value: snapshot.size.toString() } : stat
        )
      );
    });

    const usersUnsubscribe = onSnapshot(collection(db, 'users'), (snapshot) => {
      setStats((prevStats) =>
        prevStats.map((stat) =>
          stat.name === 'Active Users' ? { ...stat, value: snapshot.size.toString() } : stat
        )
      );
    });

    return () => {
      projectsUnsubscribe();
      usersUnsubscribe();
    };
  }, []);

  return (
    <Layout>
      {user && <p className="mb-6 text-lg">Welcome, {user.email}</p>}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat, index) => (
          <motion.div
            key={stat.name}
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: index * 0.1 }}
            className="p-6 bg-white rounded-2xl shadow-md"
          >
            <h3 className="text-lg font-medium text-gray-500">{stat.name}</h3>
            <p className="mt-2 text-3xl font-bold text-slate-800">{stat.value}</p>
          </motion.div>
        ))}
      </div>
      <div className="mt-8">
        <h2 className="text-xl font-semibold">Quick Links</h2>
        <div className="flex mt-4 space-x-4">
          <button className="px-4 py-2 text-white bg-orange-500 rounded-md">Add Project</button>
          <button className="px-4 py-2 text-white bg-slate-800 rounded-md">Upload File</button>
        </div>
      </div>
    </Layout>
  );
}
