import { useEffect, useMemo, useState } from 'react';
import { collection, onSnapshot, query, where } from 'firebase/firestore';
import { useAuth } from '../../context/AuthContext.jsx';
import { db } from '../../firebase.js';
import { useCollection } from '../../hooks/useCollection.js';
import ProjectCard from './ProjectCard.jsx';
import ChatPanel from '../chat/ChatPanel.jsx';
import { generatePlanSuggestions, generateRiskAdvice } from '../../utils/ai.js';
import { formatDate } from '../../utils/datetime.js';

const Dashboard = ({ onCreateProject }) => {
  const { user, profile } = useAuth();
  const projectQuery = user ? query(collection(db, 'projects'), where('memberIds', 'array-contains', user.uid)) : null;
  const { data: projects, loading: loadingProjects } = useCollection(projectQuery);
  const [projectData, setProjectData] = useState({});

  useEffect(() => {
    if (!projects.length) {
      setProjectData({});
      return () => undefined;
    }

    const unsubscribes = [];

    projects.forEach((project) => {
      const tasksRef = collection(db, 'projects', project.id, 'tasks');
      const milestonesRef = collection(db, 'projects', project.id, 'milestones');
      const membersRef = collection(db, 'projects', project.id, 'members');
      const risksRef = collection(db, 'projects', project.id, 'risks');

      unsubscribes.push(
        onSnapshot(tasksRef, (snapshot) => {
          setProjectData((prev) => ({
            ...prev,
            [project.id]: {
              ...(prev[project.id] || {}),
              tasks: snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }))
            }
          }));
        })
      );

      unsubscribes.push(
        onSnapshot(milestonesRef, (snapshot) => {
          setProjectData((prev) => ({
            ...prev,
            [project.id]: {
              ...(prev[project.id] || {}),
              milestones: snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }))
            }
          }));
        })
      );

      unsubscribes.push(
        onSnapshot(membersRef, (snapshot) => {
          setProjectData((prev) => ({
            ...prev,
            [project.id]: {
              ...(prev[project.id] || {}),
              members: snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }))
            }
          }));
        })
      );

      unsubscribes.push(
        onSnapshot(risksRef, (snapshot) => {
          setProjectData((prev) => ({
            ...prev,
            [project.id]: {
              ...(prev[project.id] || {}),
              risks: snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }))
            }
          }));
        })
      );
    });

    return () => {
      unsubscribes.forEach((unsubscribe) => unsubscribe());
    };
  }, [projects]);

  const analytics = useMemo(() => {
    const totalProjects = projects.length;
    let totalTasks = 0;
    let completedTasks = 0;
    let totalMembers = new Set();
    const allMilestones = [];
    const allRisks = [];

    projects.forEach((project) => {
      const data = projectData[project.id] || {};
      const tasks = data.tasks || [];
      const milestones = data.milestones || [];
      const members = data.members || [];
      const risks = data.risks || [];

      totalTasks += tasks.length;
      completedTasks += tasks.filter((task) => task.status === 'done').length;
      members.forEach((member) => totalMembers.add(member.uid));
      milestones.forEach((milestone) => allMilestones.push({ ...milestone, projectId: project.id, projectName: project.name }));
      risks.forEach((risk) => allRisks.push(risk));
    });

    const nextMilestone = allMilestones
      .map((milestone) => ({
        ...milestone,
        dueDateValue: milestone.dueDate ? new Date(milestone.dueDate) : null
      }))
      .filter((milestone) => milestone.dueDateValue)
      .sort((a, b) => a.dueDateValue - b.dueDateValue)[0];

    const aiInsights = projects
      .flatMap((project) => {
        const data = projectData[project.id] || {};
        return generatePlanSuggestions(project, data.tasks || [], data.milestones || []);
      })
      .slice(0, 5);

    return {
      totalProjects,
      totalTasks,
      completedTasks,
      memberCount: totalMembers.size,
      completionRate: totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0,
      nextMilestone,
      aiInsights,
      riskAdvice: generateRiskAdvice(allRisks)
    };
  }, [projects, projectData]);

  return (
    <div>
      <div className="page-heading">
        <div>
          <h1>Merhaba {profile?.displayName?.split(' ')[0] || 'NovaFlow üyesi'} 👋</h1>
          <p>Projelerinizin nabzını tek ekrandan takip edin, ekip aktivitesini gerçek zamanlı görün.</p>
        </div>
        <button type="button" className="primary-button" onClick={onCreateProject}>
          Yeni proje oluştur
        </button>
      </div>

      <div className="grid three" style={{ marginBottom: 32 }}>
        <div className="stat-card">
          <small>Aktif Proje</small>
          <strong>{analytics.totalProjects}</strong>
          <span className="stat-trend">AI izleme açık</span>
        </div>
        <div className="stat-card">
          <small>Tamamlanma Oranı</small>
          <strong>{analytics.completionRate}%</strong>
          <span style={{ color: '#94a3b8' }}>{analytics.totalTasks} görevden {analytics.completedTasks} tanesi tamamlandı.</span>
        </div>
        <div className="stat-card">
          <small>Ekip Büyüklüğü</small>
          <strong>{analytics.memberCount}</strong>
          <span style={{ color: '#94a3b8' }}>Projelerde aktif kullanıcı sayısı</span>
        </div>
      </div>

      <section className="card">
        <div className="card-header">
          <div>
            <div className="card-title">Aktif projeleriniz</div>
            <div className="card-subtitle">Yapay zeka destekli öngörüler ve durum raporları</div>
          </div>
          <button type="button" className="secondary-button" onClick={onCreateProject}>
            + Yeni proje
          </button>
        </div>
        {loadingProjects && <span style={{ color: '#94a3b8' }}>Projeler yükleniyor...</span>}
        {!loadingProjects && projects.length === 0 && (
          <div className="empty-state">
            <h3>Henüz bir projeniz yok</h3>
            <p>Yeni bir proje oluşturarak AI destekli planlama, dosya yönetimi ve kilometre taşı takibini başlatın.</p>
            <button type="button" className="primary-button" onClick={onCreateProject}>
              İlk projeni başlat
            </button>
          </div>
        )}
        {!loadingProjects && projects.length > 0 && (
          <div className="grid two">
            {projects.map((project) => (
              <ProjectCard
                key={project.id}
                project={project}
                tasks={projectData[project.id]?.tasks || []}
                milestones={projectData[project.id]?.milestones || []}
                members={projectData[project.id]?.members || []}
              />
            ))}
          </div>
        )}
      </section>

      <div className="grid two" style={{ marginTop: 32 }}>
        <div className="card">
          <div className="card-header">
            <div>
              <div className="card-title">AI Durum Raporu</div>
              <div className="card-subtitle">NovaFlow asistanı tarafından önerilen aksiyonlar</div>
            </div>
          </div>
          <div className="ai-chip">
            <span role="img" aria-label="sparkles">
              ✨
            </span>
            Akıllı öneriler
          </div>
          <div className="ai-suggestion-list">
            {analytics.aiInsights.length === 0 && <span>Projeleriniz için yeni bir görev veya kilometre taşı ekleyin.</span>}
            {analytics.aiInsights.map((suggestion, index) => (
              <div key={index} className="ai-suggestion">
                {suggestion}
              </div>
            ))}
          </div>
          {analytics.nextMilestone && (
            <div style={{ marginTop: 20 }}>
              <strong>Sıradaki kilometre taşı</strong>
              <p style={{ color: '#64748b' }}>
                {analytics.nextMilestone.title} • {formatDate(analytics.nextMilestone.dueDate)} • {analytics.nextMilestone.projectName}
              </p>
            </div>
          )}
          <div style={{ marginTop: 20 }}>
            <strong>Risk analizi</strong>
            <p style={{ color: '#64748b' }}>{analytics.riskAdvice}</p>
          </div>
        </div>
        <ChatPanel projectId={null} title="NovaFlow Canlı Sohbet" placeholder="Ekip arkadaşlarınıza hızlıca ulaşın..." />
      </div>
    </div>
  );
};

export default Dashboard;
