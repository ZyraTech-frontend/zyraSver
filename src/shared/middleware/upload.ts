/**
 * File Upload Middleware (Multer)
 * Handles multipart/form-data for file uploads.
 * Files are stored in memory first, then uploaded to S3 or saved locally.
 */

import multer from 'multer';

// Store files in memory (buffer) — we'll send to S3 or save from there
const storage = multer.memoryStorage();

// ─── File Type Validators ──────────────────────────────────────

const documentFilter = (
  _req: Express.Request,
  file: Express.Multer.File,
  cb: multer.FileFilterCallback
) => {
  const allowedTypes = [
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  ];
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Only PDF, DOC, and DOCX files are allowed'));
  }
};

const imageFilter = (
  _req: Express.Request,
  file: Express.Multer.File,
  cb: multer.FileFilterCallback
) => {
  const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Only JPG, PNG, and WebP images are allowed'));
  }
};

const kycFilter = (
  _req: Express.Request,
  file: Express.Multer.File,
  cb: multer.FileFilterCallback
) => {
  const allowedTypes = [
    'application/pdf',
    'image/jpeg',
    'image/jpg',
    'image/png',
  ];
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Only PDF, JPG, or PNG files are allowed for KYC documents'));
  }
};

// ─── Upload Instances ──────────────────────────────────────────

/**
 * For CV/Resume uploads (job applications, training applications)
 * Accepts: PDF, DOC, DOCX — max 10MB
 */
export const uploadCV = multer({
  storage,
  fileFilter: documentFilter,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
});

/**
 * For KYC document uploads
 * Accepts: PDF, JPG, PNG — max 5MB
 */
export const uploadKYC = multer({
  storage,
  fileFilter: kycFilter,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
});

/**
 * For gallery image uploads
 * Accepts: JPG, PNG, WebP — max 10MB
 */
export const uploadImage = multer({
  storage,
  fileFilter: imageFilter,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
});

/**
 * For training applications (basic: no file / advanced: CV required)
 * Accepts: PDF, DOC, DOCX — max 5MB
 */
export const uploadTrainingCV = multer({
  storage,
  fileFilter: documentFilter,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
});

/**
 * For job applications (resume and optional additional documents)
 * Accepts: PDF, DOC, DOCX — max 10MB per file
 */
export const uploadJobApplication = multer({
  storage,
  fileFilter: documentFilter,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB per file
});
