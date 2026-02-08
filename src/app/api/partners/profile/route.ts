import { NextRequest, NextResponse } from 'next/server';
import { withErrorHandling } from '@/lib/api/errorHandler';
import { withRateLimit, RATE_LIMITS } from '@/lib/api/withRateLimit';
import { logger } from '@/lib/logger';
import { requireSession } from '@/lib/auth';
import { getUser, updateUser } from '@/lib/redis';
import { userProfileUpdateSchema, validateInput } from '@/lib/validation/schemas';
import { ValidationError } from '@/lib/errors';

/**
 * GET /api/partners/profile
 * Get current user profile
 */
export const GET = withRateLimit(
  withErrorHandling(async (request: NextRequest) => {
    const { user } = await requireSession();

    // Get fresh user data from Redis
    const userData = await getUser(user.id);
    if (!userData) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Remove sensitive fields before sending
    const { passwordHash, ...safeUserData } = userData;

    logger.debug('Profile retrieved', { userId: user.id });

    return NextResponse.json({ user: safeUserData });
  }),
  RATE_LIMITS.READ
);

/**
 * PUT /api/partners/profile
 * Update current user profile
 */
export const PUT = withRateLimit(
  withErrorHandling(async (request: NextRequest) => {
    const { user } = await requireSession();

    const body = await request.json();

    // Validate input
    const validation = await validateInput(userProfileUpdateSchema, body);

    if (!validation.success) {
      throw new ValidationError('Validation failed', validation.errors);
    }

    const updates = validation.data;

    // Update user in Redis
    await updateUser(user.id, updates);

    // Get updated user data
    const updatedUser = await getUser(user.id);
    if (!updatedUser) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const { passwordHash, ...safeUserData } = updatedUser;

    logger.info('Profile updated', { userId: user.id, fields: Object.keys(updates) });

    return NextResponse.json({
      message: 'Profile updated successfully',
      user: safeUserData,
    });
  }),
  RATE_LIMITS.UPDATE
);
