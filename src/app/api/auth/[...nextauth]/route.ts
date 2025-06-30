// Mock NextAuth API route
// This file is kept for compatibility but doesn't actually handle requests
// since we're using the mock authentication system

import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  return NextResponse.json({ 
    message: 'Using mock authentication system',
    redirect: '/auth/login'
  });
}

export async function POST(request: NextRequest) {
  return NextResponse.json({ 
    message: 'Using mock authentication system',
    redirect: '/auth/login'
  });
}