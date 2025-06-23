import { NextRequest, NextResponse } from 'next/server';

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await delay(Math.random() * 500 + 300);

    const workflowId = params.id;
    const body = await request.json();
    const { inputData = {}, testMode = false } = body;

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

    // Simulate workflow execution failure
    if (workflowId === '5') {
      return NextResponse.json(
        {
          success: false,
          error: 'Workflow execution failed',
          code: 'EXECUTION_FAILED',
          details: {
            nodeId: 'database-1',
            nodeName: 'Database Query',
            error: 'Connection timeout after 30 seconds'
          }
        },
        { status: 500 }
      );
    }

    // Generate execution ID
    const executionId = `exec_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    // Mock execution result
    const executionResult = {
      id: executionId,
      workflowId,
      status: 'running',
      startedAt: new Date().toISOString(),
      completedAt: null,
      duration: null,
      testMode,
      inputData,
      outputData: null,
      steps: [
        {
          nodeId: 'trigger-1',
          nodeName: 'Webhook Trigger',
          status: 'completed',
          startedAt: new Date().toISOString(),
          completedAt: new Date(Date.now() + 1000).toISOString(),
          duration: 1000,
          inputData: inputData,
          outputData: { ...inputData, timestamp: new Date().toISOString() }
        },
        {
          nodeId: 'email-1',
          nodeName: 'Send Email',
          status: 'running',
          startedAt: new Date(Date.now() + 1000).toISOString(),
          completedAt: null,
          duration: null,
          inputData: { ...inputData, timestamp: new Date().toISOString() },
          outputData: null
        }
      ],
      logs: [
        {
          timestamp: new Date().toISOString(),
          level: 'info',
          message: 'Workflow execution started',
          nodeId: null
        },
        {
          timestamp: new Date(Date.now() + 500).toISOString(),
          level: 'info',
          message: 'Webhook trigger activated',
          nodeId: 'trigger-1'
        },
        {
          timestamp: new Date(Date.now() + 1000).toISOString(),
          level: 'info',
          message: 'Processing email node',
          nodeId: 'email-1'
        }
      ]
    };

    // Simulate immediate completion for test mode
    if (testMode) {
      executionResult.status = 'success';
      executionResult.completedAt = new Date(Date.now() + 2000).toISOString();
      executionResult.duration = 2000;
      executionResult.steps[1].status = 'completed';
      executionResult.steps[1].completedAt = new Date(Date.now() + 2000).toISOString();
      executionResult.steps[1].duration = 1000;
      executionResult.steps[1].outputData = { emailSent: true, messageId: 'msg_123' };
      executionResult.outputData = { success: true, emailsSent: 1 };
    }

    return NextResponse.json({
      success: true,
      data: executionResult,
      message: testMode ? 'Test execution completed' : 'Workflow execution started'
    });

  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to execute workflow',
        code: 'EXECUTION_ERROR'
      },
      { status: 500 }
    );
  }
}