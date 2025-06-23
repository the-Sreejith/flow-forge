import { NextRequest, NextResponse } from 'next/server';

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// Mock user profile data
const mockUserProfile = {
  id: '1',
  email: 'john@example.com',
  name: 'John Doe',
  avatar: 'https://images.pexels.com/photos/614810/pexels-photo-614810.jpeg',
  role: 'admin',
  subscription: {
    plan: 'pro',
    status: 'active',
    expiresAt: '2024-12-31T23:59:59Z',
    features: [
      'unlimited_workflows',
      'advanced_integrations',
      'priority_support',
      'custom_nodes'
    ]
  },
  preferences: {
    theme: 'light',
    notifications: {
      email: true,
      browser: true,
      workflow_failures: true,
      workflow_success: false,
      weekly_reports: true
    },
    timezone: 'UTC',
    dateFormat: 'YYYY-MM-DD',
    language: 'en'
  },
  stats: {
    workflowsCreated: 15,
    totalExecutions: 3450,
    successRate: 96.8,
    joinedAt: '2023-06-15T00:00:00Z',
    lastLogin: '2024-01-15T10:30:00Z'
  },
  limits: {
    workflows: {
      used: 15,
      limit: -1 // -1 means unlimited
    },
    executions: {
      used: 3450,
      limit: -1
    },
    storage: {
      used: '2.3GB',
      limit: '100GB'
    }
  }
};

export async function GET(request: NextRequest) {
  try {
    await delay(Math.random() * 200 + 100);

    // Simulate authentication check
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        {
          success: false,
          error: 'Authentication required',
          code: 'UNAUTHORIZED'
        },
        { status: 401 }
      );
    }

    return NextResponse.json({
      success: true,
      data: mockUserProfile
    });

  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch user profile',
        code: 'FETCH_ERROR'
      },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    await delay(Math.random() * 300 + 200);

    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        {
          success: false,
          error: 'Authentication required',
          code: 'UNAUTHORIZED'
        },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { name, preferences } = body;

    // Validate name
    if (name && name.length < 2) {
      return NextResponse.json(
        {
          success: false,
          error: 'Name must be at least 2 characters',
          code: 'VALIDATION_ERROR'
        },
        { status: 400 }
      );
    }

    // Update profile
    const updatedProfile = {
      ...mockUserProfile,
      ...(name && { name }),
      ...(preferences && { preferences: { ...mockUserProfile.preferences, ...preferences } }),
      updatedAt: new Date().toISOString()
    };

    return NextResponse.json({
      success: true,
      data: updatedProfile,
      message: 'Profile updated successfully'
    });

  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to update profile',
        code: 'UPDATE_ERROR'
      },
      { status: 500 }
    );
  }
}