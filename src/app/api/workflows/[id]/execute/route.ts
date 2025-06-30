// src/app/api/workflows/[id]/execute/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Get the current user session
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email) {
      return NextResponse.json(
        {
          success: false,
          error: 'Unauthorized',
          code: 'UNAUTHORIZED'
        },
        { status: 401 }
      );
    }

    // Find the user in the database
    const user = await prisma.user.findUnique({
      where: { email: session.user.email }
    });

    if (!user) {
      return NextResponse.json(
        {
          success: false,
          error: 'User not found',
          code: 'USER_NOT_FOUND'
        },
        { status: 404 }
      );
    }

    const workflowId = params.id;
    const body = await request.json();
    const { inputData = {}, testMode = false } = body;

    // Check if workflow exists and user owns it
    const workflow = await prisma.workflow.findFirst({
      where: {
        id: workflowId,
        userId: user.id
      }
    });

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

    // Check if workflow is in error state
    if (workflow.status === 'error' && !testMode) {
      return NextResponse.json(
        {
          success: false,
          error: 'Cannot execute workflow in error state. Please fix the issues first.',
          code: 'WORKFLOW_ERROR_STATE'
        },
        { status: 400 }
      );
    }

    // Create execution record
    const execution = await prisma.execution.create({
      data: {
        workflowId,
        status: 'running',
        startedAt: new Date(),
        triggeredBy: testMode ? 'manual_test' : 'manual',
        inputData,
        testMode,
        stepsCompleted: 0,
        totalSteps: workflow.nodes ? (Array.isArray(workflow.nodes) ? workflow.nodes.length : 0) : 1
      }
    });

    // Simulate workflow execution steps
    const nodes = workflow.nodes ? JSON.parse(JSON.stringify(workflow.nodes)) : [];
    const steps = [];
    const logs = [
      {
        timestamp: new Date().toISOString(),
        level: 'info',
        message: `Workflow execution started (${testMode ? 'test mode' : 'live mode'})`,
        nodeId: null
      }
    ];

    let currentTime = Date.now();

    // Process each node
    for (let i = 0; i < nodes.length; i++) {
      const node = nodes[i];
      const stepStartTime = new Date(currentTime + i * 1000);
      
      // Simulate node processing time
      const processingTime = Math.random() * 2000 + 500; // 500ms to 2.5s
      const stepEndTime = new Date(stepStartTime.getTime() + processingTime);

      const step = {
        nodeId: node.id || `node-${i}`,
        nodeName: node.data?.label || `Step ${i + 1}`,
        status: 'completed',
        startedAt: stepStartTime.toISOString(),
        completedAt: stepEndTime.toISOString(),
        duration: processingTime,
        inputData: i === 0 ? inputData : { processed: true },
        outputData: { 
          success: true, 
          nodeType: node.data?.type || 'unknown',
          timestamp: stepEndTime.toISOString()
        }
      };

      steps.push(step);

      logs.push({
        timestamp: stepStartTime.toISOString(),
        level: 'info',
        message: `Processing ${step.nodeName}`,
        nodeId: step.nodeId
      });

      logs.push({
        timestamp: stepEndTime.toISOString(),
        level: 'info',
        message: `Completed ${step.nodeName}`,
        nodeId: step.nodeId
      });

      currentTime = stepEndTime.getTime();
    }

    const totalDuration = currentTime - Date.now();
    const completedAt = new Date(currentTime);

    // Update execution with results
    const updatedExecution = await prisma.execution.update({
      where: { id: execution.id },
      data: {
        status: 'success',
        completedAt,
        duration: totalDuration,
        steps,
        logs,
        outputData: { 
          success: true, 
          stepsCompleted: steps.length,
          executionTime: totalDuration 
        },
        stepsCompleted: steps.length
      }
    });

    // Update workflow stats if not in test mode
    if (!testMode) {
      const currentRuns = workflow.runs + 1;
      const currentSuccessCount = Math.round(workflow.successRate * workflow.runs / 100);
      const newSuccessCount = currentSuccessCount + 1;
      const newSuccessRate = (newSuccessCount / currentRuns) * 100;

      await prisma.workflow.update({
        where: { id: workflowId },
        data: {
          runs: currentRuns,
          successRate: newSuccessRate,
          lastModified: new Date()
        }
      });
    }

    // Transform execution result
    const executionResult = {
      id: updatedExecution.id,
      workflowId,
      status: updatedExecution.status,
      startedAt: updatedExecution.startedAt.toISOString(),
      completedAt: updatedExecution.completedAt?.toISOString() || null,
      duration: updatedExecution.duration,
      testMode: updatedExecution.testMode,
      inputData: updatedExecution.inputData ? JSON.parse(JSON.stringify(updatedExecution.inputData)) : null,
      outputData: updatedExecution.outputData ? JSON.parse(JSON.stringify(updatedExecution.outputData)) : null,
      steps: updatedExecution.steps ? JSON.parse(JSON.stringify(updatedExecution.steps)) : [],
      logs: updatedExecution.logs ? JSON.parse(JSON.stringify(updatedExecution.logs)) : []
    };

    return NextResponse.json({
      success: true,
      data: executionResult,
      message: testMode ? 'Test execution completed successfully' : 'Workflow execution completed successfully'
    });

  } catch (error) {
    console.error('Error executing workflow:', error);

    // If we have an execution ID, update it with error status
    const workflowId = params.id;
    try {
      // Find the most recent running execution for this workflow
      const runningExecution = await prisma.execution.findFirst({
        where: {
          workflowId,
          status: 'running'
        },
        orderBy: {
          startedAt: 'desc'
        }
      });

      if (runningExecution) {
        await prisma.execution.update({
          where: { id: runningExecution.id },
          data: {
            status: 'failed',
            completedAt: new Date(),
            error: {
              message: error instanceof Error ? error.message : 'Unknown error',
              code: 'EXECUTION_FAILED',
              timestamp: new Date().toISOString()
            }
          }
        });
      }
    } catch (updateError) {
      console.error('Error updating execution status:', updateError);
    }

    return NextResponse.json(
      {
        success: false,
        error: 'Workflow execution failed',
        code: 'EXECUTION_ERROR',
        details: {
          message: error instanceof Error ? error.message : 'Unknown error occurred'
        }
      },
      { status: 500 }
    );
  }
}