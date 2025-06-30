// Mock Database Implementation
// This replaces Prisma with in-memory data storage

import { formatDistanceToNow } from 'date-fns';

// Generate unique IDs
let idCounter = 1;
const generateId = () => `mock_${idCounter++}`;

// In-memory data storage
let mockUsers: any[] = [];
let mockWorkflows: any[] = [];
let mockExecutions: any[] = [];
let mockAccounts: any[] = [];
let mockSessions: any[] = [];
let mockVerificationTokens: any[] = [];

// Initialize with some sample data
const initializeSampleData = () => {
  // Sample user
  const sampleUser = {
    id: generateId(),
    name: 'John Doe',
    email: 'john@example.com',
    emailVerified: null,
    image: 'https://images.pexels.com/photos/614810/pexels-photo-614810.jpeg',
    password: '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj/hL.hl.hl.', // hashed 'password'
    role: 'user',
    subscription: 'free',
    createdAt: new Date(),
    updatedAt: new Date(),
  };
  mockUsers.push(sampleUser);

  // Sample workflows
  const sampleWorkflows = [
    {
      id: generateId(),
      name: 'Customer Onboarding',
      description: 'Automated workflow for new customer onboarding process',
      status: 'active',
      category: 'Customer Management',
      tags: ['onboarding', 'email', 'automation'],
      isPublic: false,
      nodes: [
        { id: '1', type: 'trigger', data: { label: 'New Customer' } },
        { id: '2', type: 'email', data: { label: 'Welcome Email' } },
        { id: '3', type: 'delay', data: { label: 'Wait 24 Hours' } },
        { id: '4', type: 'email', data: { label: 'Follow-up Email' } }
      ],
      edges: [
        { id: 'e1-2', source: '1', target: '2' },
        { id: 'e2-3', source: '2', target: '3' },
        { id: 'e3-4', source: '3', target: '4' }
      ],
      trigger: { type: 'webhook', url: '/webhook/customer' },
      schedule: null,
      version: '1.0.0',
      runs: 45,
      successRate: 96.8,
      lastError: null,
      createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // 7 days ago
      updatedAt: new Date(),
      lastModified: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
      userId: sampleUser.id,
    },
    {
      id: generateId(),
      name: 'Social Media Posting',
      description: 'Automatically post content to social media platforms',
      status: 'active',
      category: 'Marketing',
      tags: ['social', 'content', 'automation'],
      isPublic: false,
      nodes: [
        { id: '1', type: 'schedule', data: { label: 'Daily Trigger' } },
        { id: '2', type: 'content', data: { label: 'Generate Content' } },
        { id: '3', type: 'social', data: { label: 'Post to Twitter' } },
        { id: '4', type: 'social', data: { label: 'Post to LinkedIn' } }
      ],
      edges: [
        { id: 'e1-2', source: '1', target: '2' },
        { id: 'e2-3', source: '2', target: '3' },
        { id: 'e2-4', source: '2', target: '4' }
      ],
      trigger: null,
      schedule: { type: 'daily', time: '09:00' },
      version: '1.2.0',
      runs: 128,
      successRate: 94.5,
      lastError: null,
      createdAt: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000), // 14 days ago
      updatedAt: new Date(),
      lastModified: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000), // 1 day ago
      userId: sampleUser.id,
    },
    {
      id: generateId(),
      name: 'Lead Qualification',
      description: 'Qualify and score incoming leads automatically',
      status: 'error',
      category: 'Sales',
      tags: ['leads', 'scoring', 'crm'],
      isPublic: false,
      nodes: [
        { id: '1', type: 'webhook', data: { label: 'Lead Webhook' } },
        { id: '2', type: 'database', data: { label: 'Check Existing' } },
        { id: '3', type: 'function', data: { label: 'Score Lead' } },
        { id: '4', type: 'condition', data: { label: 'High Score?' } }
      ],
      edges: [
        { id: 'e1-2', source: '1', target: '2' },
        { id: 'e2-3', source: '2', target: '3' },
        { id: 'e3-4', source: '3', target: '4' }
      ],
      trigger: { type: 'webhook', url: '/webhook/lead' },
      schedule: null,
      version: '1.0.0',
      runs: 23,
      successRate: 78.3,
      lastError: {
        message: 'Database connection timeout',
        code: 'DB_TIMEOUT',
        timestamp: new Date().toISOString()
      },
      createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000), // 3 days ago
      updatedAt: new Date(),
      lastModified: new Date(Date.now() - 30 * 60 * 1000), // 30 minutes ago
      userId: sampleUser.id,
    },
    {
      id: generateId(),
      name: 'Invoice Processing',
      description: 'Process and validate incoming invoices',
      status: 'inactive',
      category: 'Finance',
      tags: ['invoice', 'processing', 'validation'],
      isPublic: false,
      nodes: [
        { id: '1', type: 'email', data: { label: 'Email Trigger' } },
        { id: '2', type: 'file', data: { label: 'Extract PDF' } },
        { id: '3', type: 'function', data: { label: 'Validate Data' } }
      ],
      edges: [
        { id: 'e1-2', source: '1', target: '2' },
        { id: 'e2-3', source: '2', target: '3' }
      ],
      trigger: { type: 'email', address: 'invoices@company.com' },
      schedule: null,
      version: '1.0.0',
      runs: 0,
      successRate: 0,
      lastError: null,
      createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000), // 1 day ago
      updatedAt: new Date(),
      lastModified: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000), // 1 day ago
      userId: sampleUser.id,
    },
    {
      id: generateId(),
      name: 'Data Backup',
      description: 'Automated daily backup of critical data',
      status: 'active',
      category: 'Operations',
      tags: ['backup', 'data', 'maintenance'],
      isPublic: false,
      nodes: [
        { id: '1', type: 'schedule', data: { label: 'Daily 2 AM' } },
        { id: '2', type: 'database', data: { label: 'Export Data' } },
        { id: '3', type: 'file', data: { label: 'Compress Files' } },
        { id: '4', type: 'storage', data: { label: 'Upload to Cloud' } }
      ],
      edges: [
        { id: 'e1-2', source: '1', target: '2' },
        { id: 'e2-3', source: '2', target: '3' },
        { id: 'e3-4', source: '3', target: '4' }
      ],
      trigger: null,
      schedule: { type: 'daily', time: '02:00' },
      version: '2.1.0',
      runs: 89,
      successRate: 98.9,
      lastError: null,
      createdAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // 30 days ago
      updatedAt: new Date(),
      lastModified: new Date(Date.now() - 6 * 60 * 60 * 1000), // 6 hours ago
      userId: sampleUser.id,
    }
  ];

  mockWorkflows.push(...sampleWorkflows);

  // Sample executions
  const sampleExecutions = [
    {
      id: generateId(),
      workflowId: sampleWorkflows[0].id,
      status: 'success',
      startedAt: new Date(Date.now() - 2 * 60 * 60 * 1000),
      completedAt: new Date(Date.now() - 2 * 60 * 60 * 1000 + 105000),
      duration: 105000,
      triggeredBy: 'webhook',
      inputData: { customerEmail: 'john@example.com', customerName: 'John Doe' },
      outputData: { emailsSent: 2, success: true },
      steps: [],
      logs: [],
      metrics: {},
      stepsCompleted: 4,
      totalSteps: 4,
      error: null,
      testMode: false,
    }
  ];

  mockExecutions.push(...sampleExecutions);
};

