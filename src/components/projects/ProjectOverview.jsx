import { useMemo } from 'react';
import { formatDate } from '../../utils/datetime.js';
import { calculateProjectHealth, generatePlanSuggestions } from '../../utils/ai.js';

const ProjectOverview = ({ project, tasks, milestones, members, risks }) => {
  const stats = useMemo(() => {
    const totalTasks = tasks.length;
    const completed = tasks.filter((task) => task.status === 'done').length;
    const progress = project.metrics?.progress ?? (totalTasks > 0 ? Math.round((completed / totalTasks) * 100) : 0);
    const health = calculateProjectHealth(tasks, milestones);
    const openRisks = risks.filter((risk) => risk.status !== 'closed');
    const upcomingMilestones = milestones
      .map((milestone) => ({
        ...milestone,
        dueDateValue: milestone.dueDate ? new Date(milestone.dueDate) : null
      }))
      .filter((milestone) => milestone.dueDateValue)
      .sort((a, b) => a.dueDateValue - b.dueDateValue)
      .slice(0, 3);
    const aiRecommendations = generatePlanSuggestions(project, tasks, milestones);

    return {
      totalTasks,
      completed,
      progress,
      health,
      openRisks,
      upcomingMilestones,
      aiRecommendations
    };
  }, [project, tasks, milestones, risks]);

  const stageSummary = useMemo(() => {
    if (!milestones.length) {
      return 'Kilometre taşlarını planlayarak projenizin ritmini belirleyin.';
    }
    const completedMilestones = milestones.filter((milestone) => milestone.status === 'completed');
    if (completedMilestones.length === milestones.length) {
      return 'Tüm kilometre taşları tamamlandı. Proje kapanış sürecini başlatabilirsiniz.';
    }
    const nextMilestone = stats.upcomingMilestones[0];
    if (nextMilestone) {
      return `${nextMilestone.title} teslimi ${formatDate(nextMilestone.dueDate)} tarihinde. Bağımlılıklar gözden geçiriliyor.`;
    }
    return 'Yeni kilometre taşları ekleyerek proje yol haritanızı canlı tutun.';
  }, [milestones, stats.upcomingMilestones]);

  return (
    <div className="grid two">
      <div className="card" style={{ gap: 24 }}>
        <div className="grid three">
          <div className="stat-card">
            <small>İlerleme</small>
            <strong>{stats.progress}%</strong>
            <span className={`health-indicator ${stats.health.status}`}>{stats.health.description}</span>
          </div>
          <div className="stat-card">
            <small>Görevler</small>
            <strong>
              {stats.completed}/{stats.totalTasks || 0}
            </strong>
            <span style={{ color: '#94a3b8' }}>Tamamlanan görev</span>
          </div>
          <div className="stat-card">
            <small>Ekip</small>
            <strong>{members.length}</strong>
            <span style={{ color: '#94a3b8' }}>Aktif üye</span>
          </div>
        </div>

        <div>
          <h3 className="section-title">Proje durumu</h3>
          <p className="section-subtitle">Kilometre taşları, riskler ve teslim tarihleri</p>
          <div className="milestone-list">
            {stats.upcomingMilestones.length === 0 && <span style={{ color: '#94a3b8' }}>Planlanmış kilometre taşı yok.</span>}
            {stats.upcomingMilestones.map((milestone) => (
              <div key={milestone.id} className="milestone-card">
                <strong>{milestone.title}</strong>
                <span style={{ color: '#64748b' }}>{milestone.description}</span>
                <span className="milestone-status on-track">{formatDate(milestone.dueDate)}</span>
              </div>
            ))}
          </div>
        </div>

        <div>
          <h3 className="section-title">AI önerileri</h3>
          <div className="ai-suggestion-list">
            {stats.aiRecommendations.map((recommendation, index) => (
              <div key={index} className="ai-suggestion">
                {recommendation}
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="card" style={{ gap: 20 }}>
        <div>
          <h3 className="section-title">Görev durumu</h3>
          <div className="timeline-list">
            <div className="timeline-item">
              <strong>Yapılacak</strong>
              <span style={{ color: '#94a3b8' }}>{tasks.filter((task) => task.status === 'todo').length} görev</span>
            </div>
            <div className="timeline-item">
              <strong>Devam eden</strong>
              <span style={{ color: '#94a3b8' }}>{tasks.filter((task) => task.status === 'in_progress').length} görev</span>
            </div>
            <div className="timeline-item">
              <strong>Tamamlanan</strong>
              <span style={{ color: '#94a3b8' }}>{stats.completed} görev</span>
            </div>
          </div>
        </div>

        <div>
          <h3 className="section-title">Risk kaydı</h3>
          <div className="risk-list">
            {stats.openRisks.length === 0 && <span style={{ color: '#94a3b8' }}>Aktif risk bulunmuyor.</span>}
            {stats.openRisks.map((risk) => (
              <div key={risk.id} className="risk-card">
                <strong>{risk.title}</strong>
                <span style={{ color: '#94a3b8' }}>Etki: {risk.impact}</span>
                <p>{risk.mitigation}</p>
              </div>
            ))}
          </div>
        </div>

        <div>
          <h3 className="section-title">Genel özet</h3>
          <p style={{ color: '#64748b' }}>{stageSummary}</p>
        </div>
      </div>
    </div>
  );
};

export default ProjectOverview;
