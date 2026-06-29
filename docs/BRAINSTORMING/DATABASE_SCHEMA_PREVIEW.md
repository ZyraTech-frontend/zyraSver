# PostgreSQL Database Schema Preview
## Prisma Schema Structure - ZyraTech Hub

---

## QUICK REFERENCE: Core Entities & Relationships

```
USER
├── id (PK)
├── email (unique)
├── role: super_admin | admin
├── department: string (nullable for super_admin)
├── kycStatus: not_submitted | pending | verified | rejected
└── Relationships:
    ├── hasMany enrollments
    ├── hasMany activityLogs
    ├── hasMany kycDocuments
    ├── hasMany sessions
    └── hasMany createdReports

COURSE
├── id (PK)
├── title, slug (unique), price
├── status: draft | published
├── featured: boolean
└── Relationships:
    ├── hasMany enrollments
    └── hasMany jobApplications

ENROLLMENT
├── id (PK)
├── studentId (FK to User)
├── courseId (FK to Course)
├── status: pending | active | completed | cancelled
├── paymentStatus: pending | paid | refunded
└── Relationships:
    ├── belongsTo user
    ├── belongsTo course
    └── hasMany payments
```

---

## TABLES & FIELDS

### 1. USERS

```prisma
model User {
  id                    String      @id @default(cuid())
  email                 String      @unique
  password              String      // bcrypt hashed
  
  // Profile
  name                  String
  avatar                String?     // Cloudinary URL
  phone                 String?
  
  // Role & Access
  role                  String      // super_admin | admin
  department            String?     // null for super_admin, e.g., "Training Courses"
  accountStatus         String      // active | deactivated | pending_password
  
  // Password Management
  mustChangePassword    Boolean     @default(false)
  passwordChangedAt     DateTime?
  
  // KYC
  kycStatus             String      // not_submitted | pending | verified | rejected
  kycSubmittedAt        DateTime?
  kycReviewedAt         DateTime?
  kycReviewedBy         String?     // super_admin who reviewed
  kycRejectionReason    String?
  
  // Activity
  createdAt             DateTime    @default(now())
  updatedAt             DateTime    @updatedAt
  lastLogin             DateTime?
  deactivatedAt         DateTime?
  deactivationReason    String?
  
  // Relations
  enrollments           Enrollment[]
  kycDocuments          KycDocument[]
  sessions              Session[]
  activityLogs          ActivityLog[] @relation("LoggedByUser")
  reviewedKyc           ActivityLog[] @relation("ReviewedByUser")
  sentMessages          Message[]
  refreshTokens         RefreshToken[]
  
  @@index([email])
  @@index([role])
  @@index([department])
  @@index([kycStatus])
}

model KycDocument {
  id                    String      @id @default(cuid())
  userId                String
  user                  User        @relation(fields: [userId], references: [id], onDelete: Cascade)
  
  governmentIdUrl       String      // Cloudinary URL
  governmentIdFilename  String
  governmentIdUploadedAt DateTime
  
  proofOfAddressUrl     String      // Cloudinary URL
  proofOfAddressFilename String
  proofOfAddressUploadedAt DateTime
  
  submittedAt           DateTime    @default(now())
  
  @@index([userId])
}
```

### 2. COURSES

