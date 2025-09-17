import { useState } from 'react';
import { addDoc, collection, doc, serverTimestamp, updateDoc } from 'firebase/firestore';
import { db } from '../../firebase.js';

const initialRisk = {
  title: '',
  impact: 'medium',
  mitigation: '',
  ownerId: ''
};

const ProjectRisks = ({ projectId, risks, members }) => {
  const [form, setForm] = useState(initialRisk);
  const [loading, setLoading] = useState(false);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!form.title) return;
    setLoading(true);
    try {
      await addDoc(collection(db, 'projects', projectId, 'risks'), {
        ...form,
        status: 'open',
        createdAt: serverTimestamp()
      });
      setForm(initialRisk);
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async (risk, status) => {
    await updateDoc(doc(db, 'projects', projectId, 'risks', risk.id), {
      status,
      updatedAt: serverTimestamp()
    });
  };

  return (
    <div>
      <h3 className="section-title">Risk kaydı</h3>
      <p className="section-subtitle">Riskleri ve aksiyon planlarını takip edin.</p>
      <form className="inline-form" style={{ flexDirection: 'column', gap: 12 }} onSubmit={handleSubmit}>
        <input name="title" placeholder="Risk başlığı" value={form.title} onChange={handleChange} required />
        <select name="impact" value={form.impact} onChange={handleChange}>
          <option value="low">Düşük etki</option>
          <option value="medium">Orta etki</option>
          <option value="high">Yüksek etki</option>
        </select>
        <textarea
          name="mitigation"
          placeholder="Azaltma planı"
          value={form.mitigation}
          onChange={handleChange}
        />
        <select name="ownerId" value={form.ownerId} onChange={handleChange}>
          <option value="">Sorumlu seçin</option>
          {members.map((member) => (
            <option key={member.uid} value={member.uid}>
              {member.displayName}
            </option>
          ))}
        </select>
        <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
          <button type="submit" className="secondary-button" disabled={loading}>
            {loading ? 'Kaydediliyor...' : 'Risk ekle'}
          </button>
        </div>
      </form>
      <div className="risk-list" style={{ marginTop: 20 }}>
        {risks.map((risk) => (
          <div key={risk.id} className="risk-card">
            <strong>{risk.title}</strong>
            <span style={{ color: '#94a3b8' }}>Etki: {risk.impact}</span>
            <p>{risk.mitigation}</p>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ color: '#94a3b8' }}>{risk.status === 'closed' ? 'Kapalı' : 'Açık'}</span>
              <button
                type="button"
                className="secondary-button"
                onClick={() => updateStatus(risk, risk.status === 'closed' ? 'open' : 'closed')}
              >
                {risk.status === 'closed' ? 'Tekrar aç' : 'Kapat'}
              </button>
            </div>
          </div>
        ))}
        {risks.length === 0 && <span style={{ color: '#94a3b8' }}>Risk kaydı boş.</span>}
      </div>
    </div>
  );
};

export default ProjectRisks;
