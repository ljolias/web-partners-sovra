/**
 * Training File Upload API Route
 * Handles file uploads for the Sovra Training Center
 *
 * POST /api/sovra/training/upload
 *
 * Authentication: Requires sovra_admin role
 * Body: FormData with 'file' and optional 'category'
 */

import { NextRequest, NextResponse } from 'next/server';
import { withErrorHandling } from '@/lib/api/errorHandler';
import { withRateLimit, RATE_LIMITS } from '@/lib/api/withRateLimit';
import { logger } from '@/lib/logger';
import { UnauthorizedError, ForbiddenError, ValidationError } from '@/lib/errors';
import { requireSession } from '@/lib/auth/session';
import { uploadFileFromBuffer, validateFile } from '@/lib/storage/blob';

// Default category for training files
const DEFAULT_CATEGORY = 'training-general';

// Maximum file size: 10MB
const MAX_FILE_SIZE = 10 * 1024 * 1024;

export const POST = withRateLimit(
  withErrorHandling(async (request: NextRequest) => {
    // Step 1: Authenticate user
    const session = await requireSession();

    // Step 2: Check user role (must be sovra_admin)
    if (session.user.role !== 'sovra_admin') {
      logger.warn('Unauthorized upload attempt by user with role', { id: session.user.id, role: session.user.role });
      throw new ForbiddenError('sovra_admin role required');
    }

    // Step 3: Parse FormData
    const formData = await request.formData();

    // Step 4: Extract file from FormData
    const file = formData.get('file');

    if (!file || !(file instanceof File)) {
      throw new ValidationError('No file provided');
    }

    // Step 5: Extract optional category (default to 'training-general')
    const categoryValue = formData.get('category');
    const category =
      typeof categoryValue === 'string' && categoryValue.trim()
        ? categoryValue.trim()
        : DEFAULT_CATEGORY;

    // Sanitize category to prevent path traversal
    const sanitizedCategory = category.replace(/[^a-zA-Z0-9-_]/g, '-');

    // Step 6: Validate file
    const validation = validateFile(file.name, file.type, file.size);

    if (!validation.valid) {
      throw new ValidationError(validation.error || 'Invalid file');
    }

    // Step 7: Convert File to Buffer
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Step 8: Upload file to storage
    // Use 'training' as partnerId since this is for Sovra Training Center
    const partnerId = 'training';

    const uploadResult = await uploadFileFromBuffer(
      buffer,
      partnerId,
      sanitizedCategory,
      file.name,
      file.type
    );

    logger.info('Training file uploaded', { fileName: file.name, category: sanitizedCategory });

    // Step 9: Return success response
    return NextResponse.json(
      {
        url: uploadResult.url,
        pathname: uploadResult.pathname,
        contentType: uploadResult.contentType,
        contentDisposition: uploadResult.contentDisposition,
      },
      { status: 200 }
    );
  }),
  RATE_LIMITS.UPLOAD
);
