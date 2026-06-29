# Backend Setup Guide

## Project Structure Created ✅

```
zyratech-backend/
├── src/
│   ├── index.ts                    # Express server entry point
│   ├── middleware/
│   │   ├── auth.ts                 # Authentication middleware
│   │   └── errorHandler.ts         # Global error handler
│   ├── services/
│   │   └── s3.service.ts           # AWS S3 integration
│   └── utils/
│       ├── jwt.ts                  # JWT token generation/verification
│       ├── password.ts             # Bcrypt password hashing
│       ├── response.ts             # API response formatter
│       └── validation.ts            # Input validation helpers
├── prisma/
│   └── schema.prisma               # Database schema with 20+ models
├── .env.example                    # Environment variables template
├── .gitignore                      # Git ignore rules
├── tsconfig.json                   # TypeScript configuration
└── package.json                    # Dependencies (updated)
```

## Next Steps: Setup Instructions

### Step 1: Install Dependencies

```bash
npm install
```

This will install:
- Express.js + TypeScript
- Prisma + PostgreSQL client
- AWS SDK v3 (S3 + Presigner)
- JWT + Bcrypt
- CORS + Dotenv

### Step 2: Configure AWS RDS PostgreSQL

1. **Create RDS Instance** (AWS Console)
   - Engine: PostgreSQL 14 or 15
   - Instance: db.t3.micro (free tier)
   - Storage: 20GB
   - Multi-AZ: Yes (recommended)
   - Database name: `zyratech_dev`
   - Master username: `postgres`

2. **Get Connection String**
   - Format: `postgresql://username:password@host:5432/zyratech_dev`
   - Example: `postgresql://postgres:mypass123@zyratech-db.xxxxx.us-east-1.rds.amazonaws.com:5432/zyratech_dev`

### Step 3: Configure S3 Bucket

1. **Create S3 Bucket** (AWS Console)
   - Name: `zyratech-assets`
   - Region: Same as RDS (e.g., us-east-1)
   - Block public access: Yes (keep private)

2. **Enable Versioning** (optional but recommended)

3. **Set up CORS**
   ```json
   [
     {
       "AllowedOrigins": ["https://zyratechhub.com", "https://admin.zyratechhub.com"],
       "AllowedMethods": ["GET", "HEAD"],
       "AllowedHeaders": ["*"],
       "MaxAgeSeconds": 3000
     }
   ]
   ```

### Step 4: Set up CloudFront (Optional but Recommended)

1. **Create CloudFront Distribution** (AWS Console)
   - Origin: Your S3 bucket
   - Viewer protocol: HTTPS only
   - Cache TTL: 31536000 (1 year for images)
   - Alternate domain: `cdn.zyratechhub.com` (optional)

2. **Get CloudFront Domain**
   - Format: `d123456.cloudfront.net`

### Step 5: Create IAM User

1. **Create IAM User** (AWS Console)
   - Name: `zyratech-backend-api`
   - Attach policy: `AmazonS3FullAccess` (scoped to zyratech-assets bucket)

2. **Generate Access Keys**
   - Save AWS Access Key ID
   - Save AWS Secret Access Key

### Step 6: Configure Environment Variables

1. **Copy .env.example to .env**
   ```bash
   cp .env.example .env
   ```

2. **Fill in your values**
   ```env
   # Database
   DATABASE_URL=postgresql://postgres:password@zyratech-db.xxxxx.us-east-1.rds.amazonaws.com:5432/zyratech_dev

   # AWS
   AWS_REGION=us-east-1
   AWS_ACCESS_KEY_ID=AKIAIOSFODNN7EXAMPLE
   AWS_SECRET_ACCESS_KEY=wJalrXUtnFEMI/K7MDENG/bPluEphT+EXAMPLE
   AWS_S3_BUCKET=zyratech-assets
   CLOUDFRONT_DOMAIN=d123456.cloudfront.net

   # API
   API_PORT=5000
   NODE_ENV=development

   # JWT
   JWT_SECRET=your_super_secret_key_at_least_32_characters_long

   # SendGrid (optional, add later)
   SENDGRID_API_KEY=SG.xxxxx
   SENDGRID_FROM_EMAIL=noreply@zyratechhub.com

   # Paystack
   PAYSTACK_SECRET_KEY=sk_test_xxxxx
   PAYSTACK_PUBLIC_KEY=pk_test_xxxxx
   ```

