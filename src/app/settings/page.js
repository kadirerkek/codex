'use client';

import { useState, useEffect } from 'react';
import Layout from '../../components/Layout';
import { db } from '../../firebase/config';
import { collection, onSnapshot, doc, updateDoc } from 'firebase/firestore';

export default function Settings() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onSnapshot(collection(db, 'users'), (snapshot) => {
      setUsers(snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })));
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const handleRoleChange = async (userId, newRole) => {
    const userRef = doc(db, 'users', userId);
    await updateDoc(userRef, { role: newRole });
  };

  return (
    <Layout>
      <h1 className="text-2xl font-bold mb-6">Settings</h1>

      <div className="p-6 bg-white rounded-2xl shadow-md">
        <h2 className="text-xl font-semibold mb-4">User Roles</h2>
        {loading ? (
          <p>Loading users...</p>
        ) : (
          <table className="w-full">
            <thead>
              <tr>
                <th className="text-left">User</th>
                <th className="text-left">Role</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user) => (
                <tr key={user.id}>
                  <td>{user.displayName || user.email}</td>
                  <td>
                    <select
                      value={user.role}
                      onChange={(e) => handleRoleChange(user.id, e.target.value)}
                      className="p-2 border rounded-md"
                    >
                      <option value="user">User</option>
                      <option value="admin">Admin</option>
                      <option value="guest">Guest</option>
                    </select>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      <div className="p-6 mt-6 bg-white rounded-2xl shadow-md">
        <h2 className="text-xl font-semibold mb-4">Workflows</h2>
        {/* Workflow management UI will be added here */}
        <p>Workflow configuration coming soon.</p>
      </div>

      <div className="p-6 mt-6 bg-white rounded-2xl shadow-md">
        <h2 className="text-xl font-semibold mb-4">Form Requirements</h2>
        {/* Form requirement configuration will be added here */}
        <p>Form requirement settings coming soon.</p>
      </div>
    </Layout>
  );
}
