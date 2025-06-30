'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Sidebar } from '@/components/dashboard/sidebar';
import { WorkflowCard } from '@/components/dashboard/workflow-card';
import { StatsCards } from '@/components/dashboard/stats-cards';
import { AuthGuard } from '@/components/auth/auth-guard';
import { Plus, Search, Filter, Grid3X3, List, MoreVertical, Loader2 } from 'lucide-react';
import { useRouter } from 'next/navigation';

interface Workflow {
  id: string;
  name: string;
  description: string;
  status: 'active' | 'inactive' | 'error';
  lastModified: string;
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
  version: string;
}

interface ApiResponse {
  success: boolean;
  data: {
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
  };
  error?: string;
}

export default function DashboardPage() {
  const { data: session } = useSession();
  const [workflows, setWorkflows] = useState<Workflow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [stats, setStats] = useState({
    total: 0,
    active: 0,
    inactive: 0,
    error: 0,
    totalRuns: 0,
    avgSuccessRate: 0
  });
  const [categories, setCategories] = useState<string[]>([]);
  const router = useRouter();

  // Fetch workflows from API
  const fetchWorkflows = async () => {
    try {
      setLoading(true);
      setError(null);

      const params = new URLSearchParams({
        search: searchQuery,
        status: statusFilter,
        category: categoryFilter,
        page: '1',
        limit: '50' // Get more workflows for better filtering
      });

      const response = await fetch(`/api/workflows?${params}`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch workflows');
      }

      const data: ApiResponse = await response.json();
      
      if (data.success) {
        setWorkflows(data.data.workflows);
        setStats(data.data.stats);
        setCategories(data.data.filters.categories);
      } else {
        throw new Error(data.error || 'Failed to fetch workflows');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
      console.error('Error fetching workflows:', err);
    } finally {
      setLoading(false);
    }
  };

  // Fetch workflows on component mount and when filters change
  useEffect(() => {
    if (session?.user) {
      fetchWorkflows();
    }
  }, [session, searchQuery, statusFilter, categoryFilter]);

  // Debounce search query
  useEffect(() => {
    const timer = setTimeout(() => {
      if (session?.user) {
        fetchWorkflows();
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  const filteredWorkflows = workflows.filter(workflow => {
    const matchesSearch = workflow.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         workflow.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'all' || workflow.status === statusFilter;
    const matchesCategory = categoryFilter === 'all' || workflow.category === categoryFilter;
    
    return matchesSearch && matchesStatus && matchesCategory;
  });

  if (!session) {
    return null; // AuthGuard will handle this
  }

  return (
    <AuthGuard>
      <div className="flex h-screen bg-gray-50">
        <Sidebar />
        
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Header */}
          <header className="bg-white border-b border-gray-200 px-6 py-4">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  Welcome back, {session.user?.name}!
                </h1>
                <p className="text-gray-600 mt-1">Manage and monitor your automation workflows</p>
              </div>
              <Button 
                onClick={() => router.push('/workflow/new')}
                className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
              >
                <Plus className="h-4 w-4 mr-2" />
                Create Workflow
              </Button>
            </div>
          </header>

          {/* Stats */}
          <div className="px-6 py-4">
            <StatsCards workflows={workflows} 
            // stats={stats} loading={loading} 
            />
          </div>

          {/* Filters and Search */}
          <div className="px-6 py-4 bg-white border-b border-gray-200">
            <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
              <div className="flex flex-col sm:flex-row gap-4 flex-1">
                <div className="relative flex-1 max-w-md">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="Search workflows..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                    disabled={loading}
                  />
                </div>
                
                <div className="flex gap-2">
                  <Select value={statusFilter} onValueChange={setStatusFilter} disabled={loading}>
                    <SelectTrigger className="w-32">
                      <SelectValue placeholder="Status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Status</SelectItem>
                      <SelectItem value="active">Active</SelectItem>
                      <SelectItem value="inactive">Inactive</SelectItem>
                      <SelectItem value="error">Error</SelectItem>
                    </SelectContent>
                  </Select>

                  <Select value={categoryFilter} onValueChange={setCategoryFilter} disabled={loading}>
                    <SelectTrigger className="w-40">
                      <SelectValue placeholder="Category" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Categories</SelectItem>
                      {categories.map(category => (
                        <SelectItem key={category} value={category}>{category}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <div className="flex bg-gray-100 rounded-lg p-1">
                  <Button
                    variant={viewMode === 'grid' ? 'default' : 'ghost'}
                    size="sm"
                    onClick={() => setViewMode('grid')}
                    className="px-3"
                    disabled={loading}
                  >
                    <Grid3X3 className="h-4 w-4" />
                  </Button>
                  <Button
                    variant={viewMode === 'list' ? 'default' : 'ghost'}
                    size="sm"
                    onClick={() => setViewMode('list')}
                    className="px-3"
                    disabled={loading}
                  >
                    <List className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
          </div>

          {/* Workflows Grid/List */}
          <div className="flex-1 overflow-auto p-6">
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
                <span className="ml-2 text-gray-600">Loading workflows...</span>
              </div>
            ) : error ? (
              <div className="text-center py-12">
                <div className="w-24 h-24 mx-auto mb-4 bg-red-100 rounded-full flex items-center justify-center">
                  <Search className="h-8 w-8 text-red-400" />
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">Error loading workflows</h3>
                <p className="text-gray-600 mb-6">{error}</p>
                <Button 
                  onClick={fetchWorkflows}
                  className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                >
                  Try Again
                </Button>
              </div>
            ) : filteredWorkflows.length === 0 ? (
              <div className="text-center py-12">
                <div className="w-24 h-24 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
                  <Search className="h-8 w-8 text-gray-400" />
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  {workflows.length === 0 ? 'No workflows yet' : 'No workflows found'}
                </h3>
                <p className="text-gray-600 mb-6">
                  {workflows.length === 0 
                    ? 'Get started by creating your first workflow'
                    : 'Try adjusting your search or filter criteria'
                  }
                </p>
                <Button 
                  onClick={() => router.push('/workflow/new')}
                  className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  {workflows.length === 0 ? 'Create Your First Workflow' : 'Create New Workflow'}
                </Button>
              </div>
            ) : (
              <div className={
                viewMode === 'grid' 
                  ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
                  : "space-y-4"
              }>
                {filteredWorkflows.map((workflow) => (
                  <WorkflowCard 
                    key={workflow.id} 
                    workflow={workflow} 
                    viewMode={viewMode}
                    // onUpdate={fetchWorkflows} // Refresh data after updates
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </AuthGuard>
  );
}