### Step 7: Initialize Prisma

1. **Generate Prisma Client**
   ```bash
   npm run prisma:generate
   ```

2. **Create Migration**
   ```bash
   npm run prisma:migrate
   ```
   - Enter migration name: `init`
   - This creates all 20+ tables in your database

### Step 8: Test Connection

1. **Start Development Server**
   ```bash
   npm run dev
   ```

2. **Expected Output**
   ```
   ✓ Database connected
   ✓ Server running on http://localhost:5000
   ✓ Environment: development
   ```

3. **Test Health Check**
   ```bash
   curl http://localhost:5000/health
   ```

   Expected response:
   ```json
   {
     "success": true,
     "message": "API is running",
     "timestamp": "2024-01-15T10:30:45.123Z"
   }
   ```

## Database Schema Overview

### Core Models (Created)
- **User** - User accounts with roles and departments
- **Session** - JWT refresh tokens
- **KYC** - Identity verification
- **Course** - Course offerings
- **CourseModule** - Course curriculum
- **Enrollment** - Student course enrollment
- **Payment** - Payment transactions
- **Department** - Organizational departments
- **UploadedFile** - S3 file references
- **ActivityLog** - Audit trail
- **AuditTrail** - System events

### Enums (Created)
- UserStatus (ACTIVE, INACTIVE, SUSPENDED, DELETED)
- Role (ADMIN, DEPARTMENT_HEAD, INSTRUCTOR, STUDENT, SUPPORT)
- KYCStatus (PENDING, APPROVED, REJECTED, UNDER_REVIEW)
- CourseStatus (DRAFT, ACTIVE, ARCHIVED, CANCELLED)
- EnrollmentStatus (ACTIVE, COMPLETED, SUSPENDED, CANCELLED)
- PaymentStatus (PENDING, SUCCESS, FAILED, CANCELLED)

## Utility Services Created

### Authentication
- `JwtService` - Token generation & verification
- `PasswordService` - Bcrypt hashing & comparison
- `authMiddleware` - Protect routes
- `roleMiddleware` - Role-based access control

### File Management
- `S3Service` - Upload, download, delete files
- Automatic CloudFront URL generation
- Support for images & documents with different cache settings

### API Response
- Standardized JSON response format
- Pagination support
- Error handling

### Validation
- Email, password, phone validation
- Custom validators
- Input sanitization

## AWS Cost Estimate (Monthly)

| Service | Usage | Cost |
|---------|-------|------|
| RDS PostgreSQL (t3.micro) | Always on | $15 |
| RDS Storage (20GB) | 20GB | $5 |
| S3 Storage | 100GB | $2.30 |
| S3 Requests | 100K requests | $0.50 |
| CloudFront Transfer | 50GB | $4.25 |
| **Total** | | **~$27/month** |

## Security Checklist

✅ **Configured**
- CORS (frontend URLs whitelisted)
- HTTPS enforced (CloudFront)
- S3 bucket private (no public access)
- Password hashing (Bcrypt 12 rounds)
- JWT authentication (15 min access token)

⏳ **To Configure**
- Rate limiting (add later)
- Input validation (phase by phase)
- CSRF protection (if needed)
- SQL injection prevention (Prisma handles this)
- API keys for services (SendGrid, Paystack)

## Troubleshooting

### "Database connection failed"
- Check DATABASE_URL is correct
- Verify RDS security group allows your IP
- Confirm PostgreSQL is running

### "AWS S3 credentials invalid"
- Verify AWS_ACCESS_KEY_ID and AWS_SECRET_ACCESS_KEY
- Check IAM user has S3 permissions
- Ensure S3 bucket name is correct

### "Prisma generation failed"
- Delete `node_modules/.prisma`
- Run `npm run prisma:generate` again

### "TypeScript compilation errors"
- Run `npm install` to ensure all types are installed
- Check tsconfig.json is correct

## Next: Phase 1 Development

When ready, we'll build:
1. **Authentication** (Register, Login, Refresh Token)
2. **User Management** (Create User, Update Profile)
3. **KYC Workflow** (Submit, Review, Approve/Reject)
4. **File Upload** (Image + Document upload to S3)
5. **Postman Collection** (For frontend testing)

---

**Status**: Backend skeleton ready for Phase 1 development ✅
**Timeline**: Ready to begin Phase 1 (1-2 weeks)
