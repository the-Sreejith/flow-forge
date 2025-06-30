// src/app/api/workflows/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
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

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const search = searchParams.get('search') || '';
    const status = searchParams.get('status') || 'all';
    const category = searchParams.get('category') || 'all';
    const sortBy = searchParams.get('sortBy') || 'lastModified';
    const sortOrder = searchParams.get('sortOrder') || 'desc';

    // Build where clause for filtering
    const whereClause: any = {
      userId: user.id
    };

    // Search filter
    if (search) {
      whereClause.OR = [
        {
          name: {
            contains: search,
            mode: 'insensitive'
          }
        },
        {
          description: {
            contains: search,
            mode: 'insensitive'
          }
        },
        {
          tags: {
            hasSome: [search]
          }
        }
      ];
    }

    // Status filter
    if (status !== 'all') {
      whereClause.status = status;
    }

    // Category filter
    if (category !== 'all') {
      whereClause.category = category;
    }

    // Build order by clause
    const orderBy: any = {};
    switch (sortBy) {
      case 'name':
        orderBy.name = sortOrder;
        break;
      case 'runs':
        orderBy.runs = sortOrder;
        break;
      case 'successRate':
        orderBy.successRate = sortOrder;
        break;
      case 'lastModified':
      default:
        orderBy.lastModified = sortOrder;
        break;
    }

    // Get total count for pagination
    const totalCount = await prisma.workflow.count({
      where: whereClause
    });

    // Fetch workflows with pagination
    const workflows = await prisma.workflow.findMany({
      where: whereClause,
      orderBy,
      skip: (page - 1) * limit,
      take: limit,
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

    // Transform data to match the expected format
    const transformedWorkflows = workflows.map(workflow => ({
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
      lastError: workflow.lastError ? JSON.parse(JSON.stringify(workflow.lastError)) : null
    }));

    // Calculate stats for all user workflows
    const allUserWorkflows = await prisma.workflow.findMany({
      where: { userId: user.id },
      select: {
        status: true,
        runs: true,
        successRate: true
      }
    });

    const stats = {
      total: allUserWorkflows.length,
      active: allUserWorkflows.filter(w => w.status === 'active').length,
      inactive: allUserWorkflows.filter(w => w.status === 'inactive').length,
      error: allUserWorkflows.filter(w => w.status === 'error').length,
      totalRuns: allUserWorkflows.reduce((sum, w) => sum + w.runs, 0),
      avgSuccessRate: allUserWorkflows.length > 0 
        ? allUserWorkflows.reduce((sum, w) => sum + w.successRate, 0) / allUserWorkflows.length 
        : 0
    };

    // Get unique categories for filter options
    const categoriesResult = await prisma.workflow.findMany({
      where: { userId: user.id },
      select: { category: true },
      distinct: ['category']
    });

    const categories = categoriesResult.map(c => c.category);

    return NextResponse.json({
      success: true,
      data: {
        workflows: transformedWorkflows,
        pagination: {
          page,
          limit,
          total: totalCount,
          totalPages: Math.ceil(totalCount / limit),
          hasNext: page * limit < totalCount,
          hasPrev: page > 1
        },
        stats,
        filters: {
          categories,
          statuses: ['active', 'inactive', 'error']
        }
      }
    });

  } catch (error) {
    console.error('Error fetching workflows:', error);
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

    const body = await request.json();
    const { 
      name, 
      description, 
      category = 'General', 
      tags = [], 
      isPublic = false,
      nodes = [],
      edges = [],
      trigger = null,
      schedule = null
    } = body;

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

    // Validate name length
    if (name.length < 3) {
      return NextResponse.json(
        {
          success: false,
          error: 'Workflow name must be at least 3 characters',
          code: 'VALIDATION_ERROR'
        },
        { status: 400 }
      );
    }

    // Create new workflow in database
    const newWorkflow = await prisma.workflow.create({
      data: {
        name,
        description,
        category,
        tags,
        isPublic,
        nodes: nodes.length > 0 ? nodes : null,
        edges: edges.length > 0 ? edges : null,
        trigger,
        schedule,
        userId: user.id,
        status: 'inactive',
        runs: 0,
        successRate: 0,
        version: '1.0.0'
      },
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
      id: newWorkflow.id,
      name: newWorkflow.name,
      description: newWorkflow.description || '',
      status: newWorkflow.status,
      lastModified: newWorkflow.lastModified.toISOString(),
      createdAt: newWorkflow.createdAt.toISOString(),
      runs: newWorkflow.runs,
      successRate: newWorkflow.successRate,
      nodes: newWorkflow.nodes ? JSON.parse(JSON.stringify(newWorkflow.nodes)) : [],
      category: newWorkflow.category,
      tags: newWorkflow.tags,
      owner: {
        id: newWorkflow.user.id,
        name: newWorkflow.user.name || '',
        email: newWorkflow.user.email
      },
      trigger: newWorkflow.trigger ? JSON.parse(JSON.stringify(newWorkflow.trigger)) : null,
      schedule: newWorkflow.schedule ? JSON.parse(JSON.stringify(newWorkflow.schedule)) : null,
      isPublic: newWorkflow.isPublic,
      version: newWorkflow.version
    };

    return NextResponse.json(
      {
        success: true,
        data: transformedWorkflow,
        message: 'Workflow created successfully'
      },
      { status: 201 }
    );

  } catch (error) {
    console.error('Error creating workflow:', error);
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