/**
 * Centralized API error handling
 */

import { NextResponse } from 'next/server';
import { logger } from '@/lib/logger';
import { AppError, ValidationError } from '@/lib/errors';

export function handleApiError(error: unknown): NextResponse {
  // Handle ValidationError with field details
  if (error instanceof ValidationError) {
    logger.warn('Validation error', {
      code: error.code,
      message: error.message,
      statusCode: error.statusCode,
      fields: error.fields,
    });

    return NextResponse.json(
      {
        error: error.message,
        code: error.code,
        errors: error.fields, // Include field-level errors
      },
      { status: error.statusCode }
    );
  }

  // Handle custom AppError instances
  if (error instanceof AppError) {
    logger.warn('Application error', {
      code: error.code,
      message: error.message,
      statusCode: error.statusCode,
    });

    return NextResponse.json(
      {
        error: error.message,
        code: error.code,
      },
      { status: error.statusCode }
    );
  }

  // Handle standard errors
  if (error instanceof Error) {
    logger.error('Unexpected error', {
      message: error.message,
      stack: error.stack,
    });

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }

  // Handle unknown error types
  logger.error('Unknown error type', { error });
  return NextResponse.json(
    { error: 'Internal server error' },
    { status: 500 }
  );
}

/**
 * Wrapper for API route handlers with automatic error handling
 * Returns a function that Next.js can use as a route handler
 */
export function withErrorHandling<T extends any[]>(
  handler: (...args: T) => Promise<NextResponse>
): (...args: T) => Promise<NextResponse> {
  return async (...args: T) => {
    try {
      return await handler(...args);
    } catch (error) {
      return handleApiError(error);
    }
  };
}
