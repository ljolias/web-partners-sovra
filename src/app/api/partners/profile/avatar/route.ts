import { NextRequest, NextResponse } from 'next/server';
import { withErrorHandling } from '@/lib/api/errorHandler';
import { withRateLimit, RATE_LIMITS } from '@/lib/api/withRateLimit';
import { logger } from '@/lib/logger';
import { requireSession } from '@/lib/auth';
import { getUser, updateUser } from '@/lib/redis';
import { ValidationError } from '@/lib/errors';

/**
 * POST /api/partners/profile/avatar
 * Upload user avatar
 *
 * Accepts either:
 * - A data URL (base64 encoded image)
 * - An external URL to an image
 *
 * In production, this would upload to cloud storage (S3, Cloudinary, etc.)
 * For now, we store the data URL directly or external URL
 */
export const POST = withRateLimit(
  withErrorHandling(async (request: NextRequest) => {
    const { user } = await requireSession();

    const body = await request.json();
    const { avatarUrl } = body;

    if (!avatarUrl || typeof avatarUrl !== 'string') {
      throw new ValidationError('avatarUrl is required');
    }

    // Validate format - must be data URL or http(s) URL
    const isDataUrl = avatarUrl.startsWith('data:image/');
    const isHttpUrl = avatarUrl.startsWith('http://') || avatarUrl.startsWith('https://');

    if (!isDataUrl && !isHttpUrl) {
      throw new ValidationError('Invalid avatar URL format. Must be data URL or HTTP(S) URL');
    }

    // Validate data URL size (max 5MB for base64 images)
    if (isDataUrl) {
      const base64Length = avatarUrl.split(',')[1]?.length || 0;
      const sizeInBytes = (base64Length * 3) / 4;
      const sizeInMB = sizeInBytes / (1024 * 1024);

      if (sizeInMB > 5) {
        throw new ValidationError('Image too large. Maximum size is 5MB');
      }
    }

    // Update user avatar
    await updateUser(user.id, { avatarUrl });

    // Get updated user data
    const updatedUser = await getUser(user.id);
    if (!updatedUser) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const { passwordHash, ...safeUserData } = updatedUser;

    logger.info('Avatar updated', { userId: user.id, isDataUrl });

    return NextResponse.json({
      message: 'Avatar updated successfully',
      user: safeUserData,
    });
  }),
  RATE_LIMITS.UPLOAD
);

/**
 * DELETE /api/partners/profile/avatar
 * Remove user avatar
 */
export const DELETE = withRateLimit(
  withErrorHandling(async (request: NextRequest) => {
    const { user } = await requireSession();

    // Remove avatar
    await updateUser(user.id, { avatarUrl: '' });

    // Get updated user data
    const updatedUser = await getUser(user.id);
    if (!updatedUser) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const { passwordHash, ...safeUserData } = updatedUser;

    logger.info('Avatar removed', { userId: user.id });

    return NextResponse.json({
      message: 'Avatar removed successfully',
      user: safeUserData,
    });
  }),
  RATE_LIMITS.DELETE
);