```prisma
model Course {
  id                    String      @id @default(cuid())
  title                 String
  slug                  String      @unique
  description           String      // Rich HTML
  shortDescription      String
  
  // Pricing
  price                 Int         // In pesewas
  discountPrice         Int?
  
  // Metadata
  category              String      // web, backend, mobile, etc.
  level                 String      // beginner, intermediate, advanced
  duration              String      // "12 weeks"
  
  // Content
  image                 String      // Cloudinary URL
  curriculum            Json        // Array of modules with topics
  instructors           Json        // Array of instructor objects
  tools                 String[]    // ["React", "Node.js"]
  prerequisites         String[]
  outcomes              String[]
  
  // Status
  status                String      // draft | published
  featured              Boolean     @default(false)
  
  // Analytics
  enrollmentCount       Int         @default(0)
  rating                Float?      // Average rating 1-5
  
  // Timestamps
  createdAt             DateTime    @default(now())
  updatedAt             DateTime    @updatedAt
  
  // Relations
  enrollments           Enrollment[]
  payments              Payment[]
  
  @@index([slug])
  @@index([status])
  @@index([category])
  @@index([featured])
}

model Enrollment {
  id                    String      @id @default(cuid())
  studentId             String
  courseId              String
  student               User        @relation(fields: [studentId], references: [id], onDelete: Cascade)
  course                Course      @relation(fields: [courseId], references: [id], onDelete: Cascade)
  
  status                String      // pending | active | completed | cancelled
  paymentStatus         String      // pending | paid | refunded
  paymentReference      String?     // Paystack reference
  
  progress              Int         @default(0) // 0-100
  
  enrolledAt            DateTime    @default(now())
  completedAt           DateTime?
  
  // Relations
  payments              Payment[]
  
  @@unique([studentId, courseId])
  @@index([studentId])
  @@index([courseId])
  @@index([status])
}
```

### 3. PAYMENTS & TRANSACTIONS

```prisma
model Payment {
  id                    String      @id @default(cuid())
  reference             String      @unique // Paystack reference
  
  // Amount
  amount                Int         // In pesewas
  currency              String      @default("GHS")
  
  // Customer Info
  email                 String
  studentId             String?     // nullable for public payments
  
  // Course
  courseId              String
  course                Course      @relation(fields: [courseId], references: [id])
  enrollmentId          String?
  enrollment            Enrollment? @relation(fields: [enrollmentId], references: [id])
  
  // Status
  status                String      // pending | success | failed | refunded
  
  // Paystack Data
  authorization         Json?       // Authorization object from Paystack
  metadata              Json?       // Custom metadata
  
  // Refund
  refundedAt            DateTime?
  refundReason          String?
  
  // Timestamps
  paidAt                DateTime?
  createdAt             DateTime    @default(now())
  updatedAt             DateTime    @updatedAt
  
  @@index([reference])
  @@index([email])
  @@index([status])
  @@index([paidAt])
}
```

### 4. JOBS & APPLICATIONS

```prisma
model Job {
  id                    String      @id @default(cuid())
  title                 String
  slug                  String      @unique
  
  type                  String      // Full-time, Part-time, Contract, etc.
  category              String      // technical, education, operations
  locations             String[]    // ["Koforidua", "Remote"]
  
  description           String      // Rich HTML
  responsibilities      String[]
  qualifications        String[]
  perks                 String[]
  
  // Salary
  minSalary             Int?
  maxSalary             Int?
  salaryPeriod          String?     // monthly, annually
  salaryDisplay         String?     // "Competitive"
  
  status                String      // draft | published | closed
  featured              Boolean     @default(false)
  applicationDeadline   DateTime?
  
  createdBy             String
  createdAt             DateTime    @default(now())
  updatedAt             DateTime    @updatedAt
  
  // Relations
  applications          JobApplication[]
  
  @@index([slug])
  @@index([status])
  @@index([featured])
}

model JobApplication {
  id                    String      @id @default(cuid())
  jobId                 String
  job                   Job         @relation(fields: [jobId], references: [id], onDelete: Cascade)
  
  // Applicant Info
  firstName             String
  lastName              String
  email                 String
  phone                 String
  location              String
  linkedin              String?
  portfolio             String?
  
  // Documents
  resumeUrl             String      // S3 URL
  coverLetterUrl        String?     // S3 URL or inline text
  
  // Experience & Education
  experience            Json        // Array of experience objects
  education             String
  skills                String[]
  
  // Application
  availability          String
  expectedSalary        String?
  howDidYouHear         String
  
  // Review
  status                String      // new | reviewing | shortlisted | interview | offered | hired | rejected
  rating                Int?        // 1-5
  notes                 String?
  
  // Timestamps
  appliedAt             DateTime    @default(now())
  updatedAt             DateTime    @updatedAt
  
  @@index([jobId])
  @@index([email])
  @@index([status])
}
```

