'use client';

import { useState } from 'react';
import { useSession } from '@/components/providers/session-provider';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Sidebar } from '@/components/dashboard/sidebar';
import { WorkflowCard } from '@/components/dashboard/workflow-card';
import { StatsCards } from '@/components/dashboard/stats-cards';
import { AuthGuard } from '@/components/auth/auth-guard';
import { Plus, Search, Grid3X3, List, Loader2, AlertCircle, RefreshCw } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useWorkflowSearch, useWorkflowOperations } from '@/data/workflow';
import { useToast } from '@/hooks/use-toast';

export default function DashboardPage() {
  const { data: session } = useSession();
  const router = useRouter();
  const { toast } = useToast();
  
  // Local state
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  
  // Workflow data and operations
  const {
    workflows,
    pagination,
    stats,
    filters,
    loading,
    error,
    params,
    updateSearch,
    updateStatus,
    updateCategory,
    updateSort,
    updatePage,
    resetFilters,
    refetch,
  } = useWorkflowSearch({
    page: 1,
    limit: 50,
    sortBy: 'lastModified',
    sortOrder: 'desc',
  });

  const {
    deleteWorkflow,
    executeWorkflow,
    updateWorkflow,
    loading: operationLoading,
    errors: operationErrors,
  } = useWorkflowOperations();

  // Handle workflow operations
  const handleDeleteWorkflow = async (workflowId: string, workflowName: string) => {
    try {
      await deleteWorkflow(workflowId);
      toast({
        title: 'Workflow Deleted',
        description: `"${workflowName}" has been deleted successfully.`,
      });
      refetch(); // Refresh the list
    } catch (error) {
      toast({
        title: 'Delete Failed',
        description: error instanceof Error ? error.message : 'Failed to delete workflow',
        variant: 'destructive',
      });
    }
  };

  const handleExecuteWorkflow = async (workflowId: string, workflowName: string, testMode = false) => {
    try {
      const result = await executeWorkflow(workflowId, { testMode });
      toast({
        title: testMode ? 'Test Execution Started' : 'Workflow Executed',
        description: `"${workflowName}" is ${testMode ? 'running in test mode' : 'executing'}.`,
      });
      refetch(); // Refresh to update run counts
      return result;
    } catch (error) {
      toast({
        title: 'Execution Failed',
        description: error instanceof Error ? error.message : 'Failed to execute workflow',
        variant: 'destructive',
      });
      throw error;
    }
  };

  const handleToggleWorkflowStatus = async (workflowId: string, currentStatus: string, workflowName: string) => {
    const newStatus = currentStatus === 'active' ? 'inactive' : 'active';
    
    try {
      await updateWorkflow(workflowId, { status: newStatus });
      toast({
        title: 'Status Updated',
        description: `"${workflowName}" is now ${newStatus}.`,
      });
      refetch(); // Refresh the list
    } catch (error) {
      toast({
        title: 'Update Failed',
        description: error instanceof Error ? error.message : 'Failed to update workflow status',
        variant: 'destructive',
      });
    }
  };

  const handleDuplicateWorkflow = async (workflow: any) => {
    // Navigate to create new workflow with pre-filled data
    router.push(`/workflow/new?duplicate=${workflow.id}`);
  };

  // Handle search with debouncing
  const handleSearchChange = (value: string) => {
    updateSearch(value);
  };

  // Handle retry on error
  const handleRetry = () => {
    refetch();
  };

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
            <StatsCards workflows={workflows} />
          </div>

          {/* Filters and Search */}
          <div className="px-6 py-4 bg-white border-b border-gray-200">
            <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
              <div className="flex flex-col sm:flex-row gap-4 flex-1">
                <div className="relative flex-1 max-w-md">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="Search workflows..."
                    value={params.search || ''}
                    onChange={(e) => handleSearchChange(e.target.value)}
                    className="pl-10"
                    disabled={loading}
                  />
                </div>
                
                <div className="flex gap-2">
                  <Select 
                    value={params.status || 'all'} 
                    onValueChange={updateStatus} 
                    disabled={loading}
                  >
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

                  <Select 
                    value={params.category || 'all'} 
                    onValueChange={updateCategory} 
                    disabled={loading}
                  >
                    <SelectTrigger className="w-40">
                      <SelectValue placeholder="Category" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Categories</SelectItem>
                      {filters?.categories?.map(category => (
                        <SelectItem key={category} value={category}>{category}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

                  {(params.search || params.status !== 'all' || params.category !== 'all') && (
                    <Button 
                      variant="outline" 
                      onClick={resetFilters}
                      disabled={loading}
                    >
                      Clear Filters
                    </Button>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleRetry}
                  disabled={loading}
                >
                  <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
                </Button>
                
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

          {/* Error Display */}
          {error && (
            <div className="px-6 py-4">
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription className="flex items-center justify-between">
                  <span>{error}</span>
                  <Button variant="outline" size="sm" onClick={handleRetry}>
                    Try Again
                  </Button>
                </AlertDescription>
              </Alert>
            </div>
          )}

          {/* Operation Errors */}
          {operationErrors.delete && (
            <div className="px-6 py-2">
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>Delete Error: {operationErrors.delete}</AlertDescription>
              </Alert>
            </div>
          )}

          {operationErrors.execute && (
            <div className="px-6 py-2">
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>Execution Error: {operationErrors.execute}</AlertDescription>
              </Alert>
            </div>
          )}

          {operationErrors.update && (
            <div className="px-6 py-2">
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>Update Error: {operationErrors.update}</AlertDescription>
              </Alert>
            </div>
          )}

          {/* Workflows Grid/List */}
          <div className="flex-1 overflow-auto p-6">
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
                <span className="ml-2 text-gray-600">Loading workflows...</span>
              </div>
            ) : workflows.length === 0 ? (
              <div className="text-center py-12">
                <div className="w-24 h-24 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
                  <Search className="h-8 w-8 text-gray-400" />
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  {params.search || params.status !== 'all' || params.category !== 'all'
                    ? 'No workflows found'
                    : 'No workflows yet'
                  }
                </h3>
                <p className="text-gray-600 mb-6">
                  {params.search || params.status !== 'all' || params.category !== 'all'
                    ? 'Try adjusting your search or filter criteria'
                    : 'Get started by creating your first workflow'
                  }
                </p>
                <div className="flex gap-3 justify-center">
                  {(params.search || params.status !== 'all' || params.category !== 'all') && (
                    <Button variant="outline" onClick={resetFilters}>
                      Clear Filters
                    </Button>
                  )}
                  <Button 
                    onClick={() => router.push('/workflow/new')}
                    className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    {workflows.length === 0 ? 'Create Your First Workflow' : 'Create New Workflow'}
                  </Button>
                </div>
              </div>
            ) : (
              <>
                <div className={
                  viewMode === 'grid' 
                    ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
                    : "space-y-4"
                }>
                  {workflows.map((workflow) => (
                    <WorkflowCard 
                      key={workflow.id} 
                      workflow={workflow} 
                      viewMode={viewMode}
                      onDelete={(id, name) => handleDeleteWorkflow(id, name)}
                      onExecute={(id, name, testMode) => handleExecuteWorkflow(id, name, testMode)}
                      onToggleStatus={(id, status, name) => handleToggleWorkflowStatus(id, status, name)}
                      onDuplicate={handleDuplicateWorkflow}
                      isLoading={operationLoading.deleting || operationLoading.executing || operationLoading.updating}
                    />
                  ))}
                </div>

                {/* Pagination */}
                {pagination && pagination.totalPages > 1 && (
                  <div className="flex items-center justify-between mt-8 pt-6 border-t border-gray-200">
                    <div className="text-sm text-gray-600">
                      Showing {((pagination.page - 1) * pagination.limit) + 1} to{' '}
                      {Math.min(pagination.page * pagination.limit, pagination.total)} of{' '}
                      {pagination.total} workflows
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => updatePage(pagination.page - 1)}
                        disabled={!pagination.hasPrev || loading}
                      >
                        Previous
                      </Button>
                      
                      <div className="flex items-center space-x-1">
                        {Array.from({ length: Math.min(5, pagination.totalPages) }, (_, i) => {
                          const page = i + 1;
                          return (
                            <Button
                              key={page}
                              variant={page === pagination.page ? 'default' : 'outline'}
                              size="sm"
                              onClick={() => updatePage(page)}
                              disabled={loading}
                              className="w-8 h-8 p-0"
                            >
                              {page}
                            </Button>
                          );
                        })}
                      </div>
                      
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => updatePage(pagination.page + 1)}
                        disabled={!pagination.hasNext || loading}
                      >
                        Next
                      </Button>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </AuthGuard>
  );
}