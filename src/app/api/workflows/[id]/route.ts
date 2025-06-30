// src/app/api/workflows/[id]/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET(
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

    // Fetch workflow with user ownership check
    const workflow = await prisma.workflow.findFirst({
      where: {
        id: workflowId,
        userId: user.id // Ensure user owns this workflow
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true
          }
        },
        executions: {
          orderBy: {
            startedAt: 'desc'
          },
          take: 10, // Get recent executions
          select: {
            id: true,
            status: true,
            startedAt: true,
            completedAt: true,
            duration: true,
            triggeredBy: true,
            error: true
          }
        }
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

    // Transform workflow data
    const transformedWorkflow = {
      id: workflow.id,
      name: workflow.name,
      description: workflow.description || '',
      status: workflow.status,
      lastModified: workflow.lastModified.toISOString(),
      createdAt: workflow.createdAt.toISOString(),
      runs: workflow.runs,
      successRate: workflow.successRate,
      nodes: workflow.nodes ? JSON.parse(JSON.stringify(workflow.nodes)) : [],
      category: workflow.category,
      tags: workflow.tags,
      owner: {
        id: workflow.user.id,
        name: workflow.user.name || '',
        email: workflow.user.email
      },
      trigger: workflow.trigger ? JSON.parse(JSON.stringify(workflow.trigger)) : null,
      schedule: workflow.schedule ? JSON.parse(JSON.stringify(workflow.schedule)) : null,
      isPublic: workflow.isPublic,
      version: workflow.version,
      lastError: workflow.lastError ? JSON.parse(JSON.stringify(workflow.lastError)) : null,
      workflow: {
        nodes: workflow.nodes ? JSON.parse(JSON.stringify(workflow.nodes)) : [],
        edges: workflow.edges ? JSON.parse(JSON.stringify(workflow.edges)) : []
      },
      executions: {
        recent: workflow.executions.map(exec => ({
          id: exec.id,
          status: exec.status,
          startedAt: exec.startedAt.toISOString(),
          completedAt: exec.completedAt?.toISOString() || null,
          duration: exec.duration,
          triggeredBy: exec.triggeredBy,
          error: exec.error ? JSON.parse(JSON.stringify(exec.error)) : null
        }))
      }
    };

    return NextResponse.json({
      success: true,
      data: transformedWorkflow
    });

  } catch (error) {
    console.error('Error fetching workflow:', error);
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

    // Check if workflow exists and user owns it
    const existingWorkflow = await prisma.workflow.findFirst({
      where: {
        id: workflowId,
        userId: user.id
      }
    });

    if (!existingWorkflow) {
      return NextResponse.json(
        {
          success: false,
          error: 'Workflow not found',
          code: 'NOT_FOUND'
        },
        { status: 404 }
      );
    }

    // Validate name if provided
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

    // Prepare update data
    const updateData: any = {
      lastModified: new Date()
    };

    // Only update fields that are provided
    if (body.name !== undefined) updateData.name = body.name;
    if (body.description !== undefined) updateData.description = body.description;
    if (body.category !== undefined) updateData.category = body.category;
    if (body.tags !== undefined) updateData.tags = body.tags;
    if (body.isPublic !== undefined) updateData.isPublic = body.isPublic;
    if (body.status !== undefined) updateData.status = body.status;
    if (body.nodes !== undefined) updateData.nodes = body.nodes;
    if (body.edges !== undefined) updateData.edges = body.edges;
    if (body.trigger !== undefined) updateData.trigger = body.trigger;
    if (body.schedule !== undefined) updateData.schedule = body.schedule;

    // Update workflow in database
    const updatedWorkflow = await prisma.workflow.update({
      where: { id: workflowId },
      data: updateData,
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      }
    });

    // Transform response data
    const transformedWorkflow = {
      id: updatedWorkflow.id,
      name: updatedWorkflow.name,
      description: updatedWorkflow.description || '',
      status: updatedWorkflow.status,
      lastModified: updatedWorkflow.lastModified.toISOString(),
      createdAt: updatedWorkflow.createdAt.toISOString(),
      runs: updatedWorkflow.runs,
      successRate: updatedWorkflow.successRate,
      nodes: updatedWorkflow.nodes ? JSON.parse(JSON.stringify(updatedWorkflow.nodes)) : [],
      category: updatedWorkflow.category,
      tags: updatedWorkflow.tags,
      owner: {
        id: updatedWorkflow.user.id,
        name: updatedWorkflow.user.name || '',
        email: updatedWorkflow.user.email
      },
      trigger: updatedWorkflow.trigger ? JSON.parse(JSON.stringify(updatedWorkflow.trigger)) : null,
      schedule: updatedWorkflow.schedule ? JSON.parse(JSON.stringify(updatedWorkflow.schedule)) : null,
      isPublic: updatedWorkflow.isPublic,
      version: updatedWorkflow.version
    };

    return NextResponse.json({
      success: true,
      data: transformedWorkflow,
      message: 'Workflow updated successfully'
    });

  } catch (error) {
    console.error('Error updating workflow:', error);
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

    // Check if workflow exists and user owns it
    const existingWorkflow = await prisma.workflow.findFirst({
      where: {
        id: workflowId,
        userId: user.id
      }
    });

    if (!existingWorkflow) {
      return NextResponse.json(
        {
          success: false,
          error: 'Workflow not found',
          code: 'NOT_FOUND'
        },
        { status: 404 }
      );
    }

    // Check if workflow is active - prevent deletion of active workflows
    if (existingWorkflow.status === 'active') {
      return NextResponse.json(
        {
          success: false,
          error: 'Cannot delete active workflow. Please deactivate first.',
          code: 'WORKFLOW_ACTIVE'
        },
        { status: 409 }
      );
    }

    // Delete the workflow (executions will be cascade deleted)
    await prisma.workflow.delete({
      where: { id: workflowId }
    });

    return NextResponse.json({
      success: true,
      message: 'Workflow deleted successfully'
    });

  } catch (error) {
    console.error('Error deleting workflow:', error);
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