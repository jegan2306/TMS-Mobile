export const colors = {
  // Backgrounds
  background: '#0B0F19',
  surface: '#111827',
  surfaceLight: '#1F2937',
  card: '#1A2234',
  cardBorder: '#2B374E',
  modalBg: '#111827',
  
  // Brand / Accents
  primary: '#6366F1',
  primaryLight: '#818CF8',
  primaryDark: '#4338CA',
  secondary: '#38BDF8',
  accent: '#F43F5E',
  
  // Text
  textPrimary: '#F9FAFB',
  textSecondary: '#94A3B8',
  textMuted: '#64748B',
  
  // Statuses
  pending: {
    bg: '#FEF3C7',
    border: '#FDE68A',
    text: '#D97706',
    badge: '#F59E0B'
  },
  assigned: {
    bg: '#E0F2FE',
    border: '#BAE6FD',
    text: '#0284C7',
    badge: '#0EA5E9'
  },
  inProgress: {
    bg: '#EDE9FE',
    border: '#DDD6FE',
    text: '#7C3AED',
    badge: '#8B5CF6'
  },
  completed: {
    bg: '#DCFCE7',
    border: '#BBF7D0',
    text: '#16A34A',
    badge: '#10B981'
  },
  onHold: {
    bg: '#FFEDD5',
    border: '#FED7AA',
    text: '#EA580C',
    badge: '#F97316'
  },
  rejected: {
    bg: '#FEE2E2',
    border: '#FECACA',
    text: '#DC2626',
    badge: '#EF4444'
  },
  
  // Categories
  categories: {
    'PC Hardware': '#EC4899',
    'PC Software': '#8B5CF6',
    'Application Issues': '#6366F1',
    'Network': '#0EA5E9',
    'Electronics': '#F59E0B',
    'Plumbing': '#06B6D4',
    'Electrical': '#EAB308',
    'Other': '#64748B'
  }
};

export const getStatusStyle = (status) => {
  switch (status) {
    case 'Pending':
      return colors.pending;
    case 'Assigned':
      return colors.assigned;
    case 'In-Progress':
    case 'In Progress':
      return colors.inProgress;
    case 'Completed':
    case 'Resolved':
      return colors.completed;
    case 'On-Hold':
    case 'On Hold':
      return colors.onHold;
    default:
      return colors.pending;
  }
};
