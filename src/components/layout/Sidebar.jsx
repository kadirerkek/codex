import { NavLink } from 'react-router-dom';
import { HomeIcon, FolderIcon, UserGroupIcon, ChatBubbleBottomCenterIcon } from '@heroicons/react/24/outline';
import { collection, query, where } from 'firebase/firestore';
import clsx from 'clsx';
import { useAuth } from '../../context/AuthContext.jsx';
import { db } from '../../firebase.js';
import { useCollection } from '../../hooks/useCollection.js';
import { formatRelative } from '../../utils/datetime.js';

const Sidebar = ({ onCreateProject }) => {
  const { user, profile, signOut } = useAuth();
  const projectQuery = user
    ? query(collection(db, 'projects'), where('memberIds', 'array-contains', user.uid))
    : null;
  const { data: projects } = useCollection(projectQuery);
  const { data: users } = useCollection(query(collection(db, 'users')));

  const sortedUsers = users
    .filter((item) => item.uid !== user?.uid)
    .sort((a, b) => {
      const aTime = a.lastActiveAt?.seconds || 0;
      const bTime = b.lastActiveAt?.seconds || 0;
      return bTime - aTime;
    })
    .slice(0, 6);

  return (
    <aside className="sidebar">
      <div className="sidebar-header">
        <div className="brand-badge">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M4 12C4 7.58172 7.58172 4 12 4" stroke="#2563eb" strokeWidth="2" strokeLinecap="round" />
            <path d="M12 20C16.4183 20 20 16.4183 20 12" stroke="#7c3aed" strokeWidth="2" strokeLinecap="round" />
            <circle cx="12" cy="12" r="2.5" fill="#2563eb" />
          </svg>
          NovaFlow
        </div>
        <button type="button" className="secondary-button" onClick={onCreateProject}>
          + Yeni Proje
        </button>
      </div>

      <nav className="nav-section">
        <span className="nav-label">Genel</span>
        <NavLink
          to="/"
          className={({ isActive }) => clsx('nav-item', { active: isActive })}
          end
        >
          <span className="nav-item-icon">
            <HomeIcon width={20} height={20} />
          </span>
          Kontrol Paneli
        </NavLink>
      </nav>

      <div className="nav-section">
        <span className="nav-label">Projeler</span>
        {projects.length === 0 && <span style={{ color: '#94a3b8', fontSize: '0.85rem' }}>Henüz bir projeniz yok.</span>}
        {projects.map((project) => (
          <NavLink
            key={project.id}
            to={`/projects/${project.id}`}
            className={({ isActive }) => clsx('nav-item', { active: isActive })}
          >
            <span className="nav-item-icon">
              <FolderIcon width={20} height={20} />
            </span>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <strong style={{ fontSize: '0.95rem', color: 'inherit' }}>{project.name}</strong>
              <span style={{ fontSize: '0.75rem', color: 'inherit', opacity: 0.7 }}>{project.aiCode}</span>
            </div>
          </NavLink>
        ))}
      </div>

      <div className="card" style={{ gap: 16 }}>
        <div className="card-header">
          <div>
            <div className="card-title">Aktif ekip</div>
            <div className="card-subtitle">Gerçek zamanlı durum bilgisi</div>
          </div>
          <UserGroupIcon width={22} height={22} color="#2563eb" />
        </div>
        <div className="user-list">
          {sortedUsers.map((teamMate) => (
            <div key={teamMate.id} className="user-pill">
              <span className={clsx('user-status', { offline: teamMate.status !== 'online' })} />
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                <strong style={{ fontSize: '0.92rem', color: '#0f172a' }}>{teamMate.displayName}</strong>
                <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>
                  {teamMate.status === 'online'
                    ? 'Çevrimiçi'
                    : `Son görülme ${formatRelative(teamMate.lastActiveAt?.toDate?.() || new Date(teamMate.lastActiveAt))}`}
                </span>
              </div>
            </div>
          ))}
          {sortedUsers.length === 0 && <span style={{ color: '#94a3b8' }}>Henüz bağlantı kurulan ekip üyesi yok.</span>}
        </div>
      </div>

      <div className="card" style={{ gap: 12 }}>
        <div className="card-header">
          <div>
            <div className="card-title">Anlık sohbet</div>
            <div className="card-subtitle">Ekip içi dosya paylaşımı</div>
          </div>
          <ChatBubbleBottomCenterIcon width={22} height={22} color="#2563eb" />
        </div>
        <p style={{ fontSize: '0.9rem' }}>
          Kontrol panelindeki sohbet kanalı üzerinden ekibinizle gerçek zamanlı iletişim kurabilir ve dosya paylaşabilirsiniz.
        </p>
      </div>

      <div className="sidebar-footer">
        {profile && (
          <div className="current-user-card">
            <img src={profile.photoURL || `https://ui-avatars.com/api/?name=${profile.displayName}`} alt={profile.displayName} />
            <div>
              <strong>{profile.displayName}</strong>
              <span>{profile.title || 'NovaFlow Üyesi'}</span>
            </div>
          </div>
        )}
        <button type="button" className="sign-out-button" onClick={signOut}>
          Oturumu Kapat
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
