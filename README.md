# FlowForge - Mock API Documentation

This document describes the mock API endpoints available in the FlowForge application for development and testing purposes.

## Overview

The mock API simulates a realistic backend with proper error handling, response delays (200-500ms), and comprehensive data structures. All endpoints return consistent JSON responses with appropriate HTTP status codes.

## Base URL

All API endpoints are prefixed with `/api`

## Authentication

Most endpoints require authentication via Bearer token in the Authorization header:
```
Authorization: Bearer <token>
```

## Response Format

All responses follow this structure:
```json
{
  "success": boolean,
  "data": any,
  "message": string,
  "error": string,
  "code": string
}
```

## Endpoints

### Authentication

#### POST /api/auth/login
Login with email and password.

**Request Body:**
```json
{
  "email": "john@example.com",
  "password": "password123"
}
```

**Success Response (200):**
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "1",
      "email": "john@example.com",
      "name": "John Doe",
      "avatar": "https://...",
      "role": "admin",
      "subscription": "pro"
    },
    "token": "mock_jwt_token_...",
    "expiresIn": 86400
  }
}
```

**Test Credentials:**
- john@example.com / password123
- jane@example.com / password456

#### POST /api/auth/register
Register a new user account.

**Request Body:**
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "password123",
  "confirmPassword": "password123"
}
```

**Edge Cases:**
- Email `demo@example.com` returns 409 (already exists)
- Mismatched passwords return 400
- Invalid email format returns 400

### Workflows

#### GET /api/workflows
Retrieve workflows with filtering, sorting, and pagination.

**Query Parameters:**
- `page` (number): Page number (default: 1)
- `limit` (number): Items per page (default: 10)
- `search` (string): Search in name, description, tags
- `status` (string): Filter by status (all, active, inactive, error)
- `category` (string): Filter by category
- `sortBy` (string): Sort field (name, runs, successRate, lastModified)
- `sortOrder` (string): Sort direction (asc, desc)

**Success Response (200):**
```json
{
  "success": true,
  "data": {
    "workflows": [...],
    "pagination": {
      "page": 1,
      "limit": 10,
      "total": 6,
      "totalPages": 1,
      "hasNext": false,
      "hasPrev": false
    },
    "stats": {
      "total": 6,
      "active": 4,
      "inactive": 1,
      "error": 1,
      "totalRuns": 3345,
      "avgSuccessRate": 95.98
    }
  }
}
```

#### GET /api/workflows/{id}
Get detailed workflow information including nodes and edges.

**Success Response (200):**
```json
{
  "success": true,
  "data": {
    "id": "1",
    "name": "Customer Onboarding",
    "workflow": {
      "nodes": [...],
      "edges": [...]
    },
    "executions": {
      "recent": [...]
    }
  }
}
```

#### POST /api/workflows
Create a new workflow.

**Request Body:**
```json
{
  "name": "My Workflow",
  "description": "Workflow description",
  "category": "Marketing",
  "tags": ["email", "automation"],
  "isPublic": false
}
```

#### PUT /api/workflows/{id}
Update an existing workflow.

#### DELETE /api/workflows/{id}
Delete a workflow.

**Edge Cases:**
- Cannot delete active workflows (returns 409)
- Non-existent workflows return 404

#### POST /api/workflows/{id}/execute
Execute a workflow manually.

**Request Body:**
```json
{
  "inputData": {
    "customerEmail": "test@example.com"
  },
  "testMode": true
}
```

**Edge Cases:**
- Workflow ID "5" simulates execution failure
- Test mode completes immediately

### Executions

#### GET /api/executions
Retrieve workflow execution history.

**Query Parameters:**
- `page`, `limit`: Pagination
- `status`: Filter by execution status
- `workflowId`: Filter by specific workflow
- `sortBy`, `sortOrder`: Sorting options

#### GET /api/executions/{id}
Get detailed execution information including steps and logs.

#### DELETE /api/executions/{id}
Delete an execution record.

**Edge Cases:**
- Cannot delete running executions (returns 409)

### User Profile

#### GET /api/user/profile
Get current user profile information.

**Requires Authentication**

#### PUT /api/user/profile
Update user profile.

**Request Body:**
```json
{
  "name": "Updated Name",
  "preferences": {
    "theme": "dark",
    "notifications": {
      "email": true,
      "workflow_failures": true
    }
  }
}
```

## Error Codes

Common error codes returned by the API:

- `MISSING_FIELDS`: Required fields are missing
- `INVALID_CREDENTIALS`: Login failed
- `EMAIL_EXISTS`: Email already registered
- `NOT_FOUND`: Resource not found
- `UNAUTHORIZED`: Authentication required
- `VALIDATION_ERROR`: Input validation failed
- `INTERNAL_ERROR`: Server error
- `FETCH_ERROR`: Failed to retrieve data
- `CREATE_ERROR`: Failed to create resource
- `UPDATE_ERROR`: Failed to update resource
- `DELETE_ERROR`: Failed to delete resource
- `EXECUTION_FAILED`: Workflow execution failed

## API Client Usage

Use the provided `ApiClient` class for making requests:

```typescript
import { apiClient } from '@/lib/api-client';

// Login
const response = await apiClient.login('john@example.com', 'password123');
apiClient.setToken(response.data.token);

// Get workflows
const workflows = await apiClient.getWorkflows({
  page: 1,
  limit: 10,
  status: 'active'
});

// Execute workflow
const execution = await apiClient.executeWorkflow('1', {
  inputData: { test: true },
  testMode: true
});
```

## Response Timing

All endpoints simulate realistic network delays:
- Authentication: 200-500ms
- Data retrieval: 200-500ms
- Data modification: 300-700ms
- Workflow execution: 300-800ms

This helps test loading states and user experience in development.