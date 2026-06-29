# Database Schema (Prisma)

## Files

- `schema.prisma` - All 20+ database models
- `migrations/` - Auto-generated migration files

## Key Tables (Phase 1)

```
users
  - id, email, password, firstName, lastName
  - role (student|admin|super_admin)
  - department (null for super_admin)
  - kycStatus (not_submitted|pending|verified|rejected)
  - createdAt, updatedAt

kycDocuments
  - userId, governmentIdUrl, proofOfAddressUrl
  - submittedAt

sessions
  - userId, refreshToken, expiresAt

activityLogs (append-only)
  - userId, action, resourceType, resourceId
  - changes (JSON), ipAddress, userAgent
  - createdAt (immutable)
```

## Workflow

1. Update `schema.prisma` with new models/fields
2. Run: `npm run prisma:migrate`
3. Name the migration: `add_xyz_table`
4. Migration file auto-generated in `migrations/`
5. Database updated automatically

## Viewing Data

```bash
npm run prisma:studio
# Opens http://localhost:5555
```

See DATABASE_SCHEMA_PREVIEW.md for all 20+ models.
