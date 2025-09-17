import { useEffect, useMemo, useRef, useState } from 'react';
import { addDoc, collection, onSnapshot, orderBy, query, serverTimestamp } from 'firebase/firestore';
import { getDownloadURL, ref, uploadBytes } from 'firebase/storage';
import { FolderPlusIcon, MagnifyingGlassIcon, InboxArrowDownIcon } from '@heroicons/react/24/outline';
import { useAuth } from '../../context/AuthContext.jsx';
import { db, storage } from '../../firebase.js';
import { buildFileBreadcrumb, generateSmartName, summarizeText } from '../../utils/ai.js';
import FileTree from './FileTree.jsx';
import FileDetail from './FileDetail.jsx';

const buildTree = (items) => {
  const map = new Map();
  items.forEach((item) => {
    map.set(item.id, { ...item, children: [] });
  });
  const roots = [];
  map.forEach((node) => {
    if (node.parentId && map.has(node.parentId)) {
      map.get(node.parentId).children.push(node);
    } else {
      roots.push(node);
    }
  });
  const sortNodes = (list) =>
    list
      .map((item) => ({ ...item, children: sortNodes(item.children || []) }))
      .sort((a, b) => {
        if (a.type === b.type) {
          return a.name.localeCompare(b.name);
        }
        return a.type === 'folder' ? -1 : 1;
      });
  return sortNodes(roots);
};

