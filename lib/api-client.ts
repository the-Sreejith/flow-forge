// API Client utility for making requests to mock endpoints
export class ApiClient {
  private baseUrl: string;
  private token: string | null = null;

  constructor(baseUrl: string = '/api') {
    this.baseUrl = baseUrl;
    
    // Get token from localStorage if available
    if (typeof window !== 'undefined') {
      this.token = localStorage.getItem('auth-token');
    }
  }

  setToken(token: string) {
    this.token = token;
    if (typeof window !== 'undefined') {
      localStorage.setItem('auth-token', token);
    }
  }

  clearToken() {
    this.token = null;
    if (typeof window !== 'undefined') {
      localStorage.removeItem('auth-token');
    }
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    const url = `${this.baseUrl}${endpoint}`;
    
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      ...options.headers,
    };

    if (this.token) {
      headers.Authorization = `Bearer ${this.token}`;
    }

    const response = await fetch(url, {
      ...options,
      headers,
    });

    const data = await response.json();

    if (!response.ok) {
      throw new ApiError(data.error || 'Request failed', data.code, response.status);
    }

    return data;
  }

  // Auth endpoints
  async login(email: string, password: string) {
    return this.request<LoginResponse>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
  }

  async register(userData: RegisterData) {
    return this.request<LoginResponse>('/auth/register', {
      method: 'POST',
      body: JSON.stringify(userData),
    });
  }

  // Workflow endpoints
  async getWorkflows(params?: WorkflowQueryParams) {
    const searchParams = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          searchParams.append(key, value.toString());
        }
      });
    }
    
    const query = searchParams.toString();
    return this.request<WorkflowsResponse>(`/workflows${query ? `?${query}` : ''}`);
  }

  async getWorkflow(id: string) {
    return this.request<WorkflowDetailResponse>(`/workflows/${id}`);
  }

  async createWorkflow(workflowData: CreateWorkflowData) {
    return this.request<WorkflowResponse>('/workflows', {
      method: 'POST',
      body: JSON.stringify(workflowData),
    });
  }

  async updateWorkflow(id: string, workflowData: Partial<CreateWorkflowData>) {
    return this.request<WorkflowResponse>(`/workflows/${id}`, {
      method: 'PUT',
      body: JSON.stringify(workflowData),
    });
  }

  async deleteWorkflow(id: string) {
    return this.request<{ message: string }>(`/workflows/${id}`, {
      method: 'DELETE',
    });
  }

  async executeWorkflow(id: string, data?: { inputData?: any; testMode?: boolean }) {
    return this.request<ExecutionResponse>(`/workflows/${id}/execute`, {
      method: 'POST',
      body: JSON.stringify(data || {}),
    });
  }

  // Execution endpoints
  async getExecutions(params?: ExecutionQueryParams) {
    const searchParams = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          searchParams.append(key, value.toString());
        }
      });
    }
    
    const query = searchParams.toString();
    return this.request<ExecutionsResponse>(`/executions${query ? `?${query}` : ''}`);
  }

  async getExecution(id: string) {
    return this.request<ExecutionDetailResponse>(`/executions/${id}`);
  }

  async deleteExecution(id: string) {
    return this.request<{ message: string }>(`/executions/${id}`, {
      method: 'DELETE',
    });
  }

  // User endpoints
  async getUserProfile() {
    return this.request<UserProfileResponse>('/user/profile');
  }

  async updateUserProfile(profileData: Partial<UserProfile>) {
    return this.request<UserProfileResponse>('/user/profile', {
      method: 'PUT',
      body: JSON.stringify(profileData),
    });
  }
}

// Types
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  code?: string;
  message?: string;
}

