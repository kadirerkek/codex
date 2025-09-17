import { useEffect, useMemo, useState } from 'react';
import { useParams } from 'react-router-dom';
import { collection, doc, onSnapshot, orderBy, query } from 'firebase/firestore';
import LoadingScreen from '../layout/LoadingScreen.jsx';
import { db } from '../../firebase.js';
import { useDocument } from '../../hooks/useDocument.js';
import ProjectOverview from './ProjectOverview.jsx';
import ProjectFiles from './ProjectFiles.jsx';
import ProjectSchedule from './ProjectSchedule.jsx';
import ProjectTeam from './ProjectTeam.jsx';
import ProjectRisks from './ProjectRisks.jsx';
import ChatPanel from '../chat/ChatPanel.jsx';

const tabs = [
  { id: 'overview', label: 'Genel bakış' },
  { id: 'files', label: 'Dosya merkezi' },
  { id: 'schedule', label: 'Zaman çizelgesi' },
  { id: 'collaboration', label: 'İşbirliği' }
];

const ProjectWorkspace = ({ onCreateProject }) => {
  const { projectId } = useParams();
  const { data: project, loading } = useDocument(projectId ? doc(db, 'projects', projectId) : null);
  const [activeTab, setActiveTab] = useState('overview');
  const [tasks, setTasks] = useState([]);
  const [milestones, setMilestones] = useState([]);
  const [members, setMembers] = useState([]);
  const [risks, setRisks] = useState([]);

  useEffect(() => {
    if (!projectId) return undefined;

    const tasksUnsub = onSnapshot(query(collection(db, 'projects', projectId, 'tasks'), orderBy('startDate', 'asc')), (snapshot) => {
      setTasks(snapshot.docs.map((docSnap) => ({ id: docSnap.id, ...docSnap.data() })));
    });

    const milestonesUnsub = onSnapshot(
      query(collection(db, 'projects', projectId, 'milestones'), orderBy('order', 'asc')),
      (snapshot) => {
        setMilestones(snapshot.docs.map((docSnap) => ({ id: docSnap.id, ...docSnap.data() })));
      }
    );

    const membersUnsub = onSnapshot(collection(db, 'projects', projectId, 'members'), (snapshot) => {
      setMembers(snapshot.docs.map((docSnap) => ({ id: docSnap.id, ...docSnap.data() })));
    });

    const risksUnsub = onSnapshot(collection(db, 'projects', projectId, 'risks'), (snapshot) => {
      setRisks(snapshot.docs.map((docSnap) => ({ id: docSnap.id, ...docSnap.data() })));
    });

    return () => {
      tasksUnsub();
      milestonesUnsub();
      membersUnsub();
      risksUnsub();
    };
  }, [projectId]);

  useEffect(() => {
    setActiveTab('overview');
  }, [projectId]);

  const headerBadges = useMemo(() => {
    if (!project) return [];
    const badges = [];
    if (project.priority) {
      badges.push({ label: project.priority?.toUpperCase(), tone: project.priority === 'critical' ? '#b91c1c' : '#2563eb' });
    }
    if (project.status) {
      badges.push({ label: project.status, tone: '#0f766e' });
    }
    if (project.dueDate) {
      badges.push({ label: `Teslim ${new Date(project.dueDate).toLocaleDateString('tr-TR')}`, tone: '#7c3aed' });
    }
    return badges;
  }, [project]);

  if (loading) {
    return <LoadingScreen message="Proje alanı hazırlanıyor..." />;
  }

  if (!project) {
    return (
      <div className="card">
        <h2>Proje bulunamadı</h2>
        <p>Proje silinmiş olabilir veya yetkiniz olmayabilir.</p>
      </div>
    );
  }

  return (
    <div>
      <div className="page-heading" style={{ marginBottom: 24 }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div className="project-pill">{project.aiCode}</div>
            {headerBadges.map((badge) => (
              <span
                key={badge.label}
                className="badge"
                style={{ background: `${badge.tone}1a`, color: badge.tone }}
              >
                {badge.label}
              </span>
            ))}
          </div>
          <h1>{project.name}</h1>
          <p style={{ maxWidth: 720 }}>{project.description}</p>
          <div className="tag-list">
            {(project.tags || []).map((tag) => (
              <span key={tag} className="tag">
                #{tag}
              </span>
            ))}
          </div>
        </div>
        <div className="quick-actions">
          <button type="button" className="secondary-button" onClick={onCreateProject}>
            Yeni proje
          </button>
          <button type="button" className="primary-button">
            Proje raporu indir
          </button>
        </div>
      </div>

      <div className="tab-list">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            type="button"
            className={`tab-button ${tab.id === activeTab ? 'active' : ''}`}
            onClick={() => setActiveTab(tab.id)}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {activeTab === 'overview' && (
        <ProjectOverview project={project} tasks={tasks} milestones={milestones} members={members} risks={risks} />
      )}

      {activeTab === 'files' && <ProjectFiles project={project} projectId={projectId} />}

      {activeTab === 'schedule' && (
        <ProjectSchedule project={project} projectId={projectId} tasks={tasks} milestones={milestones} members={members} />
      )}

      {activeTab === 'collaboration' && (
        <div className="grid two">
          <ChatPanel projectId={projectId} title={`${project.name} Sohbeti`} placeholder="Proje güncellemenizi paylaşın..." />
          <div className="card" style={{ gap: 24 }}>
            <ProjectTeam project={project} projectId={projectId} members={members} />
            <ProjectRisks projectId={projectId} risks={risks} members={members} />
          </div>
        </div>
      )}
    </div>
  );
};

export default ProjectWorkspace;