const ProjectFiles = ({ projectId, project }) => {
  const { user, profile } = useAuth();
  const [nodes, setNodes] = useState([]);
  const [activeNode, setActiveNode] = useState(null);
  const [notes, setNotes] = useState([]);
  const [noteText, setNoteText] = useState('');
  const [search, setSearch] = useState('');
  const [expanded, setExpanded] = useState(new Set());
  const fileInputRef = useRef(null);

  useEffect(() => {
    if (!projectId) return () => undefined;
    const nodesRef = collection(db, 'projects', projectId, 'nodes');
    const nodesQuery = query(nodesRef, orderBy('createdAt', 'asc'));
    const unsubscribe = onSnapshot(nodesQuery, (snapshot) => {
      const data = snapshot.docs.map((docSnap) => ({ id: docSnap.id, ...docSnap.data() }));
      setNodes(data);
    });
    return () => unsubscribe();
  }, [projectId]);

  useEffect(() => {
    if (!activeNode || activeNode.type !== 'file') {
      setNotes([]);
      return undefined;
    }
    const notesRef = collection(db, 'projects', projectId, 'nodes', activeNode.id, 'notes');
    const notesQuery = query(notesRef, orderBy('createdAt', 'desc'));
    const unsubscribe = onSnapshot(notesQuery, (snapshot) => {
      setNotes(snapshot.docs.map((docSnap) => ({ id: docSnap.id, ...docSnap.data() })));
    });
    return () => unsubscribe();
  }, [projectId, activeNode?.id, activeNode?.type]);

  useEffect(() => {
    if (activeNode) {
      const updated = nodes.find((item) => item.id === activeNode.id);
      if (updated) {
        setActiveNode(updated);
      }
    }
  }, [nodes]);

  const nodeMap = useMemo(() => {
    const map = new Map();
    nodes.forEach((node) => map.set(node.id, node));
    return map;
  }, [nodes]);

  const tree = useMemo(() => buildTree(nodes), [nodes]);

  useEffect(() => {
    if (expanded.size === 0) {
      setExpanded(new Set(tree.map((node) => node.id)));
    }
  }, [tree, expanded.size]);

  const searchResults = useMemo(() => {
    if (!search) return [];
    const lower = search.toLowerCase();
    return nodes
      .filter((node) => node.name?.toLowerCase().includes(lower) || node.aiName?.toLowerCase().includes(lower))
      .map((node) => ({
        node,
        breadcrumb: buildFileBreadcrumb(node, nodeMap)
      }));
  }, [search, nodes, nodeMap]);

  const breadcrumbs = useMemo(() => buildFileBreadcrumb(activeNode, nodeMap), [activeNode, nodeMap]);

  const handleToggle = (id) => {
    setExpanded((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const handleCreateFolder = async () => {
    const folderName = window.prompt('Yeni klasör adı');
    if (!folderName) return;
    const parent = activeNode?.type === 'folder' ? activeNode : null;
    await addDoc(collection(db, 'projects', projectId, 'nodes'), {
      name: folderName,
      aiName: generateSmartName(folderName, project.aiCode || 'PRJ', nodes),
      type: 'folder',
      parentId: parent?.id || null,
      createdAt: serverTimestamp(),
      createdBy: user.uid,
      createdByName: profile?.displayName || user.displayName
    });
  };

  const handleUploadFile = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    const parent = activeNode?.type === 'folder' ? activeNode : null;
    const aiName = generateSmartName(file.name, project.aiCode || 'PRJ', nodes);
    const storagePath = `projects/${projectId}/files/${aiName}-${Date.now()}`;
    const storageRef = ref(storage, storagePath);
    await uploadBytes(storageRef, file);
    const downloadURL = await getDownloadURL(storageRef);

    await addDoc(collection(db, 'projects', projectId, 'nodes'), {
      name: file.name,
      aiName,
      type: 'file',
      parentId: parent?.id || null,
      size: file.size,
      mimeType: file.type,
      storagePath,
      downloadURL,
      createdAt: serverTimestamp(),
      createdBy: user.uid,
      createdByName: profile?.displayName || user.displayName
    });

    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleSelect = (node) => {
    setActiveNode(node);
    if (node.parentId) {
      setExpanded((prev) => new Set(prev).add(node.parentId));
    }
  };

  const handleAddNote = async (event) => {
    event.preventDefault();
    if (!activeNode || activeNode.type !== 'file' || !noteText.trim()) return;
    const notesRef = collection(db, 'projects', projectId, 'nodes', activeNode.id, 'notes');
    await addDoc(notesRef, {
      content: noteText,
      summary: summarizeText(noteText),
      createdAt: serverTimestamp(),
      createdBy: user.uid,
      createdByName: profile?.displayName || user.displayName
    });
    setNoteText('');
  };

  return (
    <div className="file-panel">
      <div className="file-tree">
        <div className="file-toolbar" style={{ justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', gap: 8 }}>
            <button type="button" onClick={handleCreateFolder}>
              <FolderPlusIcon width={18} height={18} />
              Klasör
            </button>
            <button type="button" onClick={() => fileInputRef.current?.click()}>
              <InboxArrowDownIcon width={18} height={18} /> Dosya yükle
            </button>
            <input ref={fileInputRef} type="file" onChange={handleUploadFile} style={{ display: 'none' }} />
          </div>
        </div>
        <div style={{ position: 'relative', marginTop: 12 }}>
          <div className="search-box" style={{ padding: '10px 14px', marginBottom: 12 }}>
            <MagnifyingGlassIcon width={18} height={18} color="#94a3b8" />
            <input
              type="search"
              placeholder="Dosya veya klasör ara"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
            />
          </div>
          <FileTree nodes={tree} expanded={expanded} onToggle={handleToggle} onSelect={handleSelect} activeId={activeNode?.id} />
          {search && (
            <div className="search-results" style={{ marginTop: 16 }}>
              {searchResults.length === 0 && <span>Eşleşme bulunamadı.</span>}
              {searchResults.map((result) => (
                <button
                  key={result.node.id}
                  type="button"
                  className="search-result"
                  onClick={() => {
                    setActiveNode(result.node);
                    setSearch('');
                  }}
                >
                  <strong style={{ display: 'block', color: '#0f172a' }}>{result.node.name}</strong>
                  <span style={{ fontSize: '0.8rem', color: '#64748b' }}>{result.breadcrumb.join(' / ')}</span>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {activeNode ? (
        <FileDetail
          node={activeNode}
          breadcrumbs={breadcrumbs}
          notes={notes}
          noteText={noteText}
          onNoteTextChange={setNoteText}
          onAddNote={handleAddNote}
        />
      ) : (
        <div className="empty-state">
          <h3>Bir dosya veya klasör seçin</h3>
          <p>Yapay zeka tarafından önerilen benzersiz isimler ile tüm varlıklarınız organize edilir.</p>
        </div>
      )}
    </div>
  );
};

export default ProjectFiles;
