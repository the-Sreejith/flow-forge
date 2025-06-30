// Mock Prisma Client
// This file now exports the mock database instead of the real Prisma client

import { mockDb } from './mock-db';

// Export the mock database as prisma
export const prisma = mockDb;

// For compatibility, also export as default
export default mockDb;