// Initialize sample data
initializeSampleData();

// Helper functions
const findById = (array: any[], id: string) => array.find(item => item.id === id);
const findByField = (array: any[], field: string, value: any) => array.find(item => item[field] === value);
const filterByField = (array: any[], field: string, value: any) => array.filter(item => item[field] === value);

// User operations
const userOperations = {
  findUnique: ({ where }: { where: any }) => {
    if (where.id) return findById(mockUsers, where.id);
    if (where.email) return findByField(mockUsers, 'email', where.email);
    return null;
  },

  findMany: ({ where = {}, orderBy = {}, skip = 0, take }: any = {}) => {
    let filtered = [...mockUsers];
    
    // Apply filters
    Object.entries(where).forEach(([key, value]) => {
      if (value !== undefined) {
        filtered = filtered.filter(item => item[key] === value);
      }
    });

    // Apply ordering
    if (orderBy && Object.keys(orderBy).length > 0) {
      const [field, direction] = Object.entries(orderBy)[0] as [string, 'asc' | 'desc'];
      filtered.sort((a, b) => {
        const aVal = a[field];
        const bVal = b[field];
        if (direction === 'desc') return bVal > aVal ? 1 : -1;
        return aVal > bVal ? 1 : -1;
      });
    }

    // Apply pagination
    if (skip) filtered = filtered.slice(skip);
    if (take) filtered = filtered.slice(0, take);

    return filtered;
  },

  create: ({ data, include }: { data: any; include?: any }) => {
    const newUser = {
      id: generateId(),
      ...data,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    mockUsers.push(newUser);
    
    // Handle includes
    if (include?.user) {
      return { ...newUser, user: newUser };
    }
    
    return newUser;
  },

  update: ({ where, data }: { where: any; data: any }) => {
    const index = mockUsers.findIndex(user => 
      where.id ? user.id === where.id : user.email === where.email
    );
    
    if (index === -1) throw new Error('User not found');
    
    mockUsers[index] = {
      ...mockUsers[index],
      ...data,
      updatedAt: new Date(),
    };
    
    return mockUsers[index];
  },

  delete: ({ where }: { where: any }) => {
    const index = mockUsers.findIndex(user => user.id === where.id);
    if (index === -1) throw new Error('User not found');
    
    const deleted = mockUsers[index];
    mockUsers.splice(index, 1);
    return deleted;
  },

  count: ({ where = {} }: { where?: any } = {}) => {
    let filtered = [...mockUsers];
    Object.entries(where).forEach(([key, value]) => {
      if (value !== undefined) {
        filtered = filtered.filter(item => item[key] === value);
      }
    });
    return filtered.length;
  },
};

// Workflow operations
const workflowOperations = {
  findUnique: ({ where }: { where: any }) => {
    return findById(mockWorkflows, where.id);
  },

  findFirst: ({ where, include }: { where: any; include?: any }) => {
    let workflow = null;
    
    if (where.id && where.userId) {
      workflow = mockWorkflows.find(w => w.id === where.id && w.userId === where.userId);
    } else if (where.id) {
      workflow = findById(mockWorkflows, where.id);
    }
    
    if (!workflow) return null;

    // Handle includes
    if (include?.user) {
      const user = findById(mockUsers, workflow.userId);
      workflow = { ...workflow, user };
    }
    
    if (include?.executions) {
      const executions = filterByField(mockExecutions, 'workflowId', workflow.id)
        .sort((a, b) => new Date(b.startedAt).getTime() - new Date(a.startedAt).getTime())
        .slice(0, include.executions.take || 10);
      workflow = { ...workflow, executions };
    }

    return workflow;
  },

  findMany: ({ where = {}, orderBy = {}, skip = 0, take, include }: any = {}) => {
    let filtered = [...mockWorkflows];
    
    // Apply filters
    Object.entries(where).forEach(([key, value]: [string, any]) => {
      if (value !== undefined) {
        if (key === 'OR' && Array.isArray(value)) {
          // Handle OR conditions for search
          filtered = filtered.filter(item => 
            value.some((condition: any) => 
              Object.entries(condition).some(([field, searchValue]: [string, any]) => {
                if (field === 'name' || field === 'description') {
                  return item[field]?.toLowerCase().includes(searchValue.contains?.toLowerCase() || '');
                }
                if (field === 'tags' && searchValue.hasSome) {
                  return item[field]?.some((tag: string) => 
                    searchValue.hasSome.some((searchTag: string) => 
                      tag.toLowerCase().includes(searchTag.toLowerCase())
                    )
                  );
                }
                return false;
              })
            )
          );
        } else {
          filtered = filtered.filter(item => item[key] === value);
        }
      }
    });

    // Apply ordering
    if (orderBy && Object.keys(orderBy).length > 0) {
      const [field, direction] = Object.entries(orderBy)[0] as [string, 'asc' | 'desc'];
      filtered.sort((a, b) => {
        let aVal = a[field];
        let bVal = b[field];
        
        // Handle date fields
        if (field.includes('At') || field.includes('Modified')) {
          aVal = new Date(aVal).getTime();
          bVal = new Date(bVal).getTime();
        }
        
        if (direction === 'desc') return bVal > aVal ? 1 : -1;
        return aVal > bVal ? 1 : -1;
      });
    }

    // Apply pagination
    if (skip) filtered = filtered.slice(skip);
    if (take) filtered = filtered.slice(0, take);

    // Handle includes
    if (include?.user) {
      filtered = filtered.map(workflow => {
        const user = findById(mockUsers, workflow.userId);
        return { ...workflow, user };
      });
    }

    return filtered;
  },

  create: ({ data, include }: { data: any; include?: any }) => {
    const newWorkflow = {
      id: generateId(),
      ...data,
      createdAt: new Date(),
      updatedAt: new Date(),
      lastModified: new Date(),
    };
    mockWorkflows.push(newWorkflow);
    
    // Handle includes
    if (include?.user) {
      const user = findById(mockUsers, newWorkflow.userId);
      return { ...newWorkflow, user };
    }
    
    return newWorkflow;
  },

  update: ({ where, data, include }: { where: any; data: any; include?: any }) => {
    const index = mockWorkflows.findIndex(workflow => workflow.id === where.id);
    if (index === -1) throw new Error('Workflow not found');
    
    mockWorkflows[index] = {
      ...mockWorkflows[index],
      ...data,
      updatedAt: new Date(),
      lastModified: new Date(),
    };
    
    const updated = mockWorkflows[index];
    
    // Handle includes
    if (include?.user) {
      const user = findById(mockUsers, updated.userId);
      return { ...updated, user };
    }
    
    return updated;
  },

  delete: ({ where }: { where: any }) => {
    const index = mockWorkflows.findIndex(workflow => workflow.id === where.id);
    if (index === -1) throw new Error('Workflow not found');
    
    const deleted = mockWorkflows[index];
    mockWorkflows.splice(index, 1);
    
    // Also delete related executions
    mockExecutions = mockExecutions.filter(exec => exec.workflowId !== deleted.id);
    
    return deleted;
  },

  count: ({ where = {} }: { where?: any } = {}) => {
    let filtered = [...mockWorkflows];
    Object.entries(where).forEach(([key, value]: [string, any]) => {
      if (value !== undefined) {
        if (key === 'OR' && Array.isArray(value)) {
          filtered = filtered.filter(item => 
            value.some((condition: any) => 
              Object.entries(condition).some(([field, searchValue]: [string, any]) => {
                if (field === 'name' || field === 'description') {
                  return item[field]?.toLowerCase().includes(searchValue.contains?.toLowerCase() || '');
                }
                return false;
              })
            )
          );
        } else {
          filtered = filtered.filter(item => item[key] === value);
        }
      }
    });
    return filtered.length;
  },
};

// Execution operations
const executionOperations = {
  findUnique: ({ where }: { where: any }) => {
    return findById(mockExecutions, where.id);
  },

  findFirst: ({ where, orderBy }: { where: any; orderBy?: any }) => {
    let filtered = [...mockExecutions];
    
    Object.entries(where).forEach(([key, value]) => {
      if (value !== undefined) {
        filtered = filtered.filter(item => item[key] === value);
      }
    });

    if (orderBy && Object.keys(orderBy).length > 0) {
      const [field, direction] = Object.entries(orderBy)[0] as [string, 'asc' | 'desc'];
      filtered.sort((a, b) => {
        let aVal = a[field];
        let bVal = b[field];
        
        if (field.includes('At')) {
          aVal = new Date(aVal).getTime();
          bVal = new Date(bVal).getTime();
        }
        
        if (direction === 'desc') return bVal > aVal ? 1 : -1;
        return aVal > bVal ? 1 : -1;
      });
    }

    return filtered[0] || null;
  },

  findMany: ({ where = {}, orderBy = {}, skip = 0, take }: any = {}) => {
    let filtered = [...mockExecutions];
    
    Object.entries(where).forEach(([key, value]) => {
      if (value !== undefined) {
        filtered = filtered.filter(item => item[key] === value);
      }
    });

    if (orderBy && Object.keys(orderBy).length > 0) {
      const [field, direction] = Object.entries(orderBy)[0] as [string, 'asc' | 'desc'];
      filtered.sort((a, b) => {
        let aVal = a[field];
        let bVal = b[field];
        
        if (field.includes('At')) {
          aVal = new Date(aVal).getTime();
          bVal = new Date(bVal).getTime();
        }
        
        if (direction === 'desc') return bVal > aVal ? 1 : -1;
        return aVal > bVal ? 1 : -1;
      });
    }

    if (skip) filtered = filtered.slice(skip);
    if (take) filtered = filtered.slice(0, take);

    return filtered;
  },

  create: ({ data }: { data: any }) => {
    const newExecution = {
      id: generateId(),
      ...data,
      startedAt: data.startedAt || new Date(),
    };
    mockExecutions.push(newExecution);
    return newExecution;
  },

  update: ({ where, data }: { where: any; data: any }) => {
    const index = mockExecutions.findIndex(execution => execution.id === where.id);
    if (index === -1) throw new Error('Execution not found');
    
    mockExecutions[index] = {
      ...mockExecutions[index],
      ...data,
    };
    
    return mockExecutions[index];
  },

  delete: ({ where }: { where: any }) => {
    const index = mockExecutions.findIndex(execution => execution.id === where.id);
    if (index === -1) throw new Error('Execution not found');
    
    const deleted = mockExecutions[index];
    mockExecutions.splice(index, 1);
    return deleted;
  },
};

// Account operations (for NextAuth)
const accountOperations = {
  findUnique: ({ where }: { where: any }) => {
    if (where.provider_providerAccountId) {
      return mockAccounts.find(acc => 
        acc.provider === where.provider_providerAccountId.provider &&
        acc.providerAccountId === where.provider_providerAccountId.providerAccountId
      );
    }
    return findById(mockAccounts, where.id);
  },

  create: ({ data }: { data: any }) => {
    const newAccount = {
      id: generateId(),
      ...data,
    };
    mockAccounts.push(newAccount);
    return newAccount;
  },

  delete: ({ where }: { where: any }) => {
    const index = mockAccounts.findIndex(account => account.id === where.id);
    if (index === -1) throw new Error('Account not found');
    
    const deleted = mockAccounts[index];
    mockAccounts.splice(index, 1);
    return deleted;
  },
};

// Session operations (for NextAuth)
const sessionOperations = {
  findUnique: ({ where }: { where: any }) => {
    if (where.sessionToken) return findByField(mockSessions, 'sessionToken', where.sessionToken);
    return findById(mockSessions, where.id);
  },

  create: ({ data }: { data: any }) => {
    const newSession = {
      id: generateId(),
      ...data,
    };
    mockSessions.push(newSession);
    return newSession;
  },

  update: ({ where, data }: { where: any; data: any }) => {
    const index = mockSessions.findIndex(session => 
      where.sessionToken ? session.sessionToken === where.sessionToken : session.id === where.id
    );
    
    if (index === -1) throw new Error('Session not found');
    
    mockSessions[index] = {
      ...mockSessions[index],
      ...data,
    };
    
    return mockSessions[index];
  },

  delete: ({ where }: { where: any }) => {
    const index = mockSessions.findIndex(session => 
      where.sessionToken ? session.sessionToken === where.sessionToken : session.id === where.id
    );
    
    if (index === -1) throw new Error('Session not found');
    
    const deleted = mockSessions[index];
    mockSessions.splice(index, 1);
    return deleted;
  },
};

// Verification token operations (for NextAuth)
const verificationTokenOperations = {
  findUnique: ({ where }: { where: any }) => {
    if (where.token) return findByField(mockVerificationTokens, 'token', where.token);
    if (where.identifier_token) {
      return mockVerificationTokens.find(token => 
        token.identifier === where.identifier_token.identifier &&
        token.token === where.identifier_token.token
      );
    }
    return null;
  },

  create: ({ data }: { data: any }) => {
    const newToken = {
      ...data,
    };
    mockVerificationTokens.push(newToken);
    return newToken;
  },

  delete: ({ where }: { where: any }) => {
    let index = -1;
    
    if (where.token) {
      index = mockVerificationTokens.findIndex(token => token.token === where.token);
    } else if (where.identifier_token) {
      index = mockVerificationTokens.findIndex(token => 
        token.identifier === where.identifier_token.identifier &&
        token.token === where.identifier_token.token
      );
    }
    
    if (index === -1) throw new Error('Verification token not found');
    
    const deleted = mockVerificationTokens[index];
    mockVerificationTokens.splice(index, 1);
    return deleted;
  },
};

// Export mock database
export const mockDb = {
  user: userOperations,
  workflow: workflowOperations,
  execution: executionOperations,
  account: accountOperations,
  session: sessionOperations,
  verificationToken: verificationTokenOperations,
  
  // Utility functions
  $disconnect: async () => {
    // Mock disconnect - do nothing
  },
  
  $connect: async () => {
    // Mock connect - do nothing
  },

  // Reset function for testing
  $reset: () => {
    mockUsers.length = 0;
    mockWorkflows.length = 0;
    mockExecutions.length = 0;
    mockAccounts.length = 0;
    mockSessions.length = 0;
    mockVerificationTokens.length = 0;
    idCounter = 1;
    initializeSampleData();
  },

  // Get current data (for debugging)
  $debug: () => ({
    users: mockUsers,
    workflows: mockWorkflows,
    executions: mockExecutions,
    accounts: mockAccounts,
    sessions: mockSessions,
    verificationTokens: mockVerificationTokens,
  }),
};