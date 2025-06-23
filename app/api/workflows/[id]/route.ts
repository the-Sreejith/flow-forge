import { NextRequest, NextResponse } from 'next/server';

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// Mock workflow detail with nodes and edges
const mockWorkflowDetails = {
  '1': {
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
    version: '1.2.0',
    workflow: {
      nodes: [
        {
          id: 'trigger-1',
          type: 'custom',
          position: { x: 250, y: 50 },
          data: {
            label: 'New Customer Signup',
            type: 'webhook',
            icon: 'Webhook',
            color: 'green',
            description: 'Triggered when new customer signs up',
            config: {
              url: 'https://api.flowforge.com/webhooks/customer-signup',
              method: 'POST'
            }
          }
        },
        {
          id: 'email-1',
          type: 'custom',
          position: { x: 250, y: 200 },
          data: {
            label: 'Welcome Email',
            type: 'email',
            icon: 'Mail',
            color: 'blue',
            description: 'Send welcome email to new customer',
            config: {
              to: '{{customer.email}}',
              subject: 'Welcome to FlowForge!',
              template: 'welcome-email'
            }
          }
        },
        {
          id: 'delay-1',
          type: 'custom',
          position: { x: 250, y: 350 },
          data: {
            label: 'Wait 24 Hours',
            type: 'delay',
            icon: 'Clock',
            color: 'yellow',
            description: 'Wait 24 hours before next step',
            config: {
              duration: 86400,
              unit: 'seconds'
            }
          }
        },
        {
          id: 'email-2',
          type: 'custom',
          position: { x: 250, y: 500 },
          data: {
            label: 'Follow-up Email',
            type: 'email',
            icon: 'Mail',
            color: 'blue',
            description: 'Send follow-up email with tips',
            config: {
              to: '{{customer.email}}',
              subject: 'Getting Started with FlowForge',
              template: 'getting-started-email'
            }
          }
        }
      ],
      edges: [
        {
          id: 'e1-2',
          source: 'trigger-1',
          target: 'email-1',
          type: 'smoothstep'
        },
        {
          id: 'e2-3',
          source: 'email-1',
          target: 'delay-1',
          type: 'smoothstep'
        },
        {
          id: 'e3-4',
          source: 'delay-1',
          target: 'email-2',
          type: 'smoothstep'
        }
      ]
    },
    executions: {
      recent: [
        {
          id: 'exec-1',
          status: 'success',
          startedAt: '2024-01-15T10:30:00Z',
          completedAt: '2024-01-15T10:31:45Z',
          duration: 105000,
          triggeredBy: 'webhook'
        },
        {
          id: 'exec-2',
          status: 'success',
          startedAt: '2024-01-15T09:15:00Z',
          completedAt: '2024-01-15T09:16:30Z',
          duration: 90000,
          triggeredBy: 'webhook'
        },
        {
          id: 'exec-3',
          status: 'failed',
          startedAt: '2024-01-15T08:00:00Z',
          completedAt: '2024-01-15T08:00:15Z',
          duration: 15000,
          triggeredBy: 'webhook',
          error: {
            message: 'Email service unavailable',
            code: 'EMAIL_SERVICE_ERROR'
          }
        }
      ]
    }
  }
};

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await delay(Math.random() * 300 + 200);

    const workflowId = params.id;
    const workflow = mockWorkflowDetails[workflowId as keyof typeof mockWorkflowDetails];

    if (!workflow) {
      return NextResponse.json(
        {
          success: false,
          error: 'Workflow not found',
          code: 'NOT_FOUND'
        },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: workflow
    });

  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch workflow',
        code: 'FETCH_ERROR'
      },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await delay(Math.random() * 400 + 300);

    const workflowId = params.id;
    const body = await request.json();

    // Simulate workflow not found
    if (workflowId === 'nonexistent') {
      return NextResponse.json(
        {
          success: false,
          error: 'Workflow not found',
          code: 'NOT_FOUND'
        },
        { status: 404 }
      );
    }

    // Simulate validation error
    if (body.name && body.name.length < 3) {
      return NextResponse.json(
        {
          success: false,
          error: 'Workflow name must be at least 3 characters',
          code: 'VALIDATION_ERROR'
        },
        { status: 400 }
      );
    }

    const updatedWorkflow = {
      id: workflowId,
      ...body,
      lastModified: new Date().toISOString(),
      version: '1.3.0'
    };

    return NextResponse.json({
      success: true,
      data: updatedWorkflow,
      message: 'Workflow updated successfully'
    });

  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to update workflow',
        code: 'UPDATE_ERROR'
      },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await delay(Math.random() * 200 + 100);

    const workflowId = params.id;

    // Simulate workflow not found
    if (workflowId === 'nonexistent') {
      return NextResponse.json(
        {
          success: false,
          error: 'Workflow not found',
          code: 'NOT_FOUND'
        },
        { status: 404 }
      );
    }

    // Simulate cannot delete active workflow
    if (workflowId === '1') {
      return NextResponse.json(
        {
          success: false,
          error: 'Cannot delete active workflow. Please deactivate first.',
          code: 'WORKFLOW_ACTIVE'
        },
        { status: 409 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Workflow deleted successfully'
    });

  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to delete workflow',
        code: 'DELETE_ERROR'
      },
      { status: 500 }
    );
  }
}