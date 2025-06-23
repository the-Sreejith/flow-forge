import { NextRequest, NextResponse } from 'next/server';

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// Mock workflows data
const mockWorkflows = [
  {
    id: '1',
    name: 'Customer Onboarding',
    description: 'Automated customer welcome email sequence with personalized content',
    status: 'active',
    lastModified: '2024-01-15T10:30:00Z',
    createdAt: '2024-01-01T00:00:00Z',
    runs: 1250,
    successRate: 98.5,
    nodes: 8,
    category: 'Marketing',
    tags: ['email', 'automation', 'onboarding'],
    owner: {
      id: '1',
      name: 'John Doe',
      email: 'john@example.com'
    },
    trigger: {
      type: 'webhook',
      config: {
        url: 'https://api.flowforge.com/webhooks/customer-signup'
      }
    },
    schedule: null,
    isPublic: false,
    version: '1.2.0'
  },
  {
    id: '2',
    name: 'Invoice Processing',
    description: 'Process and validate incoming invoices with automatic approval workflow',
    status: 'inactive',
    lastModified: '2024-01-14T16:45:00Z',
    createdAt: '2023-12-15T00:00:00Z',
    runs: 450,
    successRate: 94.2,
    nodes: 12,
    category: 'Finance',
    tags: ['invoice', 'approval', 'finance'],
    owner: {
      id: '1',
      name: 'John Doe',
      email: 'john@example.com'
    },
    trigger: {
      type: 'email',
      config: {
        email: 'invoices@company.com'
      }
    },
    schedule: null,
    isPublic: false,
    version: '2.1.0'
  },
  {
    id: '3',
    name: 'Social Media Posting',
    description: 'Cross-platform social media automation with content scheduling',
    status: 'active',
    lastModified: '2024-01-16T09:15:00Z',
    createdAt: '2024-01-10T00:00:00Z',
    runs: 890,
    successRate: 99.1,
    nodes: 6,
    category: 'Marketing',
    tags: ['social-media', 'scheduling', 'content'],
    owner: {
      id: '2',
      name: 'Jane Smith',
      email: 'jane@example.com'
    },
    trigger: {
      type: 'schedule',
      config: {
        cron: '0 9 * * 1-5'
      }
    },
    schedule: {
      enabled: true,
      cron: '0 9 * * 1-5',
      timezone: 'UTC'
    },
    isPublic: true,
    version: '1.0.0'
  },
  {
    id: '4',
    name: 'Data Backup',
    description: 'Daily database backup and sync to cloud storage',
    status: 'active',
    lastModified: '2024-01-13T22:00:00Z',
    createdAt: '2023-11-01T00:00:00Z',
    runs: 365,
    successRate: 100,
    nodes: 4,
    category: 'Operations',
    tags: ['backup', 'database', 'storage'],
    owner: {
      id: '1',
      name: 'John Doe',
      email: 'john@example.com'
    },
    trigger: {
      type: 'schedule',
      config: {
        cron: '0 2 * * *'
      }
    },
    schedule: {
      enabled: true,
      cron: '0 2 * * *',
      timezone: 'UTC'
    },
    isPublic: false,
    version: '1.5.0'
  },
  {
    id: '5',
    name: 'Lead Qualification',
    description: 'Score and route incoming leads based on predefined criteria',
    status: 'error',
    lastModified: '2024-01-12T14:20:00Z',
    createdAt: '2024-01-05T00:00:00Z',
    runs: 234,
    successRate: 87.3,
    nodes: 10,
    category: 'Sales',
    tags: ['leads', 'scoring', 'routing'],
    owner: {
      id: '2',
      name: 'Jane Smith',
      email: 'jane@example.com'
    },
    trigger: {
      type: 'webhook',
      config: {
        url: 'https://api.flowforge.com/webhooks/new-lead'
      }
    },
    schedule: null,
    isPublic: false,
    version: '1.1.0',
    lastError: {
      message: 'Database connection timeout',
      timestamp: '2024-01-12T14:20:00Z',
      code: 'DB_TIMEOUT'
    }
  },
  {
    id: '6',
    name: 'Inventory Management',
    description: 'Track and reorder low stock items automatically',
    status: 'active',
    lastModified: '2024-01-11T11:30:00Z',
    createdAt: '2023-12-01T00:00:00Z',
    runs: 156,
    successRate: 96.8,
    nodes: 15,
    category: 'Operations',
    tags: ['inventory', 'reorder', 'stock'],
    owner: {
      id: '1',
      name: 'John Doe',
      email: 'john@example.com'
    },
    trigger: {
      type: 'schedule',
      config: {
        cron: '0 */6 * * *'
      }
    },
    schedule: {
      enabled: true,
      cron: '0 */6 * * *',
      timezone: 'UTC'
    },
    isPublic: false,
    version: '2.0.0'
  }
];

