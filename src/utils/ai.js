const adjectives = [
  'Nova',
  'Quantum',
  'Aurora',
  'Luminous',
  'Vertex',
  'Prisma',
  'Atlas',
  'Nexus',
  'Orbital',
  'Radiant',
  'Vivid',
  'Zenith',
  'Hyper',
  'Stellar',
  'Crystal',
  'Eclipse',
  'Pioneer',
  'Aether',
  'Nimbus',
  'Velocity'
];

const nouns = [
  'Matrix',
  'Flow',
  'Pulse',
  'Forge',
  'Circuit',
  'Bridge',
  'Stream',
  'Beacon',
  'Fabric',
  'Archive',
  'Vault',
  'Canvas',
  'Node',
  'Archive',
  'Mirror',
  'Cluster',
  'Orbit',
  'Vector',
  'Layer',
  'Sync'
];

const verbs = ['Launch', 'Design', 'Review', 'Deploy', 'Audit', 'Monitor', 'Refine', 'Accelerate'];

const randomId = () => {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID().split('-')[0];
  }
  return Math.random().toString(36).slice(2, 10);
};

const hashString = (value) => {
  let hash = 0;
  for (let i = 0; i < value.length; i += 1) {
    hash = (hash << 5) - hash + value.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash);
};

const sanitize = (value) =>
  value
    .toString()
    .normalize('NFD')
    .replace(/[^\w\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-');

export const generateProjectCode = (name) => {
  const base = sanitize(name).slice(0, 6).toUpperCase();
  const suffix = randomId().slice(0, 4).toUpperCase();
  return `${base}-${suffix}`;
};

export const generateSmartName = (seed, projectCode = 'PX', context = []) => {
  const source = `${projectCode}-${seed || ''}-${context.length}`;
  const hash = hashString(source);
  const adjective = adjectives[hash % adjectives.length];
  const noun = nouns[(hash >> 3) % nouns.length];
  const normalizedSeed = sanitize(seed || 'asset');
  const uniqueFragment = (hash % 9999).toString().padStart(4, '0');
  return `${projectCode}-${adjective}${noun}-${normalizedSeed || 'artifact'}-${uniqueFragment}`;
};

export const summarizeText = (text) => {
  if (!text) return '';
  const clean = text.replace(/\s+/g, ' ').trim();
  if (clean.length <= 220) return clean;
  const sentences = clean.split(/(?<=[.!?])\s+/).filter(Boolean);
  const summary = sentences.slice(0, 2).join(' ');
  return summary.length > 0 ? summary : `${clean.slice(0, 200)}...`;
};

export const summarizeNotes = (notes = []) => {
  if (!notes.length) return 'Henüz özetlenecek bir not bulunmuyor.';
  const important = notes
    .slice(0, 5)
    .map((note) => note.summary || summarizeText(note.content || ''))
    .filter(Boolean);
  if (!important.length) return 'Son eklenen not için henüz özet oluşturulmadı.';
  return important.slice(0, 3).join(' • ');
};

export const generatePlanSuggestions = (project, tasks = [], milestones = []) => {
  if (!project) return [];
  const pendingTasks = tasks.filter((task) => task.status !== 'done');
  const nearDueMilestones = milestones
    .map((milestone) => ({
      ...milestone,
      dueDateValue: milestone.dueDate ? new Date(milestone.dueDate) : null
    }))
    .filter((milestone) => milestone.dueDateValue && milestone.status !== 'completed')
    .sort((a, b) => a.dueDateValue - b.dueDateValue);

  const suggestions = [];

  if (pendingTasks.length > 0) {
    suggestions.push(
      `Bekleyen ${pendingTasks.length} görevi haftalık sprint planına dahil edin ve AI kontrol listesi ile önceliklendirin.`
    );
  }

  if (nearDueMilestones.length > 0) {
    const [nextMilestone] = nearDueMilestones;
    suggestions.push(
      `${nextMilestone.title} kilometre taşı ${new Intl.DateTimeFormat('tr-TR').format(
        nextMilestone.dueDateValue
      )} tarihinde planlanmış. Kilit bağımlılıkları ve riskleri gözden geçirin.`
    );
  }

  if (project.dueDate) {
    const dueDate = new Date(project.dueDate);
    const now = new Date();
    const remaining = Math.ceil((dueDate - now) / (1000 * 60 * 60 * 24));
    if (remaining > 0) {
      suggestions.push(
        `Proje teslimine ${remaining} gün kaldı. Gantt şemasını güncelleyip kritik yol analizi yapmayı unutmayın.`
      );
    }
  }

  if (suggestions.length === 0) {
    suggestions.push('Tüm kilometre taşları plana uygun ilerliyor. AI raporu günlük kontrol ile destekleniyor.');
  }

  return suggestions;
};

export const calculateProjectHealth = (tasks = [], milestones = []) => {
  if (!tasks.length && !milestones.length) {
    return { status: 'good', description: 'Planlama aşamasında - risk görülmüyor.' };
  }

  const completedTasks = tasks.filter((task) => task.status === 'done').length;
  const completionRate = tasks.length ? completedTasks / tasks.length : 1;
  const overdueMilestones = milestones.filter((milestone) => {
    if (!milestone.dueDate) return false;
    const dueDate = new Date(milestone.dueDate);
    return milestone.status !== 'completed' && dueDate < new Date();
  });

  if (completionRate < 0.4 || overdueMilestones.length > 1) {
    return { status: 'poor', description: 'Plan gecikiyor. Sprint temposunu gözden geçirin ve riskleri azaltın.' };
  }

  if (completionRate < 0.7 || overdueMilestones.length === 1) {
    return {
      status: 'moderate',
      description: 'Bazı kilometre taşları risk altında. Ekip kapasitesini yeniden dengeleyin.'
    };
  }

  return { status: 'good', description: 'Proje sağlıklı ilerliyor. Momentumunuzu koruyun.' };
};

export const generateMilestoneTemplate = (projectName) => [
  {
    title: `${projectName} - Keşif ve Analiz`,
    description: 'Paydaş görüşmeleri, gereksinim toplama ve kapsam netleştirme.',
    status: 'planned'
  },
  {
    title: `${projectName} - Tasarım Sprinti`,
    description: 'Önceliklendirilmiş kullanıcı akışları ve arayüz prototipleri.',
    status: 'planned'
  },
  {
    title: `${projectName} - MVP Yayını`,
    description: 'Önemli özelliklerin canlıya alınması ve ölçüm planı.',
    status: 'planned'
  }
];

export const buildFileBreadcrumb = (node, nodeMap) => {
  if (!node) return [];
  const breadcrumbs = [node.name || node.aiName];
  let current = node;
  while (current.parentId) {
    const parent = nodeMap.get(current.parentId);
    if (!parent) break;
    breadcrumbs.unshift(parent.name || parent.aiName);
    current = parent;
  }
  return breadcrumbs;
};

export const generateRiskAdvice = (risks = []) => {
  if (!risks.length) {
    return 'Risk kaydı boş. Stratejik riskleri ve azaltma adımlarını kaydetmek için AI rehberini kullanın.';
  }
  const openRisks = risks.filter((risk) => risk.status !== 'closed');
  const highImpact = openRisks.filter((risk) => risk.impact === 'high');
  if (highImpact.length > 0) {
    return `${highImpact.length} kritik risk tespit edildi. Haftalık risk gözden geçirmesi planlayın.`;
  }
  return `Toplam ${openRisks.length} açık risk bulunuyor. Risk yanıt planlarını güncel tutun.`;
};
