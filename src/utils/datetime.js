import {
  addDays,
  differenceInCalendarDays,
  eachDayOfInterval,
  endOfMonth,
  endOfWeek,
  format,
  formatDistanceToNow,
  isSameDay,
  parseISO,
  startOfMonth,
  startOfWeek
} from 'date-fns';
import { tr } from 'date-fns/locale';

export const formatDate = (value, formatString = 'dd MMM yyyy') => {
  if (!value) return '—';
  const date = typeof value === 'string' ? parseISO(value) : value;
  return format(date, formatString, { locale: tr });
};

export const formatRelative = (value) => {
  if (!value) return '—';
  const date = typeof value === 'string' ? parseISO(value) : value;
  return formatDistanceToNow(date, { addSuffix: true, locale: tr });
};

export const createCalendarMatrix = (referenceDate = new Date()) => {
  const start = startOfWeek(startOfMonth(referenceDate), { weekStartsOn: 1 });
  const end = endOfWeek(endOfMonth(referenceDate), { weekStartsOn: 1 });
  const days = eachDayOfInterval({ start, end });
  const weeks = [];

  for (let i = 0; i < days.length; i += 7) {
    weeks.push(days.slice(i, i + 7));
  }

  return weeks;
};

export const buildTimelineScale = (tasks = []) => {
  if (!tasks.length) {
    const today = new Date();
    return {
      start: today,
      end: addDays(today, 14),
      totalDays: 15,
      days: eachDayOfInterval({ start: today, end: addDays(today, 14) })
    };
  }

  const start = tasks
    .map((task) => (task.startDate ? new Date(task.startDate) : null))
    .filter(Boolean)
    .sort((a, b) => a - b)[0];

  const end = tasks
    .map((task) => (task.endDate ? new Date(task.endDate) : null))
    .filter(Boolean)
    .sort((a, b) => b - a)[0];

  const startDate = start || new Date();
  const endDate = end || addDays(startDate, 14);
  const days = eachDayOfInterval({ start: startDate, end: endDate });

  return {
    start: startDate,
    end: endDate,
    totalDays: differenceInCalendarDays(endDate, startDate) + 1,
    days
  };
};

export const findTasksForDay = (tasks, day) =>
  tasks.filter((task) => {
    if (!task.startDate || !task.endDate) return false;
    const startDate = new Date(task.startDate);
    const endDate = new Date(task.endDate);
    return startDate <= day && endDate >= day;
  });

export const isSameCalendarDay = (left, right) => isSameDay(left, right);

export const calculateTaskProgress = (task) => {
  if (typeof task.progress === 'number') return task.progress;
  const now = new Date();
  if (!task.startDate || !task.endDate) return 0;
  const start = new Date(task.startDate);
  const end = new Date(task.endDate);
  if (now <= start) return 0;
  if (now >= end) return 100;
  const total = differenceInCalendarDays(end, start) || 1;
  const elapsed = differenceInCalendarDays(now, start);
  return Math.min(100, Math.max(0, Math.round((elapsed / total) * 100)));
};
