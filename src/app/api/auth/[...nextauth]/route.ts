import NextAuth from 'next-auth';
import { authOptions } from '@/lib/auth';

export async function GET(req: Request) {
  const handler = NextAuth(authOptions);
  return handler(req);
}

export async function POST(req: Request) {
  const handler = NextAuth(authOptions);
  return handler(req);
}