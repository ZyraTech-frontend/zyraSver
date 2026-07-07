# Production ECS Runbook

This project should use Prisma migrations and ECS rolling deployments for production. Do not run `prisma db push --accept-data-loss` against production.

## Production Rules

1. Application containers only serve traffic.
2. Database schema changes happen once per release with `prisma migrate deploy`.
3. Every schema change is committed as a migration under `prisma/migrations`.
4. Runtime secrets live in AWS Secrets Manager or SSM Parameter Store, not in `.env` files.
5. GitHub Actions deploys immutable image tags to ECS.

## Current Backend Values

Use these when creating the ECS service:

```text
Container name: api
Container port: 5000
Health check path: /health
Start command: npm start
Production env: NODE_ENV=production
```

## One-Time Prisma Baseline

The repo now has an initial migration:

```text
prisma/migrations/20260707000000_initial_schema/migration.sql
```

If the production database is already built from the current `schema.prisma`, do not apply that initial SQL again. After confirming the database shape matches the current schema, mark the baseline as already applied once:

```bash
npx prisma migrate resolve --applied 20260707000000_initial_schema
```

Then run:

```bash
npm run db:migrate:deploy
```

For a brand-new empty database, skip `migrate resolve` and run only:

```bash
npm run db:migrate:deploy
```

Always take a database backup before baselining or applying production migrations.

## Normal Development Flow

When adding a table or changing the schema:

```bash
npm run db:migrate:dev -- --name add_example_table
npm run typecheck
```

Commit both:

```text
prisma/schema.prisma
prisma/migrations/<timestamp>_<name>/migration.sql
```

When this reaches `main`, GitHub Actions runs:

```bash
npm run db:migrate:deploy
```

Then it builds the Docker image, pushes it to ECR, registers a new ECS task definition revision, and updates the ECS service.

## GitHub Configuration

Create these repository variables:

```text
AWS_REGION=us-east-1
ECR_REPOSITORY=zyratech-backend
ECS_CLUSTER=<your-ecs-cluster-name>
ECS_SERVICE=<your-ecs-service-name>
ECS_CONTAINER_NAME=api
```

Create these repository secrets:

```text
AWS_ROLE_TO_ASSUME=<github-actions-oidc-role-arn>
DATABASE_URL=<production-pooled-database-url>
DIRECT_URL=<production-direct-database-url>
```

The AWS role should use GitHub OIDC and have scoped permissions for ECR push, ECS task definition registration, ECS service update, CloudWatch Logs reads if needed, and `iam:PassRole` for the ECS task roles.

## ECS Runtime Configuration

Put these in the ECS task/service environment:

```text
NODE_ENV=production
API_PORT=5000
FRONTEND_URL=https://zyratechhub.com
ADMIN_FRONTEND_URL=<admin-frontend-url>
AWS_REGION=us-east-1
AWS_S3_BUCKET=zyratech-assets
S3_ENDPOINT=<supabase-s3-endpoint>
```

Put these in Secrets Manager or SSM Parameter Store and wire them into the ECS task as secrets:

```text
DATABASE_URL
DIRECT_URL
JWT_SECRET
AWS_ACCESS_KEY_ID
AWS_SECRET_ACCESS_KEY
PAYSTACK_SECRET_KEY
PAYSTACK_PUBLIC_KEY
SMTP credentials
```

## Cutover

1. Deploy ECS service with desired count `2`.
2. Confirm the ALB health target is healthy on `/health`.
3. Test:

```bash
curl -i https://<alb-dns-name>/health
curl -i https://<alb-dns-name>/api/settings/public
```

4. Create or update `api.zyratechhub.com` as a Route 53 alias to the ALB.
5. Update Amplify frontend env vars to point to:

```text
https://api.zyratechhub.com
```

6. Redeploy Amplify.
7. Keep the old EC2 service available until ECS logs and frontend traffic are clean.
