'use client';

import { useState } from 'react';
import { useSession } from 'next-auth/react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Sidebar } from '@/components/dashboard/sidebar';
import { WorkflowCard } from '@/components/dashboard/workflow-card';
import { StatsCards } from '@/components/dashboard/stats-cards';
import { AuthGuard } from '@/components/auth/auth-guard';
import { Plus, Search, Filter, Grid3X3, List, MoreVertical } from 'lucide-react';
import { useRouter } from 'next/navigation';

// Mock data
const mockWorkflows = [
  {
    id: '1',
    name: 'Customer Onboarding',
    description: 'Automated customer welcome email sequence',
    status: 'active' as const,
    lastModified: '2024-01-15T10:30:00Z',
    runs: 1250,
    successRate: 98.5,
    nodes: 8,
    category: 'Marketing'
  },
  {
    id: '2',
    name: 'Invoice Processing',
    description: 'Process and validate incoming invoices',
    status: 'inactive' as const,
    lastModified: '2024-01-14T16:45:00Z',
    runs: 450,
    successRate: 94.2,
    nodes: 12,
    category: 'Finance'
  },
  {
    id: '3',
    name: 'Social Media Posting',
    description: 'Cross-platform social media automation',
    status: 'active' as const,
    lastModified: '2024-01-16T09:15:00Z',
    runs: 890,
    successRate: 99.1,
    nodes: 6,
    category: 'Marketing'
  },
  {
    id: '4',
    name: 'Data Backup',
    description: 'Daily database backup and sync',
    status: 'active' as const,
    lastModified: '2024-01-13T22:00:00Z',
    runs: 365,
    successRate: 100,
    nodes: 4,
    category: 'Operations'
  },
  {
    id: '5',
    name: 'Lead Qualification',
    description: 'Score and route incoming leads',
    status: 'error' as const,
    lastModified: '2024-01-12T14:20:00Z',
    runs: 234,
    successRate: 87.3,
    nodes: 10,
    category: 'Sales'
  },
  {
    id: '6',
    name: 'Inventory Management',
    description: 'Track and reorder low stock items',
    status: 'active' as const,
    lastModified: '2024-01-11T11:30:00Z',
    runs: 156,
    successRate: 96.8,
    nodes: 15,
    category: 'Operations'
  }
];

export default function DashboardPage() {
  const { data: session } = useSession();
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const router = useRouter();

  const filteredWorkflows = mockWorkflows.filter(workflow => {
    const matchesSearch = workflow.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         workflow.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'all' || workflow.status === statusFilter;
    const matchesCategory = categoryFilter === 'all' || workflow.category === categoryFilter;
    
    return matchesSearch && matchesStatus && matchesCategory;
  });

  const categories = [...new Set(mockWorkflows.map(w => w.category))];

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
                  Welcome back, {session?.user?.name}!
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
            <StatsCards workflows={mockWorkflows} />
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
                  />
                </div>
                
                <div className="flex gap-2">
                  <Select value={statusFilter} onValueChange={setStatusFilter}>
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

                  <Select value={categoryFilter} onValueChange={setCategoryFilter}>
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
                  >
                    <Grid3X3 className="h-4 w-4" />
                  </Button>
                  <Button
                    variant={viewMode === 'list' ? 'default' : 'ghost'}
                    size="sm"
                    onClick={() => setViewMode('list')}
                    className="px-3"
                  >
                    <List className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
          </div>

          {/* Workflows Grid/List */}
          <div className="flex-1 overflow-auto p-6">
            {filteredWorkflows.length === 0 ? (
              <div className="text-center py-12">
                <div className="w-24 h-24 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
                  <Search className="h-8 w-8 text-gray-400" />
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">No workflows found</h3>
                <p className="text-gray-600 mb-6">Try adjusting your search or filter criteria</p>
                <Button 
                  onClick={() => router.push('/workflow/new')}
                  className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Create Your First Workflow
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