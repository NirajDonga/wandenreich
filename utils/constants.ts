// Dashboard constants
export const DASHBOARD_SECTIONS = {
  OVERVIEW: 'overview',
  USERS: 'users',
  TASKS: 'tasks',
  FILES: 'files',
  SETTINGS: 'settings',
  ANALYTICS: 'analytics'
} as const;

// User role constants
export const USER_ROLES = {
  USER: 'user',
  ADMIN: 'admin'
} as const;

export const USER_ROLE_OPTIONS = [
  { value: USER_ROLES.USER, label: 'User' },
  { value: USER_ROLES.ADMIN, label: 'Admin' }
];

// User status constants
export const USER_STATUS = {
  ACTIVE: 'Active',
  PENDING: 'Pending',
  INACTIVE: 'Inactive'
} as const;

export const USER_STATUS_OPTIONS = [
  { value: USER_STATUS.ACTIVE, label: 'Active' },
  { value: USER_STATUS.PENDING, label: 'Pending' },
  { value: USER_STATUS.INACTIVE, label: 'Inactive' }
];

// Task status constants
export const TASK_STATUS = {
  TODO: 'To Do',
  IN_PROGRESS: 'In Progress',
  DONE: 'Done'
} as const;

export const TASK_STATUS_OPTIONS = [
  { value: TASK_STATUS.TODO, label: 'To Do' },
  { value: TASK_STATUS.IN_PROGRESS, label: 'In Progress' },
  { value: TASK_STATUS.DONE, label: 'Done' }
];

// Task priority constants
export const TASK_PRIORITY = {
  LOW: 'Low',
  MEDIUM: 'Medium',
  HIGH: 'High'
} as const;

export const TASK_PRIORITY_OPTIONS = [
  { value: TASK_PRIORITY.LOW, label: 'Low' },
  { value: TASK_PRIORITY.MEDIUM, label: 'Medium' },
  { value: TASK_PRIORITY.HIGH, label: 'High' }
];

// File type constants
export const FILE_TYPES = {
  DOCUMENT: 'document',
  SPREADSHEET: 'spreadsheet',
  IMAGE: 'image',
  VIDEO: 'video',
  AUDIO: 'audio',
  ARCHIVE: 'archive',
  CODE: 'code',
  TEXT: 'text',
  FILE: 'file',
  FOLDER: 'folder'
} as const;

// API endpoints
export const API_ENDPOINTS = {
  USERS: '/api/users',
  TASKS: '/api/tasks',
  FILES: '/api/files',
  AUTH: '/api/auth'
} as const;

// File size limits
export const FILE_SIZE_LIMITS = {
  MAX_FILE_SIZE: 10 * 1024 * 1024, // 10MB
  MAX_TOTAL_SIZE: 100 * 1024 * 1024 // 100MB
} as const;

// Pagination constants
export const PAGINATION = {
  DEFAULT_PAGE_SIZE: 10,
  PAGE_SIZE_OPTIONS: [10, 25, 50, 100]
} as const;

// Chart colors
export const CHART_COLORS = [
  '#3B82F6', // blue-500
  '#10B981', // emerald-500
  '#F59E0B', // amber-500
  '#EF4444', // red-500
  '#8B5CF6', // violet-500
  '#06B6D4', // cyan-500
  '#84CC16', // lime-500
  '#F97316', // orange-500
  '#EC4899', // pink-500
  '#6B7280'  // gray-500
] as const;

// Animation durations
export const ANIMATION_DURATION = {
  FAST: 150,
  NORMAL: 300,
  SLOW: 500
} as const;

// Z-index layers
export const Z_INDEX = {
  DROPDOWN: 1000,
  STICKY: 1020,
  FIXED: 1030,
  MODAL_BACKDROP: 1040,
  MODAL: 1050,
  POPOVER: 1060,
  TOOLTIP: 1070,
  TOAST: 1080
} as const;