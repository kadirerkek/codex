import { useMemo, useState } from 'react';
import { addMonths, format, isSameMonth } from 'date-fns';
import { tr } from 'date-fns/locale';
import { createCalendarMatrix, findTasksForDay, isSameCalendarDay } from '../../utils/datetime.js';

const CalendarPanel = ({ tasks, milestones }) => {
  const [referenceDate, setReferenceDate] = useState(new Date());
  const weeks = useMemo(() => createCalendarMatrix(referenceDate), [referenceDate]);

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <button type="button" className="secondary-button" onClick={() => setReferenceDate(addMonths(referenceDate, -1))}>
          Önceki
        </button>
        <h3 style={{ margin: 0 }}>{format(referenceDate, 'MMMM yyyy', { locale: tr })}</h3>
        <button type="button" className="secondary-button" onClick={() => setReferenceDate(addMonths(referenceDate, 1))}>
          Sonraki
        </button>
      </div>
      <div className="calendar-grid">
        {weeks.flat().map((day) => {
          const dayTasks = findTasksForDay(tasks, day);
          const dayMilestones = milestones.filter((milestone) =>
            milestone.dueDate ? isSameCalendarDay(new Date(milestone.dueDate), day) : false
          );
          const isCurrentMonth = isSameMonth(day, referenceDate);

          return (
            <div
              key={day.toISOString()}
              className="calendar-cell"
              style={{ opacity: isCurrentMonth ? 1 : 0.5 }}
            >
              <header>
                <span>{format(day, 'd', { locale: tr })}</span>
              </header>
              {dayMilestones.map((milestone) => (
                <div key={milestone.id} className="calendar-event" style={{ background: 'rgba(124, 58, 237, 0.16)', color: '#7c3aed' }}>
                  {milestone.title}
                </div>
              ))}
              {dayTasks.map((task) => (
                <div key={task.id} className="calendar-event">
                  {task.name}
                </div>
              ))}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default CalendarPanel;
