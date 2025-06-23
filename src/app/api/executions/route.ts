import { NextRequest, NextResponse } from 'next/server';

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// Mock executions data
const mockExecutions = [
  {
    id: 'exec-001',
    workflowId: '1',
    workflowName: 'Customer Onboarding',
    status: 'success',
    startedAt: '2024-01-15T10:30:00Z',
    completedAt: '2024-01-15T10:31:45Z',
    duration: 105000,
    triggeredBy: 'webhook',
    inputData: { customerEmail: 'john@example.com', customerName: 'John Doe' },
    outputData: { emailsSent: 2, success: true },
    stepsCompleted: 4,
    totalSteps: 4
  },
  {
    id: 'exec-002',
    workflowId: '3',
    workflowName: 'Social Media Posting',
    status: 'success',
    startedAt: '2024-01-15T09:00:00Z',
    completedAt: '2024-01-15T09:02:30Z',
    duration: 150000,
    triggeredBy: 'schedule',
    inputData: { content: 'Daily motivation post', platforms: ['twitter', 'linkedin'] },
    outputData: { postsCreated: 2, success: true },
    stepsCompleted: 6,
    totalSteps: 6
  },
  {
    id: 'exec-003',
    workflowId: '5',
    workflowName: 'Lead Qualification',
    status: 'failed',
    startedAt: '2024-01-15T08:00:00Z',
    completedAt: '2024-01-15T08:00:15Z',
    duration: 15000,
    triggeredBy: 'webhook',
    inputData: { leadEmail: 'lead@example.com', source: 'website' },
    outputData: null,
    stepsCompleted: 2,
    totalSteps: 10,
    error: {
      message: 'Database connection timeout',
      code: 'DB_TIMEOUT',
      nodeId: 'database-1',
      nodeName: 'Lead Scoring Query'
    }
  },
  {
    id: 'exec-004',
    workflowId: '2',
    workflowName: 'Invoice Processing',
    status: 'running',
    startedAt: '2024-01-15T11:45:00Z',
    completedAt: null,
    duration: null,
    triggeredBy: 'email',
    inputData: { invoiceId: 'INV-2024-001', amount: 1500.00 },
    outputData: null,
    stepsCompleted: 8,
    totalSteps: 12
  },
  {
    id: 'exec-005',
    workflowId: '4',
    workflowName: 'Data Backup',
    status: 'success',
    startedAt: '2024-01-15T02:00:00Z',
    completedAt: '2024-01-15T02:15:30Z',
    duration: 930000,
    triggeredBy: 'schedule',
    inputData: { backupType: 'full', databases: ['users', 'workflows', 'executions'] },
    outputData: { filesBackedUp: 1250, totalSize: '2.3GB', success: true },
    stepsCompleted: 4,
    totalSteps: 4
  }
];

export async function GET(request: NextRequest) {
  try {
    await delay(Math.random() * 300 + 200);

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const status = searchParams.get('status') || 'all';
    const workflowId = searchParams.get('workflowId');
    const sortBy = searchParams.get('sortBy') || 'startedAt';
    const sortOrder = searchParams.get('sortOrder') || 'desc';

    // Filter executions
    let filteredExecutions = mockExecutions.filter(execution => {
      const matchesStatus = status === 'all' || execution.status === status;
      const matchesWorkflow = !workflowId || execution.workflowId === workflowId;
      
      return matchesStatus && matchesWorkflow;
    });

    // Sort executions
    filteredExecutions.sort((a, b) => {
      let aValue, bValue;
      
      switch (sortBy) {
        case 'duration':
          aValue = a.duration || 0;
          bValue = b.duration || 0;
          break;
        case 'workflowName':
          aValue = a.workflowName.toLowerCase();
          bValue = b.workflowName.toLowerCase();
          break;
        case 'startedAt':
        default:
          aValue = new Date(a.startedAt).getTime();
          bValue = new Date(b.startedAt).getTime();
          break;
      }
      
      if (sortOrder === 'asc') {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });

    // Paginate
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    const paginatedExecutions = filteredExecutions.slice(startIndex, endIndex);

    // Calculate stats
    const stats = {
      total: filteredExecutions.length,
      success: filteredExecutions.filter(e => e.status === 'success').length,
      failed: filteredExecutions.filter(e => e.status === 'failed').length,
      running: filteredExecutions.filter(e => e.status === 'running').length,
      avgDuration: filteredExecutions
        .filter(e => e.duration)
        .reduce((sum, e, _, arr) => sum + (e.duration! / arr.length), 0)
        )
        )
    };

    return NextResponse.json({
      success: true,
      data: {
        executions: paginatedExecutions,
        pagination: {
          page,
          limit,
          total: filteredExecutions.length,
          totalPages: Math.ceil(filteredExecutions.length / limit),
          hasNext: endIndex < filteredExecutions.length,
          hasPrev: page > 1
        },
        stats
      }
    });

  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch executions',
        code: 'FETCH_ERROR'
      },
      { status: 500 }
    );
  }
}