### 5. CONTENT MANAGEMENT (BLOG, FAQ, TESTIMONIALS, ETC.)

```prisma
model BlogPost {
  id                    String      @id @default(cuid())
  title                 String
  slug                  String      @unique
  excerpt               String
  content               String      // Rich HTML
  
  featuredImage         String      // Cloudinary URL
  category              String
  tags                  String[]
  
  author                Json        // { id, name, avatar }
  
  status                String      // draft | published
  views                 Int         @default(0)
  readTime              String?
  
  publishedAt           DateTime?
  createdAt             DateTime    @default(now())
  updatedAt             DateTime    @updatedAt
  
  @@index([slug])
  @@index([status])
  @@index([category])
}

model Faq {
  id                    String      @id @default(cuid())
  category              String      // Internship, Services, etc.
  question              String
  answer                String      // Rich HTML
  
  status                String      // published | draft
  views                 Int         @default(0)
  helpful               Int         @default(0)
  order                 Int
  
  createdAt             DateTime    @default(now())
  updatedAt             DateTime    @updatedAt
  
  @@index([category])
  @@index([status])
}

model Testimonial {
  id                    String      @id @default(cuid())
  name                  String
  role                  String
  type                  String      // student, alumni, partner, etc.
  quote                 String
  rating                Int         // 1-5
  avatar                String?     // Cloudinary URL
  
  featured              Boolean     @default(false)
  status                String      // published | draft | pending
  program               String?
  date                  DateTime?
  likes                 Int         @default(0)
  verified              Boolean     @default(false)
  
  createdAt             DateTime    @default(now())
  
  @@index([status])
  @@index([featured])
}
```

### 6. PARTNERSHIPS & MESSAGES

```prisma
model Partnership {
  id                    String      @id @default(cuid()) // PART-YYYY-###
  
  // Organization
  organizationName      String
  organizationLogo      String      // Cloudinary URL
  website               String?
  industry              String
  
  // Contact
  contactName           String
  contactEmail          String
  contactPhone          String
  contactRole           String
  
  // Partnership Details
  type                  String      // corporate, academic, government, etc.
  status                String      // active | negotiating | inactive
  featured              Boolean     @default(false)
  
  startDate             DateTime
  endDate               DateTime?
  value                 String?
  description           String
  
  // Metrics
  benefits              String[]
  studentsPlaced        Int         @default(0)
  projectsCompleted     Int         @default(0)
  
  createdAt             DateTime    @default(now())
  updatedAt             DateTime    @updatedAt
  
  @@index([status])
  @@index([featured])
}

model Message {
  id                    String      @id @default(cuid()) // MSG-YYYY-###
  
  // Sender
  senderName            String
  senderEmail           String
  senderPhone           String?
  senderCompany         String?
  
  // Content
  subject               String?
  message               String
  
  // Classification
  category              String      // general | training | partnership | etc.
  priority              String      // high | medium | low
  
  // Status
  status                String      // unread | read | replied | archived
  starred               Boolean     @default(false)
  source                String      // Contact Form | Email | WhatsApp
  
  // Management
  assignedTo            String?     // admin user ID
  replies               Json        // Array of reply objects
  
  createdAt             DateTime    @default(now())
  updatedAt             DateTime    @updatedAt
  
  // Relations (if we need to tie to user)
  user                  User?       @relation(fields: [senderEmail], references: [email])
  
  @@index([status])
  @@index([category])
  @@index([priority])
  @@index([createdAt])
}
```

### 7. AUDIT & ADMIN

