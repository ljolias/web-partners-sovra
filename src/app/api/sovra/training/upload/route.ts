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
import { requireSession } from '@/lib/auth/session';
import { uploadFileFromBuffer, validateFile } from '@/lib/storage/blob';

// Default category for training files
const DEFAULT_CATEGORY = 'training-general';

// Maximum file size: 10MB
const MAX_FILE_SIZE = 10 * 1024 * 1024;

export async function POST(request: NextRequest) {
  try {
    // Step 1: Authenticate user
    let session;
    try {
      session = await requireSession();
    } catch (error) {
      console.error('Authentication failed:', error);
      return NextResponse.json(
        { error: 'Not authenticated' },
        { status: 401 }
      );
    }

    // Step 2: Check user role (must be sovra_admin)
    if (session.user.role !== 'sovra_admin') {
      console.warn(
        `Unauthorized upload attempt by user ${session.user.id} with role ${session.user.role}`
      );
      return NextResponse.json(
        { error: 'Forbidden: sovra_admin role required' },
        { status: 403 }
      );
    }

    // Step 3: Parse FormData
    let formData: FormData;
    try {
      formData = await request.formData();
    } catch (error) {
      console.error('Failed to parse FormData:', error);
      return NextResponse.json(
        { error: 'Invalid request body' },
        { status: 400 }
      );
    }

    // Step 4: Extract file from FormData
    const file = formData.get('file');

    if (!file || !(file instanceof File)) {
      return NextResponse.json(
        { error: 'No file provided' },
        { status: 400 }
      );
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
      return NextResponse.json(
        { error: validation.error },
        { status: 400 }
      );
    }

    // Step 7: Convert File to Buffer
    let buffer: Buffer;
    try {
      const arrayBuffer = await file.arrayBuffer();
      buffer = Buffer.from(arrayBuffer);
    } catch (error) {
      console.error('Failed to read file content:', error);
      return NextResponse.json(
        { error: 'Failed to read file content' },
        { status: 500 }
      );
    }

    // Step 8: Upload file to storage
    // Use 'training' as partnerId since this is for Sovra Training Center
    const partnerId = 'training';

    let uploadResult;
    try {
      uploadResult = await uploadFileFromBuffer(
        buffer,
        partnerId,
        sanitizedCategory,
        file.name,
        file.type
      );
    } catch (error) {
      console.error('File upload failed:', error);
      return NextResponse.json(
        { error: 'Upload failed' },
        { status: 500 }
      );
    }

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
  } catch (error) {
    // Catch-all error handler
    console.error('Unexpected error in upload route:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
