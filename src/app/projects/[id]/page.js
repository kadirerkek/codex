'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Layout from '../../../components/Layout';
import { db } from '../../../firebase/config';
import { doc, getDoc, collection, onSnapshot, query, orderBy, addDoc, serverTimestamp } from 'firebase/firestore';
import { useAuth } from '../../../context/AuthContext';

export default function ProjectDetail() {
  const { id } = useParams();
  const { user } = useAuth();
  const [project, setProject] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');

  useEffect(() => {
    const fetchProject = async () => {
      const docRef = doc(db, 'projects', id);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        setProject({ id: docSnap.id, ...docSnap.data() });
      } else {
        console.log('No such document!');
      }
      setLoading(false);
    };
    fetchProject();
  }, [id]);

  useEffect(() => {
    if (id) {
      const q = query(collection(db, 'projects', id, 'comments'), orderBy('createdAt', 'desc'));
      const unsubscribe = onSnapshot(q, (snapshot) => {
        setComments(snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })));
      });
      return () => unsubscribe();
    }
  }, [id]);

  const handleAddComment = async (e) => {
    e.preventDefault();
    if (newComment.trim() === '') return;
    await addDoc(collection(db, 'projects', id, 'comments'), {
      message: newComment,
      userId: user.uid,
      userName: user.displayName || user.email,
      createdAt: serverTimestamp(),
    });
    setNewComment('');
  };

  if (loading) {
    return <Layout><p>Loading...</p></Layout>;
  }

  if (!project) {
    return <Layout><p>Project not found.</p></Layout>;
  }

  return (
    <Layout>
      <h1 className="text-3xl font-bold">{project.name}</h1>
      <p className="mt-2 text-gray-600">{project.description}</p>

      <div className="mt-6 border-b">
        <nav className="flex space-x-4">
          <button
            onClick={() => setActiveTab('overview')}
            className={`px-3 py-2 ${activeTab === 'overview' ? 'border-b-2 border-orange-500' : ''}`}
          >
            Overview
          </button>
          <button
            onClick={() => setActiveTab('files')}
            className={`px-3 py-2 ${activeTab === 'files' ? 'border-b-2 border-orange-500' : ''}`}
          >
            Files
          </button>
          <button
            onClick={() => setActiveTab('comments')}
            className={`px-3 py-2 ${activeTab === 'comments' ? 'border-b-2 border-orange-500' : ''}`}
          >
            Comments
          </button>
        </nav>
      </div>

      <div className="mt-6">
        {activeTab === 'overview' && (
          <div>
            <h2 className="text-xl font-semibold">Project Overview</h2>
            <p>Status: {project.status}</p>
          </div>
        )}
        {activeTab === 'files' && (
          <div>
            <h2 className="text-xl font-semibold">Files</h2>
            {/* File explorer will be implemented here */}
          </div>
        )}
        {activeTab === 'comments' && (
          <div>
            <h2 className="text-xl font-semibold">Comments</h2>
            <form onSubmit={handleAddComment} className="mt-4">
              <textarea
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                className="w-full p-2 border rounded-md"
                placeholder="Add a comment..."
              />
              <button type="submit" className="px-4 py-2 mt-2 text-white bg-orange-500 rounded-md">
                Post Comment
              </button>
            </form>
            <div className="mt-6">
              {comments.map((comment) => (
                <div key={comment.id} className="p-4 mt-4 bg-white rounded-md shadow-md">
                  <p className="font-semibold">{comment.userName}</p>
                  <p>{comment.message}</p>
                  <p className="text-xs text-gray-500">
                    {new Date(comment.createdAt?.toDate()).toLocaleString()}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
}
