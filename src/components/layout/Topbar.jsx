import { useMemo, useState } from 'react';
import { Bars3Icon, MagnifyingGlassIcon, PlusIcon, SparklesIcon } from '@heroicons/react/24/outline';
import { useNavigate } from 'react-router-dom';
import { collection, query, where } from 'firebase/firestore';
import { useAuth } from '../../context/AuthContext.jsx';
import { db } from '../../firebase.js';
import { useCollection } from '../../hooks/useCollection.js';

const Topbar = ({ onToggleSidebar, onCreateProject }) => {
  const { user, profile } = useAuth();
  const [search, setSearch] = useState('');
  const navigate = useNavigate();
  const projectQuery = user
    ? query(collection(db, 'projects'), where('memberIds', 'array-contains', user.uid))
    : null;
  const { data: projects } = useCollection(projectQuery);

  const filteredProjects = useMemo(() => {
    if (!search) return [];
    const lower = search.toLowerCase();
    return projects.filter(
      (project) =>
        project.name?.toLowerCase().includes(lower) || project.aiCode?.toLowerCase().includes(lower) || project.code?.toLowerCase().includes(lower)
    );
  }, [projects, search]);

  const handleSubmit = (event) => {
    event.preventDefault();
    if (filteredProjects.length > 0) {
      navigate(`/projects/${filteredProjects[0].id}`);
      setSearch('');
    }
  };

  return (
    <header className="topbar">
      <button type="button" className="secondary-button" onClick={onToggleSidebar} style={{ display: 'none' }}>
        <Bars3Icon width={20} height={20} />
        Menü
      </button>
      <form onSubmit={handleSubmit} className="search-box">
        <MagnifyingGlassIcon width={20} height={20} color="#64748b" />
        <input
          type="search"
          placeholder="Projelerde, dosyalarda veya ekip üyelerinde arayın..."
          value={search}
          onChange={(event) => setSearch(event.target.value)}
        />
        {search && filteredProjects.length > 0 && (
          <div
            style={{
              position: 'absolute',
              top: 'calc(100% + 12px)',
              left: 0,
              right: 0,
              background: 'rgba(255,255,255,0.98)',
              borderRadius: '20px',
              border: '1px solid rgba(148,163,184,0.2)',
              boxShadow: '0 24px 48px rgba(15,23,42,0.18)',
              padding: '18px',
              display: 'grid',
              gap: '12px',
              zIndex: 10
            }}
          >
            {filteredProjects.map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => {
                  navigate(`/projects/${item.id}`);
                  setSearch('');
                }}
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  padding: '12px 14px',
                  borderRadius: '14px',
                  border: '1px solid rgba(148,163,184,0.18)',
                  background: 'rgba(248,250,252,0.9)',
                  cursor: 'pointer'
                }}
              >
                <div style={{ display: 'flex', flexDirection: 'column', gap: 2, textAlign: 'left' }}>
                  <strong style={{ fontSize: '0.95rem', color: '#0f172a' }}>{item.name}</strong>
                  <span style={{ fontSize: '0.8rem', color: '#64748b' }}>{item.aiCode}</span>
                </div>
                <span style={{ fontSize: '0.75rem', color: '#2563eb', fontWeight: 600 }}>Git</span>
              </button>
            ))}
          </div>
        )}
      </form>
      <div className="quick-actions">
        <button type="button" className="secondary-button" onClick={onCreateProject}>
          <PlusIcon width={18} height={18} /> Yeni Proje
        </button>
        <button type="button" className="primary-button">
          <SparklesIcon width={18} height={18} /> AI Paneli
        </button>
        {profile && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{ textAlign: 'right' }}>
              <strong style={{ display: 'block', fontSize: '0.95rem' }}>{profile.displayName}</strong>
              <span style={{ fontSize: '0.8rem', color: '#94a3b8' }}>{profile.title || 'NovaFlow Üyesi'}</span>
            </div>
            <img
              src={profile.photoURL || `https://ui-avatars.com/api/?name=${profile.displayName}`}
              alt={profile.displayName}
              style={{ width: 46, height: 46, borderRadius: '16px', objectFit: 'cover' }}
            />
          </div>
        )}
      </div>
    </header>
  );
};

export default Topbar;
