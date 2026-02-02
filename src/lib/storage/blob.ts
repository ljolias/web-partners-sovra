/**
 * Vercel Blob Storage Utilities
 *
 * Note: Requires @vercel/blob package to be installed.
 * Run: npm install @vercel/blob
 *
 * Also requires BLOB_READ_WRITE_TOKEN environment variable.
 */

// Allowed file types for legal documents
export const ALLOWED_MIME_TYPES = [
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/vnd.ms-excel',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  'image/png',
  'image/jpeg',
] as const;

export const ALLOWED_EXTENSIONS = ['.pdf', '.doc', '.docx', '.xls', '.xlsx', '.png', '.jpg', '.jpeg'];

export const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

export type AllowedMimeType = (typeof ALLOWED_MIME_TYPES)[number];

export interface UploadResult {
  url: string;
  pathname: string;
  contentType: string;
  contentDisposition: string;
}

export interface FileValidationResult {
  valid: boolean;
  error?: string;
}

/**
 * Validate file before upload
 */
export function validateFile(
  fileName: string,
  mimeType: string,
  fileSize: number
): FileValidationResult {
  // Check file size
  if (fileSize > MAX_FILE_SIZE) {
    return {
      valid: false,
      error: `File size exceeds maximum allowed size of ${MAX_FILE_SIZE / (1024 * 1024)}MB`,
    };
  }

  // Check mime type
  if (!ALLOWED_MIME_TYPES.includes(mimeType as AllowedMimeType)) {
    return {
      valid: false,
      error: `File type ${mimeType} is not allowed. Allowed types: PDF, DOC, DOCX, XLS, XLSX, PNG, JPG`,
    };
  }

  // Check extension
  const extension = fileName.toLowerCase().slice(fileName.lastIndexOf('.'));
  if (!ALLOWED_EXTENSIONS.includes(extension)) {
    return {
      valid: false,
      error: `File extension ${extension} is not allowed`,
    };
  }

  return { valid: true };
}

/**
 * Generate a unique file path for storage
 */
export function generateFilePath(partnerId: string, category: string, fileName: string): string {
  const timestamp = Date.now();
  const sanitizedFileName = fileName.replace(/[^a-zA-Z0-9.-]/g, '_');
  return `legal-documents/${partnerId}/${category}/${timestamp}-${sanitizedFileName}`;
}

/**
 * Dynamic import of @vercel/blob to handle cases where it's not installed
 */
async function getBlobModule() {
  try {
    const blob = await import('@vercel/blob');
    return blob;
  } catch {
    throw new Error(
      '@vercel/blob is not installed. Please run: npm install @vercel/blob'
    );
  }
}

/**
 * Upload a file to Vercel Blob storage
 */
export async function uploadFile(
  file: File | Blob,
  partnerId: string,
  category: string,
  originalFileName: string
): Promise<UploadResult> {
  const blob = await getBlobModule();
  const pathname = generateFilePath(partnerId, category, originalFileName);

  const result = await blob.put(pathname, file, {
    access: 'public',
    addRandomSuffix: false,
    contentType: file.type,
  });

  return {
    url: result.url,
    pathname: result.pathname,
    contentType: file.type,
    contentDisposition: `attachment; filename="${originalFileName}"`,
  };
}

/**
 * Upload a file from a buffer
 */
export async function uploadFileFromBuffer(
  buffer: Buffer,
  partnerId: string,
  category: string,
  originalFileName: string,
  mimeType: string
): Promise<UploadResult> {
  const blob = await getBlobModule();
  const pathname = generateFilePath(partnerId, category, originalFileName);

  const result = await blob.put(pathname, buffer, {
    access: 'public',
    addRandomSuffix: false,
    contentType: mimeType,
  });

  return {
    url: result.url,
    pathname: result.pathname,
    contentType: mimeType,
    contentDisposition: `attachment; filename="${originalFileName}"`,
  };
}

/**
 * Delete a file from Vercel Blob storage
 */
export async function deleteFile(url: string): Promise<void> {
  const blob = await getBlobModule();
  await blob.del(url);
}

/**
 * Get file metadata
 */
export async function getFileMetadata(url: string) {
  try {
    const blob = await getBlobModule();
    const metadata = await blob.head(url);
    return metadata;
  } catch {
    return null;
  }
}

/**
 * List files for a partner
 */
export async function listPartnerFiles(partnerId: string, category?: string) {
  const blob = await getBlobModule();
  const prefix = category
    ? `legal-documents/${partnerId}/${category}/`
    : `legal-documents/${partnerId}/`;

  const { blobs } = await blob.list({ prefix });
  return blobs;
}

/**
 * Get human-readable file type from mime type
 */
export function getFileTypeLabel(mimeType: string): string {
  const typeMap: Record<string, string> = {
    'application/pdf': 'PDF',
    'application/msword': 'Word Document',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document': 'Word Document',
    'application/vnd.ms-excel': 'Excel Spreadsheet',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': 'Excel Spreadsheet',
    'image/png': 'PNG Image',
    'image/jpeg': 'JPEG Image',
  };

  return typeMap[mimeType] || 'Unknown';
}

/**
 * Format file size for display
 */
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes';

  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}
