import { useState } from 'react';
import { addDoc, collection, doc, serverTimestamp, updateDoc } from 'firebase/firestore';
import { useAuth } from '../../context/AuthContext.jsx';
import { db } from '../../firebase.js';
import { formatDate } from '../../utils/datetime.js';
import GanttChart from './GanttChart.jsx';
import CalendarPanel from './CalendarPanel.jsx';

const initialTask = {
  name: '',
  startDate: '',
  endDate: '',
  assigneeId: '',
  status: 'todo'
};

const initialMilestone = {
  title: '',
  dueDate: '',
  description: ''
};

const ProjectSchedule = ({ projectId, tasks, milestones, members }) => {
  const { user, profile } = useAuth();
  const [taskForm, setTaskForm] = useState(initialTask);
  const [milestoneForm, setMilestoneForm] = useState(initialMilestone);
  const [taskLoading, setTaskLoading] = useState(false);
  const [milestoneLoading, setMilestoneLoading] = useState(false);

  const handleTaskChange = (event) => {
    const { name, value } = event.target;
    setTaskForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleMilestoneChange = (event) => {
    const { name, value } = event.target;
    setMilestoneForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleTaskSubmit = async (event) => {
    event.preventDefault();
    if (!taskForm.name) return;
    setTaskLoading(true);
    try {
      await addDoc(collection(db, 'projects', projectId, 'tasks'), {
        ...taskForm,
        progress: 0,
        createdAt: serverTimestamp(),
        createdBy: user.uid,
        createdByName: profile?.displayName || user.displayName
      });
      setTaskForm(initialTask);
    } finally {
      setTaskLoading(false);
    }
  };

  const handleMilestoneSubmit = async (event) => {
    event.preventDefault();
    if (!milestoneForm.title) return;
    setMilestoneLoading(true);
    try {
      await addDoc(collection(db, 'projects', projectId, 'milestones'), {
        ...milestoneForm,
        status: 'planned',
        createdAt: serverTimestamp(),
        createdBy: user.uid,
        createdByName: profile?.displayName || user.displayName
      });
      setMilestoneForm(initialMilestone);
    } finally {
      setMilestoneLoading(false);
    }
  };

  const updateMilestoneStatus = async (milestone, status) => {
    await updateDoc(doc(db, 'projects', projectId, 'milestones', milestone.id), {
      status,
      updatedAt: serverTimestamp()
    });
  };

  const updateTaskStatus = async (task, status) => {
    await updateDoc(doc(db, 'projects', projectId, 'tasks', task.id), {
      status,
      updatedAt: serverTimestamp()
    });
  };

  return (
    <div className="grid two" style={{ gap: 32 }}>
      <div className="card">
        <div className="card-header">
          <div>
            <div className="card-title">Kilometre taşları</div>
            <div className="card-subtitle">Planlanan kritik teslimatlar</div>
          </div>
        </div>
        <form className="inline-form" style={{ flexDirection: 'column', gap: 12 }} onSubmit={handleMilestoneSubmit}>
          <input
            name="title"
            placeholder="Kilometre taşı başlığı"
            value={milestoneForm.title}
            onChange={handleMilestoneChange}
            required
          />
          <input name="dueDate" type="date" value={milestoneForm.dueDate} onChange={handleMilestoneChange} />
          <textarea
            name="description"
            placeholder="Kapsam / başarı kriterleri"
            value={milestoneForm.description}
            onChange={handleMilestoneChange}
          />
          <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
            <button type="submit" className="secondary-button" disabled={milestoneLoading}>
              {milestoneLoading ? 'Ekleniyor...' : 'Kilometre taşı ekle'}
            </button>
          </div>
        </form>
        <div className="milestone-list">
          {milestones.map((milestone) => (
            <div key={milestone.id} className="milestone-card">
              <strong>{milestone.title}</strong>
              <span style={{ color: '#64748b' }}>{milestone.description}</span>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span>{milestone.dueDate ? formatDate(milestone.dueDate) : 'Tarih yok'}</span>
                <button
                  type="button"
                  className="secondary-button"
                  onClick={() => updateMilestoneStatus(milestone, milestone.status === 'completed' ? 'planned' : 'completed')}
                >
                  {milestone.status === 'completed' ? 'Tekrar aç' : 'Tamamlandı olarak işaretle'}
                </button>
              </div>
            </div>
          ))}
          {milestones.length === 0 && <span style={{ color: '#94a3b8' }}>Henüz kilometre taşı eklenmedi.</span>}
        </div>
      </div>

      <div className="card">
        <div className="card-header">
          <div>
            <div className="card-title">Görev planı</div>
            <div className="card-subtitle">Sprint ve sorumluluk dağılımı</div>
          </div>
        </div>
        <form className="inline-form" style={{ flexDirection: 'column', gap: 12 }} onSubmit={handleTaskSubmit}>
          <input name="name" placeholder="Görev adı" value={taskForm.name} onChange={handleTaskChange} required />
          <div style={{ display: 'flex', gap: 12 }}>
            <input
              name="startDate"
              type="date"
              value={taskForm.startDate}
              onChange={handleTaskChange}
              style={{ flex: 1 }}
            />
            <input name="endDate" type="date" value={taskForm.endDate} onChange={handleTaskChange} style={{ flex: 1 }} />
          </div>
          <select name="assigneeId" value={taskForm.assigneeId} onChange={handleTaskChange}>
            <option value="">Sorumlu seçin</option>
            {members.map((member) => (
              <option key={member.uid} value={member.uid}>
                {member.displayName}
              </option>
            ))}
          </select>
          <select name="status" value={taskForm.status} onChange={handleTaskChange}>
            <option value="todo">Yapılacak</option>
            <option value="in_progress">Devam ediyor</option>
            <option value="done">Tamamlandı</option>
          </select>
          <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
            <button type="submit" className="secondary-button" disabled={taskLoading}>
              {taskLoading ? 'Kaydediliyor...' : 'Görev ekle'}
            </button>
          </div>
        </form>
        <div className="timeline-list">
          {tasks.map((task) => (
            <div key={task.id} className="timeline-item">
              <strong>{task.name}</strong>
              <span style={{ color: '#94a3b8' }}>
                {task.startDate ? formatDate(task.startDate) : '—'} → {task.endDate ? formatDate(task.endDate) : '—'}
              </span>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ color: '#94a3b8' }}>{task.assigneeId ? members.find((m) => m.uid === task.assigneeId)?.displayName : 'Atanmadı'}</span>
                <button
                  type="button"
                  className="secondary-button"
                  onClick={() => updateTaskStatus(task, task.status === 'done' ? 'in_progress' : 'done')}
                >
                  {task.status === 'done' ? 'Yeniden aç' : 'Tamamlandı'}
                </button>
              </div>
            </div>
          ))}
          {tasks.length === 0 && <span style={{ color: '#94a3b8' }}>Henüz görev tanımlanmadı.</span>}
        </div>
      </div>

      <div className="gantt-container" style={{ gridColumn: '1 / -1' }}>
        <h3 className="section-title">Gantt şeması</h3>
        <GanttChart tasks={tasks} />
      </div>

      <div className="card" style={{ gridColumn: '1 / -1' }}>
        <h3 className="section-title">Plan takvimi</h3>
        <CalendarPanel tasks={tasks} milestones={milestones} />
      </div>
    </div>
  );
};

export default ProjectSchedule;
