'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu';
import { 
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { 
  Play, 
  Pause, 
  Edit3, 
  Copy, 
  Trash2, 
  MoreHorizontal,
  Clock,
  TrendingUp,
  Activity,
  AlertCircle,
  CheckCircle,
  TestTube,
  Loader2
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { workflowUtils, type Workflow } from '@/data/workflow';

interface WorkflowCardProps {
  workflow: Workflow;
  viewMode: 'grid' | 'list';
  onDelete?: (id: string, name: string) => Promise<void>;
  onExecute?: (id: string, name: string, testMode?: boolean) => Promise<any>;
  onToggleStatus?: (id: string, currentStatus: string, name: string) => Promise<void>;
  onDuplicate?: (workflow: Workflow) => void;
  isLoading?: boolean;
}

export function WorkflowCard({ 
  workflow, 
  viewMode, 
  onDelete,
  onExecute,
  onToggleStatus,
  onDuplicate,
  isLoading = false
}: WorkflowCardProps) {
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const router = useRouter();

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active':
        return <CheckCircle className="h-3 w-3" />;
      case 'inactive':
        return <Pause className="h-3 w-3" />;
      case 'error':
        return <AlertCircle className="h-3 w-3" />;
      default:
        return null;
    }
  };

  const handleEdit = () => {
    router.push(`/workflow/${workflow.id}`);
  };

  const handleRun = async (testMode = false) => {
    if (!onExecute) return;
    
    try {
      setActionLoading(testMode ? 'test' : 'run');
      await onExecute(workflow.id, workflow.name, testMode);
    } catch (error) {
      // Error handling is done in parent component
    } finally {
      setActionLoading(null);
    }
  };

  const handleToggleStatus = async () => {
    if (!onToggleStatus) return;
    
    try {
      setActionLoading('toggle');
      await onToggleStatus(workflow.id, workflow.status, workflow.name);
    } catch (error) {
      // Error handling is done in parent component
    } finally {
      setActionLoading(null);
    }
  };

  const handleDuplicate = () => {
    if (onDuplicate) {
      onDuplicate(workflow);
    }
  };

  const handleDelete = async () => {
    if (!onDelete) return;
    
    try {
      setActionLoading('delete');
      await onDelete(workflow.id, workflow.name);
      setShowDeleteDialog(false);
    } catch (error) {
      // Error handling is done in parent component
    } finally {
      setActionLoading(null);
    }
  };

  const isActionLoading = (action: string) => {
    return actionLoading === action || isLoading;
  };

  if (viewMode === 'list') {
    return (
      <>
        <Card className="hover:shadow-md transition-shadow cursor-pointer">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4 flex-1">
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-2">
                    <h3 className="font-semibold text-gray-900">{workflow.name}</h3>
                    <Badge className={`${workflowUtils.getStatusColor(workflow.status)} text-xs px-2 py-1`}>
                      <div className="flex items-center space-x-1">
                        {getStatusIcon(workflow.status)}
                        <span className="capitalize">{workflow.status}</span>
                      </div>
                    </Badge>
                    <Badge variant="outline" className="text-xs">
                      {workflow.category}
                    </Badge>
                  </div>
                  <p className="text-sm text-gray-600 mb-2">{workflow.description}</p>
                  <div className="flex items-center space-x-4 text-xs text-gray-500">
                    <div className="flex items-center space-x-1">
                      <Clock className="h-3 w-3" />
                      <span>Modified {workflowUtils.formatLastModified(workflow.lastModified)}</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Activity className="h-3 w-3" />
                      <span>{workflow.runs} runs</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <TrendingUp className="h-3 w-3" />
                      <span className={workflowUtils.getSuccessRateColor(workflow.successRate)}>
                        {workflow.successRate}% success
                      </span>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="flex items-center space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleRun(true)}
                  disabled={isActionLoading('test')}
                >
                  {isActionLoading('test') ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <TestTube className="h-4 w-4 mr-1" />
                  )}
                  Test
                </Button>
                
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleRun(false)}
                  disabled={isActionLoading('run')}
                >
                  {isActionLoading('run') ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Play className="h-4 w-4 mr-1" />
                  )}
                  Run
                </Button>
                
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleEdit}
                >
                  <Edit3 className="h-4 w-4 mr-1" />
                  Edit
                </Button>
                
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="sm" disabled={isLoading}>
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={handleToggleStatus} disabled={isActionLoading('toggle')}>
                      {isActionLoading('toggle') ? (
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      ) : workflow.status === 'active' ? (
                        <Pause className="mr-2 h-4 w-4" />
                      ) : (
                        <Play className="mr-2 h-4 w-4" />
                      )}
                      {workflow.status === 'active' ? 'Deactivate' : 'Activate'}
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={handleDuplicate}>
                      <Copy className="mr-2 h-4 w-4" />
                      Duplicate
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem 
                      onClick={() => setShowDeleteDialog(true)}
                      className="text-red-600"
                      disabled={isActionLoading('delete')}
                    >
                      {isActionLoading('delete') ? (
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      ) : (
                        <Trash2 className="mr-2 h-4 w-4" />
                      )}
                      Delete
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
          </CardContent>
        </Card>

        <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Are you sure?</AlertDialogTitle>
              <AlertDialogDescription>
                This action cannot be undone. This will permanently delete the workflow "{workflow.name}" and all its execution history.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel disabled={isActionLoading('delete')}>Cancel</AlertDialogCancel>
              <AlertDialogAction 
                onClick={handleDelete} 
                className="bg-red-600 hover:bg-red-700"
                disabled={isActionLoading('delete')}
              >
                {isActionLoading('delete') ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Deleting...
                  </>
                ) : (
                  'Delete'
                )}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </>
    );
  }

  return (
    <>
      <Card className="hover:shadow-lg transition-all duration-200 cursor-pointer group">
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center space-x-2 mb-2">
                <Badge className={`${workflowUtils.getStatusColor(workflow.status)} text-xs px-2 py-1`}>
                  <div className="flex items-center space-x-1">
                    {getStatusIcon(workflow.status)}
                    <span className="capitalize">{workflow.status}</span>
                  </div>
                </Badge>
                <Badge variant="outline" className="text-xs">
                  {workflow.category}
                </Badge>
              </div>
              <CardTitle className="text-lg group-hover:text-blue-600 transition-colors">
                {workflow.name}
              </CardTitle>
              <CardDescription className="text-sm mt-1 line-clamp-2">
                {workflow.description}
              </CardDescription>
            </div>
            
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="opacity-0 group-hover:opacity-100 transition-opacity"
                  disabled={isLoading}
                >
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={handleEdit}>
                  <Edit3 className="mr-2 h-4 w-4" />
                  Edit
                </DropdownMenuItem>
                <DropdownMenuItem onClick={handleToggleStatus} disabled={isActionLoading('toggle')}>
                  {isActionLoading('toggle') ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : workflow.status === 'active' ? (
                    <Pause className="mr-2 h-4 w-4" />
                  ) : (
                    <Play className="mr-2 h-4 w-4" />
                  )}
                  {workflow.status === 'active' ? 'Deactivate' : 'Activate'}
                </DropdownMenuItem>
                <DropdownMenuItem onClick={handleDuplicate}>
                  <Copy className="mr-2 h-4 w-4" />
                  Duplicate
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem 
                  onClick={() => setShowDeleteDialog(true)}
                  className="text-red-600"
                  disabled={isActionLoading('delete')}
                >
                  {isActionLoading('delete') ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <Trash2 className="mr-2 h-4 w-4" />
                  )}
                  Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </CardHeader>
        
        <CardContent className="pt-0">
          <div className="grid grid-cols-2 gap-4 mb-4 text-sm">
            <div className="flex items-center space-x-2 text-gray-600">
              <Activity className="h-4 w-4" />
              <span>{workflow.runs} runs</span>
            </div>
            <div className="flex items-center space-x-2 text-gray-600">
              <TrendingUp className="h-4 w-4" />
              <span className={workflowUtils.getSuccessRateColor(workflow.successRate)}>
                {workflow.successRate}% success
              </span>
            </div>
          </div>
          
          <div className="flex items-center justify-between text-xs text-gray-500 mb-4">
            <div className="flex items-center space-x-1">
              <Clock className="h-3 w-3" />
              <span>Modified {workflowUtils.formatLastModified(workflow.lastModified)}</span>
            </div>
            <span>{workflow.nodes?.length || 0} nodes</span>
          </div>
          
          <div className="flex space-x-2">
            <Button
              variant="outline"
              size="sm"
              className="flex-1"
              onClick={() => handleRun(true)}
              disabled={isActionLoading('test')}
            >
              {isActionLoading('test') ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <TestTube className="h-4 w-4 mr-1" />
              )}
              Test
            </Button>
            <Button
              variant="default"
              size="sm"
              className="flex-1"
              onClick={() => handleRun(false)}
              disabled={isActionLoading('run')}
            >
              {isActionLoading('run') ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Play className="h-4 w-4 mr-1" />
              )}
              Run
            </Button>
          </div>
        </CardContent>
      </Card>

      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the workflow "{workflow.name}" and all its execution history.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isActionLoading('delete')}>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleDelete} 
              className="bg-red-600 hover:bg-red-700"
              disabled={isActionLoading('delete')}
            >
              {isActionLoading('delete') ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Deleting...
                </>
              ) : (
                'Delete'
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}