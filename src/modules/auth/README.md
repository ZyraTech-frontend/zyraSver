# Module 1: Authentication

## Overview
Handles user authentication, token management, and password reset functionality.

## Endpoints

### Public Routes (No Auth Required)
- `POST /api/auth/login` - User login
- `POST /api/auth/refresh` - Refresh access token
- `POST /api/auth/forgot-password` - Request password reset
- `POST /api/auth/reset-password` - Reset password with token

### Protected Routes (Auth Required)
- `GET /api/auth/me` - Get current user info
- `POST /api/auth/logout` - User logout

## File Structure

```
auth/
├── README.md               (this file)
├── routes.ts              (route definitions)
├── controller.ts          (request handlers)
├── service.ts             (business logic)
├── types.ts               (TypeScript interfaces)
└── validators.ts          (input validation)
```

## How It Works

1. **Routes** (`routes.ts`) - Defines endpoints and applies middleware
2. **Controller** (`controller.ts`) - Handles HTTP requests
3. **Service** (`service.ts`) - Contains business logic (login, token generation, etc)
4. **Types** (`types.ts`) - TypeScript interfaces for type safety
5. **Validators** (`validators.ts`) - Validates request inputs

## Database Tables Used
- `users` - User accounts
- `sessions` - Active sessions/tokens
- `activityLogs` - Login/logout audit trail

## Security
- Passwords hashed with bcrypt (12 rounds)
- JWT tokens (15-min access, 7-day refresh)
- Rate limiting on login endpoint
- All auth actions logged to activity_logs

## Response Format (All Endpoints)
```json
{
  "success": true/false,
  "data": { ... },
  "message": "string",
  "meta": { "page": 1, "limit": 20, "total": 100, "totalPages": 5 }
}
```

## Next Steps
- Implement Module 2: User Management (admin user creation, KYC, etc)
- See ../users/README.md for user management endpoints
