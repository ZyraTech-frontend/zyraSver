import { S3Client, PutObjectCommand, GetObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

export interface FileUploadOptions {
  bucket: string;
  key: string;
  body: Buffer;
  contentType: string;
  cacheControl?: string;
}

export class S3Service {
  private s3Client: S3Client;
  private bucket: string;
  private cloudFrontDomain: string;

  constructor() {
    this.s3Client = new S3Client({
      region: process.env.AWS_REGION || 'us-east-1',
      endpoint: process.env.S3_ENDPOINT || 'https://cblfpfsvavahttedfloe.supabase.co/storage/v1/s3',
      forcePathStyle: true, // Required for Supabase S3
      credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID || '',
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || '',
      },
    });

    this.bucket = process.env.AWS_S3_BUCKET || 'zyratech-assets';
    this.cloudFrontDomain = ''; // Supabase doesn't use CloudFront by default
  }

  /**
   * Upload file to S3
   */
  async uploadFile(options: FileUploadOptions): Promise<string> {
    try {
      const command = new PutObjectCommand({
        Bucket: options.bucket,
        Key: options.key,
        Body: options.body,
        ContentType: options.contentType,
        CacheControl: options.cacheControl || 'public, max-age=31536000', // 1 year for images
      });

      await this.s3Client.send(command);

      // Return CloudFront URL
      return this.getFileUrl(options.key);
    } catch (error) {
      console.error('S3 Upload Error:', error);
      throw new Error('Failed to upload file to S3');
    }
  }

  /**
   * Upload image with default settings
   */
  async uploadImage(fileName: string, file: Buffer, mimeType: string): Promise<string> {
    const key = `images/${Date.now()}-${fileName}`;
    return this.uploadFile({
      bucket: this.bucket,
      key,
      body: file,
      contentType: mimeType,
      cacheControl: 'public, max-age=31536000', // 1 year
    });
  }

  /**
   * Upload document with shorter cache
   */
  async uploadDocument(fileName: string, file: Buffer, mimeType: string): Promise<string> {
    const key = `documents/${Date.now()}-${fileName}`;
    return this.uploadFile({
      bucket: this.bucket,
      key,
      body: file,
      contentType: mimeType,
      cacheControl: 'private, max-age=3600', // 1 hour
    });
  }

  /**
   * Get file URL (CloudFront or S3)
   */
  getFileUrl(key: string): string {
    if (this.cloudFrontDomain) {
      return `https://${this.cloudFrontDomain}/${key}`;
    }
    return `https://${this.bucket}.s3.${process.env.AWS_REGION || 'us-east-1'}.amazonaws.com/${key}`;
  }

  /**
   * Generate signed URL for temporary access
   */
  async getSignedDownloadUrl(key: string, expiresIn: number = 3600): Promise<string> {
    try {
      const command = new GetObjectCommand({
        Bucket: this.bucket,
        Key: key,
      });

      return await getSignedUrl(this.s3Client, command, { expiresIn });
    } catch (error) {
      console.error('Signed URL Error:', error);
      throw new Error('Failed to generate signed URL');
    }
  }

  /**
   * Delete file from S3
   */
  async deleteFile(key: string): Promise<void> {
    try {
      const command = new DeleteObjectCommand({
        Bucket: this.bucket,
        Key: key,
      });

      await this.s3Client.send(command);
    } catch (error) {
      console.error('S3 Delete Error:', error);
      throw new Error('Failed to delete file from S3');
    }
  }

  /**
   * Extract S3 key from URL
   */
  extractKeyFromUrl(url: string): string {
    if (url.includes(this.cloudFrontDomain)) {
      return url.replace(`https://${this.cloudFrontDomain}/`, '');
    }
    const parts = url.split('.amazonaws.com/');
    return parts[1] || '';
  }
}

export const s3Service = new S3Service();