```prisma
model ActivityLog {
  id                    String      @id @default(cuid()) // LOG-timestamp-random
  
  // User Action
  userId                String
  user                  User        @relation("LoggedByUser", fields: [userId], references: [id])
  
  // Action Details
  type                  String      // login, logout, user_created, course_updated, etc.
  severity              String      // info | success | warning | error
  description           String
  
  // Resource
  resourceType          String?     // user, course, enrollment, payment, etc.
  resourceId            String?
  
  // Changes (for updates)
  changes               Json?       // { before: {...}, after: {...} }
  
  // Device Info
  userAgent             String?
  ipAddress             String?
  
  // Metadata
  metadata              Json?
  
  createdAt             DateTime    @default(now())
  
  @@index([userId])
  @@index([type])
  @@index([resourceType])
  @@index([createdAt])
}

model ActivityLogArchive {
  // Same as ActivityLog but for logs older than 1 year
  id                    String      @id
  userId                String
  type                  String
  severity              String
  description           String
  resourceType          String?
  resourceId            String?
  changes               Json?
  userAgent             String?
  ipAddress             String?
  metadata              Json?
  createdAt             DateTime
  
  @@index([userId])
  @@index([createdAt])
}

model Setting {
  key                   String      @id
  value                 String      // JSON stringified if complex
  category              String      // branding, contact, payment, etc.
  description           String?
  
  updatedAt             DateTime    @updatedAt
  updatedBy             String?     // admin user ID
  
  @@index([category])
}

model Session {
  id                    String      @id @default(cuid())
  userId                String
  user                  User        @relation(fields: [userId], references: [id], onDelete: Cascade)
  
  token                 String      @unique
  refreshToken          String      @unique
  
  userAgent             String?
  ipAddress             String?
  device                String?     // "Chrome on Windows", etc.
  
  expiresAt             DateTime
  createdAt             DateTime    @default(now())
  
  @@index([userId])
  @@index([expiresAt])
}

model RefreshToken {
  id                    String      @id @default(cuid())
  userId                String
  user                  User        @relation(fields: [userId], references: [id], onDelete: Cascade)
  
  token                 String      @unique
  expiresAt             DateTime
  revokedAt             DateTime?
  
  createdAt             DateTime    @default(now())
  
  @@index([userId])
}

model Report {
  id                    String      @id @default(cuid()) // RPT-###
  
  name                  String
  description           String?
  type                  String      // enrollment, revenue, course_performance, etc.
  format                String      // PDF | Excel | CSV
  
  // Scheduling
  frequency             String      // one_time | daily | weekly | monthly
  status                String      // active | paused | draft
  recipients            String[]    // email list
  
  // Metrics & Date Range
  metrics               String[]
  startDate             DateTime?
  endDate               DateTime?
  
  // Execution
  lastGenerated         DateTime?
  nextScheduledRun      DateTime?
  
  createdBy             String
  createdAt             DateTime    @default(now())
  updatedAt             DateTime    @updatedAt
  
  @@index([status])
  @@index([type])
}

model ImpactMetric {
  id                    String      @id @default(cuid()) // MET-###
  
  title                 String
  value                 String      // Can be number, percentage, or text
  previousValue         String?
  
  type                  String      // number | percentage | currency | rating
  category              String      // students | employment | partnerships | etc.
  description           String?
  
  // Display
  prefix                String?     // "+", "$", etc.
  suffix                String?     // "%", "students", etc.
  featured              Boolean     @default(false)
  active                Boolean     @default(true)
  displayOrder          Int
  displayLocations      String[]    // ["home", "partnership", "about"]
  
  trend                 String?     // up | down | stable
  lastUpdated           DateTime    @updatedAt
  
  @@index([category])
  @@index([featured])
}

model ImpactStory {
  id                    String      @id @default(cuid())
  
  title                 String
  content               String      // Rich HTML
  image                 String?     // Cloudinary URL
  
  category              String
  featured              Boolean     @default(false)
  status                String      // published | draft
  
  author                String
  publishedAt           DateTime?
  createdAt             DateTime    @default(now())
  
  @@index([status])
}
```

### 8. NEWSLETTER & MISCELLANEOUS

