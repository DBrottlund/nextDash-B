// Application constants

export const APP_NAME = 'NextDash-B';
export const APP_DESCRIPTION = 'Modern SaaS Dashboard Boilerplate';

// API routes
export const API_ROUTES = {
  AUTH: {
    LOGIN: '/api/auth/login',
    REGISTER: '/api/auth/register',
    LOGOUT: '/api/auth/logout',
    ME: '/api/auth/me',
    REFRESH: '/api/auth/refresh',
    FORGOT_PASSWORD: '/api/auth/forgot-password',
    RESET_PASSWORD: '/api/auth/reset-password',
  },
  USERS: '/api/users',
  ROLES: '/api/roles',
  SETTINGS: '/api/settings',
  MENU: '/api/menu',
  ADMIN: {
    APP_SETTINGS: '/api/admin/app-settings',
    MENU_CONFIG: '/api/admin/menu-config',
  },
} as const;

// Page routes
export const ROUTES = {
  HOME: '/',
  LOGIN: '/login',
  REGISTER: '/register',
  DASHBOARD: '/dashboard',
  USERS: '/dashboard/users',
  ROLES: '/dashboard/roles',
  SETTINGS: '/dashboard/settings',
  ADMIN: {
    APP_SETTINGS: '/dashboard/admin/app-settings',
    MENU_CONFIG: '/dashboard/admin/menu-config',
  },
} as const;

// User roles
export const ROLES = {
  ADMIN: 1,
  MANAGER: 2,
  USER: 3,
  GUEST: 4,
} as const;

// Permissions
export const PERMISSIONS = {
  USERS: {
    CREATE: 'create',
    READ: 'read',
    UPDATE: 'update',
    DELETE: 'delete',
  },
  ROLES: {
    CREATE: 'create',
    READ: 'read',
    UPDATE: 'update',
    DELETE: 'delete',
  },
  SETTINGS: {
    READ: 'read',
    UPDATE: 'update',
  },
  ADMIN: {
    ACCESS: 'access',
  },
  DASHBOARD: {
    READ: 'read',
  },
} as const;

// Theme options
export const THEMES = {
  DEFAULT: 'default',
  BLUE: 'blue',
  GREEN: 'green',
  PURPLE: 'purple',
  ORANGE: 'orange',
} as const;

// Storage keys
export const STORAGE_KEYS = {
  AUTH_TOKEN: 'auth_token',
  REFRESH_TOKEN: 'refresh_token',
  USER: 'user',
  THEME: 'theme',
  DARK_MODE: 'dark_mode',
  SIDEBAR_COLLAPSED: 'sidebar_collapsed',
  GUEST_DATA: 'guest_data',
} as const;

// Default pagination
export const PAGINATION = {
  DEFAULT_PAGE: 1,
  DEFAULT_LIMIT: 10,
  MAX_LIMIT: 100,
} as const;

// File upload
export const FILE_UPLOAD = {
  MAX_SIZE: 5 * 1024 * 1024, // 5MB
  ALLOWED_TYPES: ['image/jpeg', 'image/png', 'image/gif', 'image/webp'],
  UPLOAD_DIR: '/uploads',
} as const;

// Rate limiting
export const RATE_LIMIT = {
  WINDOW_MS: 15 * 60 * 1000, // 15 minutes
  MAX_REQUESTS: 100,
  AUTH_MAX_REQUESTS: 5, // For auth endpoints
} as const;

// Session
export const SESSION = {
  COOKIE_NAME: 'session',
  MAX_AGE: 24 * 60 * 60 * 1000, // 24 hours
  REFRESH_THRESHOLD: 5 * 60 * 1000, // 5 minutes before expiry
} as const;

// Email templates
export const EMAIL_TEMPLATES = {
  WELCOME: 'welcome',
  PASSWORD_RESET: 'password-reset',
  EMAIL_VERIFICATION: 'email-verification',
} as const;

// HTTP status codes
export const HTTP_STATUS = {
  OK: 200,
  CREATED: 201,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  CONFLICT: 409,
  UNPROCESSABLE_ENTITY: 422,
  INTERNAL_SERVER_ERROR: 500,
} as const;

// Default app settings
export const DEFAULT_SETTINGS = {
  APP_NAME: 'NextDash-B',
  APP_DESCRIPTION: 'Modern SaaS Dashboard Boilerplate',
  APP_LOGO_URL: '/logo.png',
  APP_FAVICON_URL: '/favicon.ico',
  LANDING_MODE: 'login', // 'login' or 'marketing'
  THEME_DEFAULT: 'default',
  DARK_MODE_ENABLED: true,
  USER_REGISTRATION_ENABLED: true,
  GUEST_ACCESS_ENABLED: true,
  EMAIL_VERIFICATION_REQUIRED: false,
} as const;