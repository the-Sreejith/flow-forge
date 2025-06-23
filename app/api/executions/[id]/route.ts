import { NextRequest, NextResponse } from 'next/server';

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// Mock detailed execution data
const mockExecutionDetails = {
  'exec-001': {
    id: 'exec-001',
    workflowId: '1',
    workflowName: 'Customer Onboarding',
    status: 'success',
    startedAt: '2024-01-15T10:30:00Z',
    completedAt: '2024-01-15T10:31:45Z',
    duration: 105000,
    triggeredBy: 'webhook',
    inputData: { 
      customerEmail: 'john@example.com', 
      customerName: 'John Doe',
      signupSource: 'website'
    },
    outputData: { 
      emailsSent: 2, 
      success: true,
      welcomeEmailId: 'email_123',
      followupScheduled: true
    },
    steps: [
      {
        id: 'step-1',
        nodeId: 'trigger-1',
        nodeName: 'Webhook Trigger',
        status: 'success',
        startedAt: '2024-01-15T10:30:00Z',
        completedAt: '2024-01-15T10:30:02Z',
        duration: 2000,
        inputData: { customerEmail: 'john@example.com', customerName: 'John Doe' },
        outputData: { customerEmail: 'john@example.com', customerName: 'John Doe', timestamp: '2024-01-15T10:30:00Z' }
      },
      {
        id: 'step-2',
        nodeId: 'email-1',
        nodeName: 'Welcome Email',
        status: 'success',
        startedAt: '2024-01-15T10:30:02Z',
        completedAt: '2024-01-15T10:30:45Z',
        duration: 43000,
        inputData: { customerEmail: 'john@example.com', customerName: 'John Doe' },
        outputData: { emailSent: true, messageId: 'email_123' }
      },
      {
        id: 'step-3',
        nodeId: 'delay-1',
        nodeName: 'Wait 24 Hours',
        status: 'success',
        startedAt: '2024-01-15T10:30:45Z',
        completedAt: '2024-01-15T10:30:47Z',
        duration: 2000,
        inputData: {},
        outputData: { delayCompleted: true }
      },
      {
        id: 'step-4',
        nodeId: 'email-2',
        nodeName: 'Follow-up Email',
        status: 'success',
        startedAt: '2024-01-15T10:30:47Z',
        completedAt: '2024-01-15T10:31:45Z',
        duration: 58000,
        inputData: { customerEmail: 'john@example.com', customerName: 'John Doe' },
        outputData: { emailSent: true, messageId: 'email_124' }
      }
    ],
    logs: [
      {
        id: 'log-1',
        timestamp: '2024-01-15T10:30:00Z',
        level: 'info',
        message: 'Workflow execution started',
        nodeId: null,
        data: {}
      },
      {
        id: 'log-2',
        timestamp: '2024-01-15T10:30:00Z',
        level: 'info',
        message: 'Webhook trigger received',
        nodeId: 'trigger-1',
        data: { source: 'webhook', payload: { customerEmail: 'john@example.com' } }
      },
      {
        id: 'log-3',
        timestamp: '2024-01-15T10:30:02Z',
        level: 'info',
        message: 'Processing welcome email',
        nodeId: 'email-1',
        data: { recipient: 'john@example.com' }
      },
      {
        id: 'log-4',
        timestamp: '2024-01-15T10:30:45Z',
        level: 'success',
        message: 'Welcome email sent successfully',
        nodeId: 'email-1',
        data: { messageId: 'email_123' }
      },
      {
        id: 'log-5',
        timestamp: '2024-01-15T10:31:45Z',
        level: 'success',
        message: 'Workflow execution completed successfully',
        nodeId: null,
        data: { totalDuration: 105000 }
      }
    ],
    metrics: {
      totalNodes: 4,
      successfulNodes: 4,
      failedNodes: 0,
      skippedNodes: 0,
      retries: 0,
      memoryUsage: '45MB',
      cpuTime: '2.3s'
    }
  }
};

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await delay(Math.random() * 300 + 200);

    const executionId = params.id;
    const execution = mockExecutionDetails[executionId as keyof typeof mockExecutionDetails];

    if (!execution) {
      return NextResponse.json(
        {
          success: false,
          error: 'Execution not found',
          code: 'NOT_FOUND'
        },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: execution
    });

  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch execution details',
        code: 'FETCH_ERROR'
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

    const executionId = params.id;

    // Simulate execution not found
    if (executionId === 'nonexistent') {
      return NextResponse.json(
        {
          success: false,
          error: 'Execution not found',
          code: 'NOT_FOUND'
        },
        { status: 404 }
      );
    }

    // Simulate cannot delete running execution
    if (executionId === 'exec-004') {
      return NextResponse.json(
        {
          success: false,
          error: 'Cannot delete running execution',
          code: 'EXECUTION_RUNNING'
        },
        { status: 409 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Execution deleted successfully'
    });

  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to delete execution',
        code: 'DELETE_ERROR'
      },
      { status: 500 }
    );
  }
}