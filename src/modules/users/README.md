# Module 2: User Management

## Overview
Handles user CRUD operations, role management, and user account administration.
**RESTRICTION:** All endpoints require Super Admin role.

## Endpoints (All Super Admin Only)

### User Management
- `GET /api/admin/users` - List all users (with pagination/filtering)
- `GET /api/admin/users/:id` - Get single user details
- `POST /api/admin/users` - Create new user
- `PUT /api/admin/users/:id` - Update user profile
- `PATCH /api/admin/users/:id/role` - Change user role
- `PATCH /api/admin/users/:id/suspend` - Suspend/activate user
- `DELETE /api/admin/users/:id` - Delete user

## File Structure

```
users/
├── README.md               (this file)
├── routes.ts              (route definitions)
├── controller.ts          (request handlers)
├── service.ts             (business logic)
├── types.ts               (TypeScript interfaces)
└── validators.ts          (input validation)
```

## How It Works

1. **Routes** (`routes.ts`) - Defines endpoints with auth/role middleware
2. **Controller** (`controller.ts`) - Handles HTTP requests, checks super_admin role
3. **Service** (`service.ts`) - Contains business logic (CRUD operations)
4. **Types** (`types.ts`) - TypeScript interfaces
5. **Validators** (`validators.ts`) - Validates request inputs

## Security Requirements

- All endpoints require Bearer token (authentication)
- All endpoints require `super_admin` role
- Passwords hashed with bcrypt (12 rounds)
- All user actions logged to activity_logs
- Cannot delete yourself (TODO)

## User Roles Available

- `super_admin` - System administrator
- `admin` - Content/department admin
- `editor` - Content editor
- `student` - Student/learner
- `partner` - Partner organization contact

## Response Format (All Endpoints)

```json
{
  "success": true/false,
  "data": { ... } | [ ... ],
  "message": "string",
  "meta": { "page": 1, "limit": 20, "total": 100, "totalPages": 5 }
}
```

## Pagination

List endpoint supports pagination:
- `page` - Page number (default: 1)
- `limit` - Items per page (default: 20, max: 100)

Example: `GET /api/admin/users?page=2&limit=50`

## Filtering

List endpoint supports filtering:
- `role` - Filter by role (super_admin, admin, editor, student, partner)
- `status` - Filter by status (active, suspended)

Example: `GET /api/admin/users?role=admin&status=active`

## Database Tables Used
- `users` - User accounts
- `activityLogs` - User management audit trail

## Next Steps
- Module 3: Training & Courses management
- See ../courses/README.md for course endpoints

## Related Modules
- Authentication (Module 1): User login/logout
- Activity Logs (Module 17): Audit trail
