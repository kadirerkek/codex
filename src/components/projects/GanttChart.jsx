import { differenceInCalendarDays, format } from 'date-fns';
import { tr } from 'date-fns/locale';
import { buildTimelineScale } from '../../utils/datetime.js';

const GanttChart = ({ tasks }) => {
  const scale = buildTimelineScale(tasks);
  const { days, start } = scale;

  return (
    <div>
      <div className="gantt-header">
        <span>Görev</span>
        <div className="gantt-grid" style={{ gridTemplateColumns: `repeat(${days.length}, minmax(42px, 1fr))` }}>
          {days.map((day) => (
            <div key={day.toISOString()} className="gantt-cell">
              {format(day, 'dd MMM', { locale: tr })}
            </div>
          ))}
        </div>
      </div>
      {tasks.map((task) => {
        const taskStart = task.startDate ? new Date(task.startDate) : start;
        const taskEnd = task.endDate ? new Date(task.endDate) : taskStart;
        const offset = Math.max(0, differenceInCalendarDays(taskStart, start));
        const duration = Math.max(1, differenceInCalendarDays(taskEnd, taskStart) + 1);

        return (
          <div key={task.id} className="gantt-row">
            <div>{task.name}</div>
            <div className="gantt-grid" style={{ gridTemplateColumns: `repeat(${days.length}, minmax(42px, 1fr))` }}>
              <div className="gantt-bar" style={{ gridColumn: `${offset + 1} / span ${duration}` }} />
            </div>
          </div>
        );
      })}
      {tasks.length === 0 && <p style={{ color: '#94a3b8' }}>Görev ekleyerek Gantt şemasını oluşturun.</p>}
    </div>
  );
};

export default GanttChart;
