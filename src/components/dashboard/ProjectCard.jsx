import { Link } from 'react-router-dom';
import { CalendarIcon, ArrowRightIcon, UserGroupIcon } from '@heroicons/react/24/outline';
import { formatDate } from '../../utils/datetime.js';
import { calculateProjectHealth } from '../../utils/ai.js';

const ProjectCard = ({ project, tasks = [], milestones = [], members = [] }) => {
  const completionFromTasks = tasks.length
    ? Math.round((tasks.filter((task) => task.status === 'done').length / tasks.length) * 100)
    : 0;
  const progress = project.metrics?.progress ?? completionFromTasks;
  const health = calculateProjectHealth(tasks, milestones);

  return (
    <Link to={`/projects/${project.id}`} className="project-card">
      <div className="project-card-header">
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <div className="project-pill">{project.aiCode}</div>
          <h3 style={{ fontSize: '1.35rem' }}>{project.name}</h3>
          <p style={{ fontSize: '0.92rem', color: '#64748b', maxWidth: 520 }}>{project.description}</p>
        </div>
        <ArrowRightIcon width={24} height={24} color="#2563eb" />
      </div>

      <div className="project-progress">
        <div className="progress-bar">
          <div className="progress-fill" style={{ width: `${progress}%` }} />
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ color: '#0f172a', fontWeight: 600 }}>{progress}% tamamlandı</span>
          <span className={`health-indicator ${health.status}`}>
            <span style={{ width: 8, height: 8, borderRadius: 9999, background: 'currentColor', display: 'inline-block' }} />
            {health.description}
          </span>
        </div>
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, color: '#64748b' }}>
          <CalendarIcon width={18} height={18} />
          <span>{project.dueDate ? `Teslim: ${formatDate(project.dueDate)}` : 'Teslim tarihi belirlenmedi'}</span>
        </div>
        <div className="avatar-stack">
          {members.slice(0, 4).map((member) => (
            <img key={member.uid} src={member.photoURL || `https://ui-avatars.com/api/?name=${member.displayName}`} alt={member.displayName} />
          ))}
          {members.length > 4 && (
            <div
              style={{
                width: 38,
                height: 38,
                borderRadius: 14,
                background: 'rgba(37,99,235,0.1)',
                border: '2px solid white',
                display: 'grid',
                placeItems: 'center',
                marginLeft: -12,
                color: '#2563eb',
                fontWeight: 600
              }}
            >
              +{members.length - 4}
            </div>
          )}
        </div>
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', color: '#64748b' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <UserGroupIcon width={18} height={18} />
          <span>{members.length} üye</span>
        </div>
        <span style={{ fontSize: '0.85rem' }}>{milestones.length} kilometre taşı</span>
      </div>
    </Link>
  );
};

export default ProjectCard;
