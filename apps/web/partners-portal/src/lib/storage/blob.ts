/**
 * Blob storage utilities
 * Provides functions for file uploads and validation
 */

// Allowed MIME types for file uploads
const ALLOWED_MIME_TYPES = [
  // Documents
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/vnd.ms-excel',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  // Images
  'image/png',
  'image/jpeg',
];

// Default max file size: 10MB
const DEFAULT_MAX_SIZE = 10 * 1024 * 1024;

export interface ValidationResult {
  valid: boolean;
  error?: string;
}

export interface UploadResult {
  url: string;
  filename: string;
  size: number;
  type: string;
}

/**
 * Validates a file based on name, MIME type, and size
 * @param fileName - The name of the file
 * @param mimeType - The MIME type of the file
 * @param fileSize - The size of the file in bytes
 * @param maxSize - Maximum allowed file size (default 10MB)
 * @returns Validation result with error message if invalid
 */
export function validateFile(
  fileName: string,
  mimeType: string,
  fileSize: number,
  maxSize: number = DEFAULT_MAX_SIZE
): ValidationResult {
  // Check if file name is provided
  if (!fileName || fileName.trim() === '') {
    return { valid: false, error: 'File name is required' };
  }

  // Check MIME type
  if (!ALLOWED_MIME_TYPES.includes(mimeType)) {
    return {
      valid: false,
      error: `Invalid file type: ${mimeType}. Allowed types: PDF, Word, Excel, PNG, JPEG`,
    };
  }

  // Check file size
  if (fileSize > maxSize) {
    const maxSizeMB = Math.round(maxSize / (1024 * 1024));
    return {
      valid: false,
      error: `File size exceeds maximum allowed size of ${maxSizeMB}MB`,
    };
  }

  // Check for empty files
  if (fileSize === 0) {
    return { valid: false, error: 'File is empty' };
  }

  return { valid: true };
}

/**
 * Uploads a file from a buffer to blob storage
 * @param buffer - The file content as a Buffer
 * @param partnerId - The partner ID for path organization
 * @param category - The category/folder for the file
 * @param fileName - The original file name
 * @param mimeType - The MIME type of the file
 * @returns Upload result with URL and metadata
 */
export async function uploadFileFromBuffer(
  buffer: Buffer,
  partnerId: string,
  category: string,
  fileName: string,
  mimeType: string
): Promise<UploadResult> {
  // Generate unique filename with timestamp
  const timestamp = Date.now();
  const sanitizedFileName = fileName.replace(/[^a-zA-Z0-9.-]/g, '_');
  const storagePath = `training/${category}/${timestamp}-${sanitizedFileName}`;

  // In production, this would upload to your blob storage provider
  // Examples: Vercel Blob, AWS S3, Google Cloud Storage, Azure Blob Storage

  // Example Vercel Blob implementation:
  // import { put } from '@vercel/blob';
  // const blob = await put(storagePath, buffer, {
  //   access: 'public',
  //   contentType: mimeType,
  // });
  // return {
  //   url: blob.url,
  //   filename: fileName,
  //   size: buffer.length,
  //   type: mimeType,
  // };

  // Placeholder implementation - replace with actual storage logic
  const mockUrl = `https://storage.example.com/${storagePath}`;

  return {
    url: mockUrl,
    filename: fileName,
    size: buffer.length,
    type: mimeType,
  };
}

/**
 * Gets the allowed MIME types list
 * @returns Array of allowed MIME type strings
 */
export function getAllowedMimeTypes(): string[] {
  return [...ALLOWED_MIME_TYPES];
}

/**
 * Gets the default maximum file size in bytes
 * @returns Maximum file size in bytes
 */
export function getMaxFileSize(): number {
  return DEFAULT_MAX_SIZE;
}