export class ApiError extends Error {
  constructor(
    message: string,
    public code?: string,
    public status?: number
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

export interface LoginResponse {
  user: User;
  token: string;
  expiresIn: number;
}

export interface RegisterData {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
}

export interface User {
  id: string;
  email: string;
  name: string;
  avatar: string;
  role: string;
  subscription: string;
  createdAt: string;
  lastLogin: string;
}

export interface WorkflowQueryParams {
  page?: number;
  limit?: number;
  search?: string;
  status?: string;
  category?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface WorkflowsResponse {
  workflows: Workflow[];
  pagination: Pagination;
  stats: WorkflowStats;
  filters: {
    categories: string[];
    statuses: string[];
  };
}

export interface Workflow {
  id: string;
  name: string;
  description: string;
  status: 'active' | 'inactive' | 'error';
  lastModified: string;
  createdAt: string;
  runs: number;
  successRate: number;
  nodes: number;
  category: string;
  tags: string[];
  owner: {
    id: string;
    name: string;
    email: string;
  };
  trigger: any;
  schedule: any;
  isPublic: boolean;
  version: string;
  lastError?: {
    message: string;
    timestamp: string;
    code: string;
  };
}

export interface WorkflowDetailResponse extends Workflow {
  workflow: {
    nodes: any[];
    edges: any[];
  };
  executions: {
    recent: ExecutionSummary[];
  };
}

export interface CreateWorkflowData {
  name: string;
  description: string;
  category?: string;
  tags?: string[];
  isPublic?: boolean;
}

export interface WorkflowResponse extends Workflow {}

export interface ExecutionQueryParams {
  page?: number;
  limit?: number;
  status?: string;
  workflowId?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface ExecutionsResponse {
  executions: ExecutionSummary[];
  pagination: Pagination;
  stats: ExecutionStats;
}

export interface ExecutionSummary {
  id: string;
  workflowId: string;
  workflowName: string;
  status: 'success' | 'failed' | 'running' | 'cancelled';
  startedAt: string;
  completedAt: string | null;
  duration: number | null;
  triggeredBy: string;
  inputData: any;
  outputData: any;
  stepsCompleted: number;
  totalSteps: number;
  error?: {
    message: string;
    code: string;
    nodeId: string;
    nodeName: string;
  };
}

export interface ExecutionDetailResponse extends ExecutionSummary {
  steps: ExecutionStep[];
  logs: ExecutionLog[];
  metrics: ExecutionMetrics;
}

export interface ExecutionStep {
  id: string;
  nodeId: string;
  nodeName: string;
  status: 'success' | 'failed' | 'running' | 'skipped';
  startedAt: string;
  completedAt: string | null;
  duration: number | null;
  inputData: any;
  outputData: any;
  error?: {
    message: string;
    code: string;
  };
}

export interface ExecutionLog {
  id: string;
  timestamp: string;
  level: 'info' | 'warn' | 'error' | 'success';
  message: string;
  nodeId: string | null;
  data: any;
}

export interface ExecutionMetrics {
  totalNodes: number;
  successfulNodes: number;
  failedNodes: number;
  skippedNodes: number;
  retries: number;
  memoryUsage: string;
  cpuTime: string;
}

export interface ExecutionResponse {
  id: string;
  workflowId: string;
  status: string;
  startedAt: string;
  completedAt: string | null;
  duration: number | null;
  testMode: boolean;
  inputData: any;
  outputData: any;
  steps: ExecutionStep[];
  logs: ExecutionLog[];
}

export interface UserProfile {
  id: string;
  email: string;
  name: string;
  avatar: string;
  role: string;
  subscription: {
    plan: string;
    status: string;
    expiresAt: string;
    features: string[];
  };
  preferences: {
    theme: string;
    notifications: {
      email: boolean;
      browser: boolean;
      workflow_failures: boolean;
      workflow_success: boolean;
      weekly_reports: boolean;
    };
    timezone: string;
    dateFormat: string;
    language: string;
  };
  stats: {
    workflowsCreated: number;
    totalExecutions: number;
    successRate: number;
    joinedAt: string;
    lastLogin: string;
  };
  limits: {
    workflows: { used: number; limit: number };
    executions: { used: number; limit: number };
    storage: { used: string; limit: string };
  };
}

export interface UserProfileResponse extends UserProfile {}

export interface Pagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
}

export interface WorkflowStats {
  total: number;
  active: number;
  inactive: number;
  error: number;
  totalRuns: number;
  avgSuccessRate: number;
}

export interface ExecutionStats {
  total: number;
  success: number;
  failed: number;
  running: number;
  avgDuration: number;
}

// Create singleton instance
export const apiClient = new ApiClient();