# API Modules

This folder contains all API module implementations organized by feature.

## Module Structure

Each module follows this pattern:

```
module-name/
├── README.md              # Module documentation
├── routes.ts             # Route definitions
├── controller.ts         # Request handlers
├── service.ts            # Business logic
├── types.ts              # TypeScript interfaces
└── validators.ts         # Input validation
```

## Implemented Modules

### Module 1: Authentication (`/auth`)
- **Status**: ✅ Complete
- **Base Path**: `/api/auth`
- **Access**: Public + Protected
- **Description**: User login, token refresh, password reset, current user info
- **See**: [auth/README.md](./auth/README.md)

### Module 2: User Management (`/users`)
- **Status**: ✅ Complete
- **Base Path**: `/api/admin/users`
- **Access**: Super Admin Only
- **Description**: User CRUD, role management, suspend/activate
- **See**: [users/README.md](./users/README.md)

## Planned Modules (Phase 1)

### Module 3: Training & Courses
- Create, read, update, delete courses
- Course publishing/unpublishing
- Course enrollments

### Module 4: Payments
- Paystack integration
- Transaction management
- Invoice generation

### Module 5+: Content Management, Partnerships, etc.
- See backend documentation for full list

## Development Guidelines

### Adding a New Module

1. Create a folder: `src/modules/module-name/`
2. Create files: `routes.ts`, `controller.ts`, `service.ts`, `types.ts`, `validators.ts`, `README.md`
3. Follow the same patterns as existing modules
4. Add route to `src/index.ts`
5. Document in this README

### File Responsibilities

- **routes.ts** - Express router, middleware, endpoint mappings
- **controller.ts** - HTTP request handling, response formatting
- **service.ts** - Business logic, database queries, core functionality
- **types.ts** - TypeScript interfaces (requests, responses, errors)
- **validators.ts** - Input validation logic
- **README.md** - Module documentation for developers

### Best Practices

1. **Type Safety**: All functions should have explicit return types
2. **Error Handling**: Use custom error classes (see module types.ts)
3. **Input Validation**: Validate all user inputs in validators.ts
4. **Activity Logging**: Log important actions (create, update, delete)
5. **Response Format**: Always use ApiResponseHandler for consistent responses
6. **Authentication**: Apply auth middleware to protected routes
7. **Authorization**: Check user roles in controller or middleware
8. **Comments**: Document complex logic with inline comments
9. **Testing**: Each module should have Postman collection entries

## Response Format (Standard)

All endpoints return:

```json
{
  "success": true/false,
  "data": { ... } | [ ... ],
  "message": "string",
  "meta": { "page": 1, "limit": 20, "total": 100, "totalPages": 5 }
}
```

## Error Handling

All modules should throw custom errors:

```typescript
import { CustomError } from './types';

throw new CustomError(statusCode, message, errors);
```

Controller catches and uses ApiResponseHandler to format errors.

## Next Steps

1. Implement Module 3: Training & Courses
2. Implement Module 4: Payments (Paystack)
3. Implement remaining modules in priority order
4. Add comprehensive tests for each module
5. Generate API documentation (Swagger/OpenAPI)

---

**Module Count**: 2/19  
**Status**: Phase 1 Authentication & User Management Complete
