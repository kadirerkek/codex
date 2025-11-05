'use client';

import { useState, useEffect } from 'react';
import { db, storage } from '../../firebase/config';
import { collection, query, where, onSnapshot, addDoc, serverTimestamp } from 'firebase/firestore';
import { ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage';
import { useAuth } from '../../context/AuthContext';

const FileItem = ({ file }) => (
  <div className="p-4 bg-white rounded-lg shadow-md flex items-center justify-between">
    <p>{file.name}</p>
    <a href={file.url} target="_blank" rel="noopener noreferrer" className="text-blue-500">
      Download
    </a>
  </div>
);

const FolderItem = ({ folder, onClick }) => (
  <div
    onClick={() => onClick(folder.id)}
    className="p-4 bg-white rounded-lg shadow-md cursor-pointer hover:bg-gray-100"
  >
    <p>{folder.name}</p>
  </div>
);

export default function FileExplorer() {
  const { user } = useAuth();
  const [files, setFiles] = useState([]);
  const [folders, setFolders] = useState([]);
  const [currentFolder, setCurrentFolder] = useState(null); // null for root
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    if (!user) return;

    const filesQuery = query(
      collection(db, 'files'),
      where('ownerId', '==', user.uid),
      where('parentId', '==', currentFolder)
    );

    const foldersQuery = query(
      collection(db, 'folders'),
      where('ownerId', '==', user.uid),
      where('parentId', '==', currentFolder)
    );

    const unsubscribeFiles = onSnapshot(filesQuery, (snapshot) => {
      setFiles(snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })));
    });

    const unsubscribeFolders = onSnapshot(foldersQuery, (snapshot) => {
      setFolders(snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })));
    });

    return () => {
      unsubscribeFiles();
      unsubscribeFolders();
    };
  }, [user, currentFolder]);

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setUploading(true);
    const storageRef = ref(storage, `files/${user.uid}/${file.name}`);
    const uploadTask = uploadBytesResumable(storageRef, file);

    uploadTask.on(
      'state_changed',
      (snapshot) => {
        // Progress tracking can be added here
      },
      (error) => {
        console.error(error);
        setUploading(false);
      },
      () => {
        getDownloadURL(uploadTask.snapshot.ref).then((downloadURL) => {
          addDoc(collection(db, 'files'), {
            name: file.name,
            path: uploadTask.snapshot.ref.fullPath,
            type: file.type,
            size: file.size,
            url: downloadURL,
            ownerId: user.uid,
            parentId: currentFolder,
            createdAt: serverTimestamp(),
          });
          setUploading(false);
        });
      }
    );
  };

  const handleCreateFolder = async () => {
    const folderName = prompt('Enter folder name:');
    if (folderName) {
      await addDoc(collection(db, 'folders'), {
        name: folderName,
        ownerId: user.uid,
        parentId: currentFolder,
        createdAt: serverTimestamp(),
      });
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold">
          {currentFolder ? folders.find(f => f.id === currentFolder)?.name : 'Root'}
        </h2>
        <div>
          <input type="file" onChange={handleFileUpload} className="hidden" id="file-upload" />
          <label htmlFor="file-upload" className="px-4 py-2 mr-2 text-white bg-orange-500 rounded-md cursor-pointer">
            {uploading ? 'Uploading...' : 'Upload File'}
          </label>
          <button onClick={handleCreateFolder} className="px-4 py-2 text-white bg-slate-800 rounded-md">
            New Folder
          </button>
        </div>
      </div>
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {folders.map((folder) => (
          <FolderItem key={folder.id} folder={folder} onClick={setCurrentFolder} />
        ))}
        {files.map((file) => (
          <FileItem key={file.id} file={file} />
        ))}
      </div>
    </div>
  );
}
