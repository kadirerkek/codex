'use client';

import { useState, useEffect } from 'react';
import Layout from '../../components/Layout';
import ChatWindow from '../../components/ChatWindow';
import { db } from '../../firebase/config';
import { collection, onSnapshot } from 'firebase/firestore';

export default function Chat() {
  const [chats, setChats] = useState([]);
  const [selectedChat, setSelectedChat] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onSnapshot(collection(db, 'chats'), (snapshot) => {
      const chatsData = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
      setChats(chatsData);
      if (chatsData.length > 0 && !selectedChat) {
        setSelectedChat(chatsData[0].id);
      }
      setLoading(false);
    });
    return () => unsubscribe();
  }, [selectedChat]);

  if (loading) {
    return <Layout><p>Loading chats...</p></Layout>;
  }

  return (
    <Layout>
      <div className="flex h-[calc(100vh-10rem)]">
        <aside className="w-1/4 p-4 bg-white rounded-l-2xl shadow-md">
          <h2 className="text-xl font-bold mb-4">Chats</h2>
          <ul>
            {chats.map((chat) => (
              <li
                key={chat.id}
                onClick={() => setSelectedChat(chat.id)}
                className={`p-2 cursor-pointer rounded-md ${
                  selectedChat === chat.id ? 'bg-orange-500 text-white' : 'hover:bg-gray-100'
                }`}
              >
                {chat.name || 'Unnamed Chat'}
              </li>
            ))}
          </ul>
        </aside>
        <main className="w-3/4">
          {selectedChat ? <ChatWindow chatId={selectedChat} /> : <p>Select a chat to start messaging.</p>}
        </main>
      </div>
    </Layout>
  );
}
