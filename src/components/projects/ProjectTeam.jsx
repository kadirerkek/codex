import { useMemo, useState } from 'react';
import { collection, doc, setDoc, updateDoc } from 'firebase/firestore';
import { useCollection } from '../../hooks/useCollection.js';
import { db } from '../../firebase.js';

const ProjectTeam = ({ project, projectId, members }) => {
  const { data: users } = useCollection(collection(db, 'users'));
  const [selectedUser, setSelectedUser] = useState('');
  const [role, setRole] = useState('Üye');
  const [loading, setLoading] = useState(false);

  const availableUsers = useMemo(() => {
    const memberIds = new Set(members.map((member) => member.uid));
    return users.filter((user) => !memberIds.has(user.uid));
  }, [users, members]);

  const handleInvite = async (event) => {
    event.preventDefault();
    if (!selectedUser) return;
    setLoading(true);
    try {
      const user = users.find((item) => item.uid === selectedUser);
      await setDoc(doc(db, 'projects', projectId, 'members', user.uid), {
        uid: user.uid,
        displayName: user.displayName,
        email: user.email,
        photoURL: user.photoURL,
        role,
        joinedAt: new Date().toISOString()
      });
      await updateDoc(doc(db, 'projects', projectId), {
        memberIds: Array.from(new Set([...(project.memberIds || []), user.uid]))
      });
      setSelectedUser('');
      setRole('Üye');
    } finally {
      setLoading(false);
    }
  };

  const handleRoleChange = async (member, newRole) => {
    await updateDoc(doc(db, 'projects', projectId, 'members', member.uid), {
      role: newRole
    });
  };

  return (
    <div>
      <h3 className="section-title">Ekip yönetimi</h3>
      <p className="section-subtitle">Rol ve sorumlulukları düzenleyin.</p>
      <form className="inline-form" style={{ flexDirection: 'column', gap: 12 }} onSubmit={handleInvite}>
        <select value={selectedUser} onChange={(event) => setSelectedUser(event.target.value)}>
          <option value="">Üye seçin</option>
          {availableUsers.map((user) => (
            <option key={user.uid} value={user.uid}>
              {user.displayName} ({user.email})
            </option>
          ))}
        </select>
        <select value={role} onChange={(event) => setRole(event.target.value)}>
          <option value="Proje Sahibi">Proje Sahibi</option>
          <option value="Ürün Yöneticisi">Ürün Yöneticisi</option>
          <option value="Takım Lideri">Takım Lideri</option>
          <option value="Üye">Üye</option>
        </select>
        <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
          <button type="submit" className="secondary-button" disabled={loading}>
            {loading ? 'Ekleniyor...' : 'Ekip üyesi ekle'}
          </button>
        </div>
      </form>
      <div className="team-list" style={{ marginTop: 20 }}>
        {members.map((member) => (
          <div key={member.uid} className="team-member-card">
            <strong>{member.displayName}</strong>
            <span style={{ color: '#94a3b8' }}>{member.email}</span>
            <select value={member.role || 'Üye'} onChange={(event) => handleRoleChange(member, event.target.value)}>
              <option value="Proje Sahibi">Proje Sahibi</option>
              <option value="Ürün Yöneticisi">Ürün Yöneticisi</option>
              <option value="Takım Lideri">Takım Lideri</option>
              <option value="Üye">Üye</option>
            </select>
          </div>
        ))}
        {members.length === 0 && <span style={{ color: '#94a3b8' }}>Henüz ekip üyesi eklenmedi.</span>}
      </div>
    </div>
  );
};

export default ProjectTeam;