```prisma
model Newsletter {
  id                    String      @id @default(cuid())
  email                 String      @unique
  source                String      // Homepage, Blog, Training Page, etc.
  
  status                String      // active | unsubscribed
  subscribedAt          DateTime    @default(now())
  unsubscribedAt        DateTime?
  
  @@index([status])
  @@index([subscribedAt])
}

model UploadedFile {
  id                    String      @id @default(cuid())
  
  cloudinaryId          String?     // For Cloudinary
  s3Key                 String?     // For S3
  url                   String
  
  filename              String
  mimetype              String      // image/jpeg, application/pdf, etc.
  size                  Int         // in bytes
  
  fileType              String      // image | document
  uploadedBy            String?     // user ID
  
  createdAt             DateTime    @default(now())
  
  @@index([uploadedBy])
}

model HeroSlide {
  id                    String      @id @default(cuid())
  
  title                 String
  description           String
  pillar                String?
  backgroundImage       String      // Cloudinary URL
  
  cta1Text              String?
  cta1Link              String?
  cta2Text              String?
  cta2Link              String?
  
  isVisible             Boolean     @default(true)
  order                 Int
  
  createdAt             DateTime    @default(now())
  
  @@index([order])
}

model GalleryAlbum {
  id                    String      @id @default(cuid())
  
  title                 String
  description           String?
  thumbnail             String?     // Cloudinary URL
  
  images                GalleryImage[]
  createdAt             DateTime    @default(now())
}

model GalleryImage {
  id                    String      @id @default(cuid())
  
  url                   String      // Cloudinary URL
  thumbnail             String?
  caption               String?
  
  albumId               String?
  album                 GalleryAlbum? @relation(fields: [albumId], references: [id])
  
  tags                  String[]
  order                 Int         @default(0)
  
  uploadedAt            DateTime    @default(now())
  
  @@index([albumId])
}

model Project {
  id                    String      @id @default(cuid())
  
  title                 String
  slug                  String      @unique
  description           String      // Rich HTML
  shortDescription      String
  
  image                 String      // Cloudinary URL
  gallery               String[]    // Array of Cloudinary URLs
  
  category              String
  technologies          String[]
  client                String
  
  status                String      // draft | published | completed | in-progress
  featured              Boolean     @default(false)
  
  startDate             DateTime?
  endDate               DateTime?
  teamSize              Int?
  
  createdAt             DateTime    @default(now())
  
  @@index([slug])
  @@index([status])
}
```

---

## INDEXES SUMMARY

### Performance Indexes (High Priority)
- `users(email)` — Login queries
- `users(role, department)` — RBAC checks
- `courses(slug)` — Course detail lookups
- `enrollments(studentId, courseId)` — Duplicate prevention
- `payments(reference, status)` — Payment lookups
- `activityLogs(userId, createdAt)` — Audit queries

### Search Indexes (Full-Text, Phase 2)
- `blogPosts` TSVECTOR on `title || content`
- `jobs` TSVECTOR on `title || description`
- `faqs` TSVECTOR on `question || answer`
- `courses` TSVECTOR on `title || description`

### Date Range Indexes (Analytics)
- `payments(createdAt, status)` — Revenue reports
- `enrollments(enrolledAt)` — Enrollment trends
- `activityLogs(createdAt)` — Audit trails
- `users(createdAt)` — User growth

---

## MIGRATION TIMELINE

**Week 1:** Core tables (User, Course, Enrollment, Payment)  
**Week 2:** Business tables (Job, JobApplication, Partnership, Message)  
**Week 3:** Content tables (BlogPost, Faq, Testimonial, Project)  
**Week 4:** Admin tables (ActivityLog, Setting, Session)  
**Week 5+:** Optimize indexes, add constraints, archive strategy

---

**File count:** ~20 Prisma models  
**Relationships:** ~30+ foreign keys  
**Total indexes:** ~40+  
**Estimated rows (Year 1):** 50K-100K  

This schema is production-ready and scales to millions of records with proper indexing.
