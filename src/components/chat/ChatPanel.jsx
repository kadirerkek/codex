import { useEffect, useMemo, useRef, useState } from 'react';
import { addDoc, collection, onSnapshot, orderBy, query, serverTimestamp } from 'firebase/firestore';
import { getDownloadURL, ref, uploadBytes } from 'firebase/storage';
import { PaperAirplaneIcon, ArrowUpTrayIcon } from '@heroicons/react/24/outline';
import { useAuth } from '../../context/AuthContext.jsx';
import { db, storage } from '../../firebase.js';
import { formatRelative } from '../../utils/datetime.js';

const ChatPanel = ({ projectId = null, title = 'Ekip Sohbeti', placeholder = 'Bir mesaj yazın...' }) => {
  const { user, profile } = useAuth();
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState([]);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef(null);
  const bottomRef = useRef(null);

  const path = projectId ? ['projects', projectId, 'messages'] : ['workspace', 'global', 'messages'];
  const messagesRef = useMemo(() => collection(db, ...path), [projectId]);
  const messagesQuery = useMemo(() => query(messagesRef, orderBy('createdAt', 'asc')), [messagesRef]);

  useEffect(() => {
    const unsubscribe = onSnapshot(messagesQuery, (snapshot) => {
      setMessages(snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })));
    });
    return () => unsubscribe();
  }, [messagesQuery]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async (event) => {
    event.preventDefault();
    if (!message.trim()) return;
    await addDoc(messagesRef, {
      text: message,
      createdAt: serverTimestamp(),
      userId: user.uid,
      displayName: profile?.displayName || user.displayName,
      photoURL: profile?.photoURL || user.photoURL
    });
    setMessage('');
  };

  const handleFileUpload = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const storagePath = `${projectId ? `projects/${projectId}` : 'workspace'}/chat/${Date.now()}-${file.name}`;
      const storageRef = ref(storage, storagePath);
      await uploadBytes(storageRef, file);
      const fileUrl = await getDownloadURL(storageRef);

      await addDoc(messagesRef, {
        text: message || '',
        fileName: file.name,
        fileType: file.type,
        fileSize: file.size,
        fileUrl,
        createdAt: serverTimestamp(),
        userId: user.uid,
        displayName: profile?.displayName || user.displayName,
        photoURL: profile?.photoURL || user.photoURL
      });
      setMessage('');
    } catch (error) {
      console.error('Dosya yüklenemedi', error);
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  return (
    <div className="chat-panel">
      <div style={{ padding: '20px 24px', borderBottom: '1px solid rgba(148,163,184,0.16)' }}>
        <h3 style={{ margin: 0 }}>{title}</h3>
        <p style={{ margin: 0, color: '#64748b', fontSize: '0.9rem' }}>Gerçek zamanlı iletişim ve güvenli dosya paylaşımı</p>
      </div>
      <div className="chat-messages">
        {messages.map((item) => (
          <div key={item.id} className="chat-message">
            <img src={item.photoURL || `https://ui-avatars.com/api/?name=${item.displayName}`} alt={item.displayName} />
            <div className="chat-bubble">
              <div className="chat-meta">
                <strong>{item.displayName}</strong>
                <span>{item.createdAt?.toDate ? formatRelative(item.createdAt.toDate()) : 'Şimdi'}</span>
              </div>
              {item.text && <span style={{ fontSize: '0.95rem', color: '#0f172a' }}>{item.text}</span>}
              {item.fileUrl && (
                <a
                  href={item.fileUrl}
                  target="_blank"
                  rel="noreferrer"
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 8,
                    borderRadius: 12,
                    padding: '8px 12px',
                    background: 'rgba(37, 99, 235, 0.12)',
                    color: '#2563eb',
                    textDecoration: 'none',
                    fontSize: '0.85rem',
                    fontWeight: 600
                  }}
                >
                  <ArrowUpTrayIcon width={18} height={18} /> {item.fileName}
                </a>
              )}
            </div>
          </div>
        ))}
        <span ref={bottomRef} />
      </div>
      <form className="chat-input" onSubmit={handleSend}>
        <textarea
          placeholder={placeholder}
          value={message}
          onChange={(event) => setMessage(event.target.value)}
        />
        <div className="chat-actions">
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <input ref={fileInputRef} type="file" onChange={handleFileUpload} />
            <button type="button" className="secondary-button" onClick={() => fileInputRef.current?.click()} disabled={uploading}>
              <ArrowUpTrayIcon width={18} height={18} /> Dosya yükle
            </button>
          </div>
          <button type="submit" className="primary-button" disabled={!message.trim()}>
            <PaperAirplaneIcon width={18} height={18} /> Gönder
          </button>
        </div>
      </form>
    </div>
  );
};

export default ChatPanel;
