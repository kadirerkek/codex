import { ArrowDownTrayIcon } from '@heroicons/react/24/outline';
import { formatDate, formatRelative } from '../../utils/datetime.js';
import { summarizeNotes } from '../../utils/ai.js';

const formatSize = (size) => {
  if (!size) return '—';
  if (size < 1024) return `${size} B`;
  if (size < 1024 * 1024) return `${(size / 1024).toFixed(1)} KB`;
  if (size < 1024 * 1024 * 1024) return `${(size / (1024 * 1024)).toFixed(1)} MB`;
  return `${(size / (1024 * 1024 * 1024)).toFixed(1)} GB`;
};

const FileDetail = ({ node, breadcrumbs, notes, noteText, onNoteTextChange, onAddNote }) => (
  <div className="file-detail">
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
      <div>
        <h2 style={{ marginBottom: 6 }}>{node.name}</h2>
        <p style={{ color: '#94a3b8', fontSize: '0.9rem' }}>{breadcrumbs.join(' / ')}</p>
      </div>
      {node.downloadURL && (
        <a
          className="primary-button"
          href={node.downloadURL}
          target="_blank"
          rel="noreferrer"
          style={{ textDecoration: 'none' }}
        >
          <ArrowDownTrayIcon width={18} height={18} /> Dosyayı indir
        </a>
      )}
    </div>

    <div className="file-meta">
      <div>
        <strong>AI önerilen kod</strong>
        <p>{node.aiName}</p>
      </div>
      <div>
        <strong>Boyut</strong>
        <p>{formatSize(node.size)}</p>
      </div>
      <div>
        <strong>Oluşturan</strong>
        <p>{node.createdByName || node.createdBy}</p>
      </div>
      <div>
        <strong>Oluşturulma tarihi</strong>
        <p>{node.createdAt?.toDate ? formatDate(node.createdAt.toDate()) : '—'}</p>
      </div>
      <div>
        <strong>Son güncelleme</strong>
        <p>{node.createdAt?.toDate ? formatRelative(node.createdAt.toDate()) : 'Az önce'}</p>
      </div>
    </div>

    <div>
      <h3 className="section-title">Notlar</h3>
      <p className="section-subtitle">Yapay zeka özetleri ile dosya kontekstini takip edin.</p>
      <div className="note-summary">{summarizeNotes(notes)}</div>
      <div className="note-list">
        {notes.map((note) => (
          <div key={note.id} className="note-card">
            <span style={{ color: '#0f172a' }}>{note.content}</span>
            <small>{note.createdAt?.toDate ? formatRelative(note.createdAt.toDate()) : 'Az önce'}</small>
          </div>
        ))}
        {notes.length === 0 && <span style={{ color: '#94a3b8' }}>Bu dosya için henüz not bulunmuyor.</span>}
      </div>
      <form className="inline-form" style={{ flexDirection: 'column', alignItems: 'stretch', marginTop: 16 }} onSubmit={onAddNote}>
        <textarea
          placeholder="Bu dosya ile ilgili önemli bilgileri not alın..."
          value={noteText}
          onChange={(event) => onNoteTextChange(event.target.value)}
        />
        <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
          <button type="submit" className="primary-button" disabled={!noteText.trim()}>
            Notu ekle
          </button>
        </div>
      </form>
    </div>
  </div>
);

export default FileDetail;
