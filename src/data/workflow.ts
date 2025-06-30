'use client';

import { useState, useEffect, useCallback } from 'react';
import { useSession } from 'next-auth/react';

// Types
export interface Workflow {
  id: string;
  name: string;
  description: string;
  status: 'active' | 'inactive' | 'error';
  lastModified: string;
  createdAt: string;
  runs: number;
  successRate: number;
  nodes: any[];
  edges: any[];
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

export interface CreateWorkflowData {
  name: string;
  description: string;
  category?: string;
  tags?: string[];
  isPublic?: boolean;
  nodes?: any[];
  edges?: any[];
  trigger?: any;
  schedule?: any;
}

export interface UpdateWorkflowData extends Partial<CreateWorkflowData> {
  status?: 'active' | 'inactive' | 'error';
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
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
  stats: {
    total: number;
    active: number;
    inactive: number;
    error: number;
    totalRuns: number;
    avgSuccessRate: number;
  };
  filters: {
    categories: string[];
    statuses: string[];
  };
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
  steps: any[];
  logs: any[];
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  code?: string;
  message?: string;
}

// API Functions
export const workflowApi = {
  // Get all workflows
  async getWorkflows(params?: WorkflowQueryParams): Promise<WorkflowsResponse> {
    const searchParams = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          searchParams.append(key, value.toString());
        }
      });
    }

    const response = await fetch(`/api/workflows?${searchParams.toString()}`);
    const result: ApiResponse<WorkflowsResponse> = await response.json();

    if (!result.success) {
      throw new Error(result.error || 'Failed to fetch workflows');
    }

    return result.data!;
  },

  // Get single workflow
  async getWorkflow(id: string): Promise<WorkflowDetailResponse> {
    const response = await fetch(`/api/workflows/${id}`);
    const result: ApiResponse<WorkflowDetailResponse> = await response.json();

    if (!result.success) {
      throw new Error(result.error || 'Failed to fetch workflow');
    }

    return result.data!;
  },

  // Create workflow
  async createWorkflow(data: CreateWorkflowData): Promise<Workflow> {
    const response = await fetch('/api/workflows', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    const result: ApiResponse<Workflow> = await response.json();

    if (!result.success) {
      throw new Error(result.error || 'Failed to create workflow');
    }

    return result.data!;
  },

  // Update workflow
  async updateWorkflow(id: string, data: UpdateWorkflowData): Promise<Workflow> {
    const response = await fetch(`/api/workflows/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    const result: ApiResponse<Workflow> = await response.json();

    if (!result.success) {
      throw new Error(result.error || 'Failed to update workflow');
    }

    return result.data!;
  },

  // Delete workflow
  async deleteWorkflow(id: string): Promise<void> {
    const response = await fetch(`/api/workflows/${id}`, {
      method: 'DELETE',
    });

    const result: ApiResponse<{ message: string }> = await response.json();

    if (!result.success) {
      throw new Error(result.error || 'Failed to delete workflow');
    }
  },

  // Execute workflow
  async executeWorkflow(
    id: string,
    options?: { inputData?: any; testMode?: boolean }
  ): Promise<ExecutionResponse> {
    const response = await fetch(`/api/workflows/${id}/execute`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(options || {}),
    });

    const result: ApiResponse<ExecutionResponse> = await response.json();

    if (!result.success) {
      throw new Error(result.error || 'Failed to execute workflow');
    }

    return result.data!;
  },
};

// Custom Hooks

/**
 * Hook for fetching and managing multiple workflows
 */
export function useWorkflows(params?: WorkflowQueryParams) {
  const { data: session } = useSession();
  const [data, setData] = useState<WorkflowsResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchWorkflows = useCallback(async () => {
    if (!session?.user) return;

    try {
      setLoading(true);
      setError(null);
      const result = await workflowApi.getWorkflows(params);
      setData(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch workflows');
    } finally {
      setLoading(false);
    }
  }, [session, params]);

  useEffect(() => {
    fetchWorkflows();
  }, [fetchWorkflows]);

  return {
    workflows: data?.workflows || [],
    pagination: data?.pagination,
    stats: data?.stats,
    filters: data?.filters,
    loading,
    error,
    refetch: fetchWorkflows,
  };
}

/**
 * Hook for fetching and managing a single workflow
 */
export function useWorkflow(id: string | null) {
  const { data: session } = useSession();
  const [workflow, setWorkflow] = useState<WorkflowDetailResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchWorkflow = useCallback(async () => {
    if (!session?.user || !id) return;

    try {
      setLoading(true);
      setError(null);
      const result = await workflowApi.getWorkflow(id);
      setWorkflow(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch workflow');
    } finally {
      setLoading(false);
    }
  }, [session, id]);

  useEffect(() => {
    fetchWorkflow();
  }, [fetchWorkflow]);

  return {
    workflow,
    loading,
    error,
    refetch: fetchWorkflow,
  };
}

/**
 * Hook for creating workflows
 */
export function useCreateWorkflow() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const createWorkflow = useCallback(async (data: CreateWorkflowData): Promise<Workflow> => {
    try {
      setLoading(true);
      setError(null);
      const result = await workflowApi.createWorkflow(data);
      return result;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to create workflow';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    createWorkflow,
    loading,
    error,
  };
}

/**
 * Hook for updating workflows
 */
export function useUpdateWorkflow() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const updateWorkflow = useCallback(
    async (id: string, data: UpdateWorkflowData): Promise<Workflow> => {
      try {
        setLoading(true);
        setError(null);
        const result = await workflowApi.updateWorkflow(id, data);
        return result;
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Failed to update workflow';
        setError(errorMessage);
        throw new Error(errorMessage);
      } finally {
        setLoading(false);
      }
    },
    []
  );

  return {
    updateWorkflow,
    loading,
    error,
  };
}

/**
 * Hook for deleting workflows
 */
export function useDeleteWorkflow() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const deleteWorkflow = useCallback(async (id: string): Promise<void> => {
    try {
      setLoading(true);
      setError(null);
      await workflowApi.deleteWorkflow(id);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to delete workflow';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    deleteWorkflow,
    loading,
    error,
  };
}

/**
 * Hook for executing workflows
 */
export function useExecuteWorkflow() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const executeWorkflow = useCallback(
    async (
      id: string,
      options?: { inputData?: any; testMode?: boolean }
    ): Promise<ExecutionResponse> => {
      try {
        setLoading(true);
        setError(null);
        const result = await workflowApi.executeWorkflow(id, options);
        return result;
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Failed to execute workflow';
        setError(errorMessage);
        throw new Error(errorMessage);
      } finally {
        setLoading(false);
      }
    },
    []
  );

  return {
    executeWorkflow,
    loading,
    error,
  };
}

/**
 * Hook for managing workflow operations (CRUD + Execute)
 */
export function useWorkflowOperations() {
  const { createWorkflow, loading: creating, error: createError } = useCreateWorkflow();
  const { updateWorkflow, loading: updating, error: updateError } = useUpdateWorkflow();
  const { deleteWorkflow, loading: deleting, error: deleteError } = useDeleteWorkflow();
  const { executeWorkflow, loading: executing, error: executeError } = useExecuteWorkflow();

  return {
    // Operations
    createWorkflow,
    updateWorkflow,
    deleteWorkflow,
    executeWorkflow,
    
    // Loading states
    loading: {
      creating,
      updating,
      deleting,
      executing,
    },
    
    // Error states
    errors: {
      create: createError,
      update: updateError,
      delete: deleteError,
      execute: executeError,
    },
    
    // Combined loading state
    isLoading: creating || updating || deleting || executing,
    
    // Combined error state
    hasError: !!(createError || updateError || deleteError || executeError),
  };
}

/**
 * Hook for workflow search and filtering
 */
export function useWorkflowSearch(initialParams?: WorkflowQueryParams) {
  const [params, setParams] = useState<WorkflowQueryParams>(initialParams || {});
  const { workflows, pagination, stats, filters, loading, error, refetch } = useWorkflows(params);

  const updateSearch = useCallback((search: string) => {
    setParams(prev => ({ ...prev, search, page: 1 }));
  }, []);

  const updateStatus = useCallback((status: string) => {
    setParams(prev => ({ ...prev, status, page: 1 }));
  }, []);

  const updateCategory = useCallback((category: string) => {
    setParams(prev => ({ ...prev, category, page: 1 }));
  }, []);

  const updateSort = useCallback((sortBy: string, sortOrder: 'asc' | 'desc' = 'desc') => {
    setParams(prev => ({ ...prev, sortBy, sortOrder, page: 1 }));
  }, []);

  const updatePage = useCallback((page: number) => {
    setParams(prev => ({ ...prev, page }));
  }, []);

  const resetFilters = useCallback(() => {
    setParams({});
  }, []);

  return {
    // Data
    workflows,
    pagination,
    stats,
    filters,
    loading,
    error,
    
    // Current params
    params,
    
    // Actions
    updateSearch,
    updateStatus,
    updateCategory,
    updateSort,
    updatePage,
    resetFilters,
    refetch,
  };
}

/**
 * Hook for workflow statistics
 */
export function useWorkflowStats() {
  const { stats, loading, error } = useWorkflows({ limit: 1 }); // Minimal fetch for stats only

  return {
    stats: stats || {
      total: 0,
      active: 0,
      inactive: 0,
      error: 0,
      totalRuns: 0,
      avgSuccessRate: 0,
    },
    loading,
    error,
  };
}

// Utility functions for workflow operations
export const workflowUtils = {
  /**
   * Get workflow status color
   */
  getStatusColor: (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'inactive':
        return 'bg-gray-100 text-gray-800 border-gray-200';
      case 'error':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  },

  /**
   * Format workflow last modified date
   */
  formatLastModified: (date: string) => {
    const now = new Date();
    const modified = new Date(date);
    const diffInHours = Math.floor((now.getTime() - modified.getTime()) / (1000 * 60 * 60));

    if (diffInHours < 1) return 'Just now';
    if (diffInHours < 24) return `${diffInHours}h ago`;
    if (diffInHours < 168) return `${Math.floor(diffInHours / 24)}d ago`;
    return modified.toLocaleDateString();
  },

  /**
   * Calculate success rate color
   */
  getSuccessRateColor: (rate: number) => {
    if (rate >= 95) return 'text-green-600';
    if (rate >= 80) return 'text-yellow-600';
    return 'text-red-600';
  },

  /**
   * Validate workflow data
   */
  validateWorkflowData: (data: CreateWorkflowData) => {
    const errors: string[] = [];

    if (!data.name || data.name.trim().length < 3) {
      errors.push('Workflow name must be at least 3 characters');
    }

    if (!data.description || data.description.trim().length < 10) {
      errors.push('Description must be at least 10 characters');
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  },

  /**
   * Generate workflow slug from name
   */
  generateSlug: (name: string) => {
    return name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');
  },
};