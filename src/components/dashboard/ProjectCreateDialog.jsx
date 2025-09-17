import { useState } from 'react';
import { addDoc, collection, doc, serverTimestamp, setDoc } from 'firebase/firestore';
import { useAuth } from '../../context/AuthContext.jsx';
import { db } from '../../firebase.js';
import { generateProjectCode, generateMilestoneTemplate } from '../../utils/ai.js';

const initialState = {
  name: '',
  description: '',
  startDate: '',
  dueDate: '',
  priority: 'normal',
  budget: '',
  visibility: 'private',
  tags: ''
};

const ProjectCreateDialog = ({ open, onClose }) => {
  const { user, profile } = useAuth();
  const [form, setForm] = useState(initialState);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!user) return;
    setError(null);
    setLoading(true);

    try {
      const aiCode = generateProjectCode(form.name || 'Proje');
      const tags = form.tags
        .split(',')
        .map((tag) => tag.trim())
        .filter(Boolean);

      const projectPayload = {
        name: form.name,
        description: form.description,
        status: 'planning',
        startDate: form.startDate || null,
        dueDate: form.dueDate || null,
        priority: form.priority,
        visibility: form.visibility,
        budget: form.budget ? Number(form.budget) : null,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        ownerId: user.uid,
        ownerName: user.displayName,
        ownerEmail: user.email,
        ownerAvatar: user.photoURL,
        aiCode,
        memberIds: [user.uid],
        tags,
        metrics: {
          progress: 0,
          health: 'good',
          budgetUsage: 0,
          sprintVelocity: 0
        }
      };

      const projectRef = await addDoc(collection(db, 'projects'), projectPayload);

      await setDoc(doc(db, 'projects', projectRef.id, 'members', user.uid), {
        uid: user.uid,
        role: 'Proje Sahibi',
        displayName: profile?.displayName || user.displayName,
        photoURL: profile?.photoURL || user.photoURL,
        email: user.email,
        joinedAt: serverTimestamp()
      });

      const templates = generateMilestoneTemplate(form.name || 'Yeni Proje');
      await Promise.all(
        templates.map((milestone, index) =>
          addDoc(collection(db, 'projects', projectRef.id, 'milestones'), {
            ...milestone,
            order: index,
            dueDate: null,
            status: 'planned',
            createdAt: serverTimestamp()
          })
        )
      );

      setForm(initialState);
      onClose();
    } catch (err) {
      console.error(err);
      setError('Proje oluşturulurken bir hata meydana geldi. Lütfen tekrar deneyin.');
    } finally {
      setLoading(false);
    }
  };

  if (!open) return null;

  return (
    <div className="modal-backdrop">
      <form className="modal" onSubmit={handleSubmit}>
        <header>
          <h2>Yeni proje başlat</h2>
          <p>AI destekli planlama ile projenizin temel yapı taşlarını birkaç adımda hazırlayın.</p>
        </header>
        <div className="form-grid">
          <label htmlFor="name">
            Proje adı
            <input id="name" name="name" value={form.name} onChange={handleChange} placeholder="Örn. Mobil uygulama dönüşümü" required />
          </label>
          <label htmlFor="priority">
            Öncelik
            <select id="priority" name="priority" value={form.priority} onChange={handleChange}>
              <option value="critical">Kritik</option>
              <option value="high">Yüksek</option>
              <option value="normal">Normal</option>
              <option value="low">Düşük</option>
            </select>
          </label>
          <label htmlFor="startDate">
            Başlangıç tarihi
            <input id="startDate" name="startDate" type="date" value={form.startDate} onChange={handleChange} />
          </label>
          <label htmlFor="dueDate">
            Teslim tarihi
            <input id="dueDate" name="dueDate" type="date" value={form.dueDate} onChange={handleChange} />
          </label>
          <label htmlFor="budget">
            Tahmini bütçe (₺)
            <input id="budget" name="budget" type="number" inputMode="decimal" value={form.budget} onChange={handleChange} />
          </label>
          <label htmlFor="visibility">
            Görünürlük
            <select id="visibility" name="visibility" value={form.visibility} onChange={handleChange}>
              <option value="private">Sadece ekip</option>
              <option value="company">Şirket içi</option>
              <option value="public">Organizasyon geneli</option>
            </select>
          </label>
        </div>
        <label htmlFor="description">
          Proje vizyonu
          <textarea
            id="description"
            name="description"
            value={form.description}
            onChange={handleChange}
            placeholder="Projenin temel hedeflerini, başarı metriklerini ve kapsamını tanımlayın."
          />
        </label>
        <label htmlFor="tags">
          Etiketler
          <input id="tags" name="tags" value={form.tags} onChange={handleChange} placeholder="Örn. mobil, müşteri deneyimi, v2" />
        </label>
        {error && (
          <div
            style={{
              borderRadius: '14px',
              padding: '12px 14px',
              background: 'rgba(239, 68, 68, 0.08)',
              border: '1px solid rgba(239, 68, 68, 0.18)',
              color: '#b91c1c'
            }}
          >
            {error}
          </div>
        )}
        <footer>
          <button type="button" className="secondary-button" onClick={onClose} disabled={loading}>
            Vazgeç
          </button>
          <button type="submit" className="primary-button" disabled={loading}>
            {loading ? 'Proje oluşturuluyor...' : 'Projeyi oluştur'}
          </button>
        </footer>
      </form>
    </div>
  );
};

export default ProjectCreateDialog;