export async function GET(request: NextRequest) {
  try {
    await delay(Math.random() * 300 + 200);

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const search = searchParams.get('search') || '';
    const status = searchParams.get('status') || 'all';
    const category = searchParams.get('category') || 'all';
    const sortBy = searchParams.get('sortBy') || 'lastModified';
    const sortOrder = searchParams.get('sortOrder') || 'desc';

    // Filter workflows
    let filteredWorkflows = mockWorkflows.filter(workflow => {
      const matchesSearch = search === '' || 
        workflow.name.toLowerCase().includes(search.toLowerCase()) ||
        workflow.description.toLowerCase().includes(search.toLowerCase()) ||
        workflow.tags.some(tag => tag.toLowerCase().includes(search.toLowerCase()));
      
      const matchesStatus = status === 'all' || workflow.status === status;
      const matchesCategory = category === 'all' || workflow.category === category;
      
      return matchesSearch && matchesStatus && matchesCategory;
    });

    // Sort workflows
    filteredWorkflows.sort((a, b) => {
      let aValue, bValue;
      
      switch (sortBy) {
        case 'name':
          aValue = a.name.toLowerCase();
          bValue = b.name.toLowerCase();
          break;
        case 'runs':
          aValue = a.runs;
          bValue = b.runs;
          break;
        case 'successRate':
          aValue = a.successRate;
          bValue = b.successRate;
          break;
        case 'lastModified':
        default:
          aValue = new Date(a.lastModified).getTime();
          bValue = new Date(b.lastModified).getTime();
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
    const paginatedWorkflows = filteredWorkflows.slice(startIndex, endIndex);

    // Calculate stats
    const stats = {
      total: mockWorkflows.length,
      active: mockWorkflows.filter(w => w.status === 'active').length,
      inactive: mockWorkflows.filter(w => w.status === 'inactive').length,
      error: mockWorkflows.filter(w => w.status === 'error').length,
      totalRuns: mockWorkflows.reduce((sum, w) => sum + w.runs, 0),
      avgSuccessRate: mockWorkflows.length > 0 
        ? mockWorkflows.reduce((sum, w) => sum + w.successRate, 0) / mockWorkflows.length 
        : 0
    };

    return NextResponse.json({
      success: true,
      data: {
        workflows: paginatedWorkflows,
        pagination: {
          page,
          limit,
          total: filteredWorkflows.length,
          totalPages: Math.ceil(filteredWorkflows.length / limit),
          hasNext: endIndex < filteredWorkflows.length,
          hasPrev: page > 1
        },
        stats,
        filters: {
          categories: [...new Set(mockWorkflows.map(w => w.category))],
          statuses: ['active', 'inactive', 'error']
        }
      }
    });

  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch workflows',
        code: 'FETCH_ERROR'
      },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    await delay(Math.random() * 400 + 300);

    const body = await request.json();
    const { name, description, category, tags = [], isPublic = false } = body;

    // Validate required fields
    if (!name || !description) {
      return NextResponse.json(
        {
          success: false,
          error: 'Name and description are required',
          code: 'MISSING_FIELDS'
        },
        { status: 400 }
      );
    }

    // Create new workflow
    const newWorkflow = {
      id: `workflow_${Date.now()}`,
      name,
      description,
      status: 'inactive',
      lastModified: new Date().toISOString(),
      createdAt: new Date().toISOString(),
      runs: 0,
      successRate: 0,
      nodes: 1, // Start with trigger node
      category: category || 'General',
      tags,
      owner: {
        id: '1',
        name: 'John Doe',
        email: 'john@example.com'
      },
      trigger: null,
      schedule: null,
      isPublic,
      version: '1.0.0'
    };

    return NextResponse.json(
      {
        success: true,
        data: newWorkflow,
        message: 'Workflow created successfully'
      },
      { status: 201 }
    );

  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to create workflow',
        code: 'CREATE_ERROR'
      },
      { status: 500 }
    );
  }
}