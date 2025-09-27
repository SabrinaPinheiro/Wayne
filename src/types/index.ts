// Tipos principais do sistema Wayne Industries

// Tipos de autenticação
export interface AuthError {
  message: string;
  status?: number;
}

export interface AuthResponse {
  error: AuthError | null;
  data?: any;
}

// Tipos de usuário e perfil
export interface UserProfile {
  id: string;
  email: string;
  full_name: string;
  avatar_url?: string;
  department?: string;
  role?: string;
  created_at: string;
  updated_at: string;
}

// Tipos de recursos
export interface Resource {
  id: string;
  name: string;
  type: 'vehicle' | 'equipment' | 'facility' | 'technology';
  status: 'available' | 'in_use' | 'maintenance' | 'retired';
  location?: string;
  assigned_to?: string;
  description?: string;
  created_at: string;
  updated_at: string;
}

// Tipos de logs de acesso
export interface AccessLog {
  id: string;
  user_id: string;
  action: string;
  resource_type?: string;
  resource_id?: string;
  ip_address?: string;
  user_agent?: string;
  created_at: string;
  profiles?: {
    full_name: string;
    email: string;
  };
}

// Tipos de configurações do usuário
export interface UserSettings {
  id?: string;
  user_id: string;
  theme: 'light' | 'dark' | 'system';
  language: 'pt' | 'en' | 'es';
  notifications_enabled: boolean;
  email_notifications: boolean;
  push_notifications: boolean;
  auto_export_enabled: boolean;
  dashboard_layout: DashboardLayout;
  report_preferences: ReportPreferences;
  created_at?: string;
  updated_at?: string;
}

export interface DashboardLayout {
  widgets: string[];
  layout: 'grid' | 'list';
  columns: number;
}

export interface ReportPreferences {
  default_format: 'pdf' | 'excel' | 'csv';
  include_charts: boolean;
  date_range: number; // dias
  auto_schedule: boolean;
}

// Tipos para gráficos
export interface ChartDataPoint {
  name: string;
  value: number;
  color?: string;
}

export interface PieChartLabelProps {
  cx: number;
  cy: number;
  midAngle: number;
  innerRadius: number;
  outerRadius: number;
  percent: number;
  index?: number;
}

// Tipos para relatórios
export interface ReportData {
  resources: Resource[];
  accessLogs: AccessLog[];
  profiles: UserProfile[];
  summary: {
    totalResources: number;
    activeUsers: number;
    recentActivities: number;
  };
}

export interface ExportData {
  profile: UserProfile;
  resources: Resource[];
  access_logs: AccessLog[];
  settings: UserSettings;
  export_date: string;
  export_type: 'gdpr' | 'backup';
}

// Tipos para atividades
export interface Activity {
  id: string;
  type: 'login' | 'resource_access' | 'profile_update' | 'system';
  description: string;
  user_id?: string;
  resource_id?: string;
  created_at: string;
  profiles?: {
    full_name: string;
    avatar_url?: string;
  };
}

// Tipos para notificações
export interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'warning' | 'error' | 'success';
  read: boolean;
  created_at: string;
  action_url?: string;
}

// Tipos para upload de arquivos
export interface UploadResponse {
  success: boolean;
  url?: string;
  error?: string;
}

// Tipos para estatísticas do dashboard
export interface DashboardStats {
  totalResources: number;
  availableResources: number;
  activeUsers: number;
  recentActivities: number;
  resourcesByType: Record<string, number>;
  resourcesByStatus: Record<string, number>;
}

// Tipos para formulários
export interface FormError {
  field: string;
  message: string;
}

export interface ValidationResult {
  isValid: boolean;
  errors: FormError[];
}

export interface FormState<T = any> {
  values: T;
  errors: Record<string, string>;
  touched: Record<string, boolean>;
  isSubmitting: boolean;
  isValid: boolean;
}

// Tipos para API responses
export interface ApiResponse<T = any> {
  data?: T;
  error?: AuthError;
  message?: string;
  status: number;
}

// Tipos para paginação
export interface PaginationParams {
  page: number;
  limit: number;
  offset?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface FilterParams {
  search?: string;
  status?: string;
  type?: string;
  dateFrom?: string;
  dateTo?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

// Tipos para filtros
export interface ResourceFilter {
  type?: string;
  status?: string;
  location?: string;
  assigned_to?: string;
  date_from?: string;
  date_to?: string;
}

export interface AccessLogFilter {
  user_id?: string;
  action?: string;
  resource_type?: string;
  date_from?: string;
  date_to?: string;
}