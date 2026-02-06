/**
 * Training Analytics Courses API Route
 * Provides detailed analytics for each course with sorting and pagination
 *
 * GET /api/sovra/training/analytics/courses
 *
 * Authentication: Requires sovra_admin role
 *
 * Query Parameters:
 * - sort: 'enrollments' | 'completions' | 'score' | 'dropoff' | 'name' (default: 'enrollments')
 * - order: 'asc' | 'desc' (default: 'desc')
 * - page: integer, 1-based (default: 1)
 * - limit: 10-50 (default: 20)
 *
 * Response:
 * - 200: Paginated course analytics
 * - 400: Invalid parameters
 * - 401: Not authenticated
 * - 403: Forbidden (not sovra_admin)
 * - 500: Internal server error
 */

import { NextRequest, NextResponse } from 'next/server';
import { requireSession } from '@/lib/auth/session';
import {
  getAllEnhancedCourses,
  getCourseDetailedAnalytics,
} from '@/lib/redis/training';
import type { EnhancedTrainingCourse, CourseDetailedAnalytics } from '@/types/training';

// Validation constants
const VALID_SORT_FIELDS = ['enrollments', 'completions', 'score', 'dropoff', 'name'] as const;
const VALID_ORDER_VALUES = ['asc', 'desc'] as const;
const MIN_LIMIT = 10;
const MAX_LIMIT = 50;
const DEFAULT_LIMIT = 20;
const DEFAULT_PAGE = 1;
const DEFAULT_SORT = 'enrollments';
const DEFAULT_ORDER = 'desc';

type SortField = typeof VALID_SORT_FIELDS[number];
type SortOrder = typeof VALID_ORDER_VALUES[number];

interface CourseWithAnalytics {
  courseId: string;
  title: string;
  status: string;
  enrollments: number;
  completions: number;
  completionRate: number;
  averageScore: number;
  averageTimeToComplete: number;
  moduleCount: number;
  dropoffRate: number;
}

/**
 * Calculate overall dropoff rate from module dropoff rates
 */
function calculateOverallDropoffRate(
  analytics: CourseDetailedAnalytics
): number {
  const rates = analytics.dropoffRates;
  if (!rates || rates.length === 0) return 0;

  const totalDropoff = rates.reduce((sum, r) => sum + r.dropoffRate, 0);
  return Math.round((totalDropoff / rates.length) * 10) / 10;
}

/**
 * Get the course title in English (fallback to first available language)
 */
function getCourseTitle(course: EnhancedTrainingCourse): string {
  return course.title.en || course.title.es || course.title.pt || 'Untitled';
}

/**
 * Sort courses based on field and order
 */
function sortCourses(
  courses: CourseWithAnalytics[],
  sortField: SortField,
  sortOrder: SortOrder
): CourseWithAnalytics[] {
  return [...courses].sort((a, b) => {
    let comparison = 0;

    switch (sortField) {
      case 'enrollments':
        comparison = a.enrollments - b.enrollments;
        break;
      case 'completions':
        comparison = a.completions - b.completions;
        break;
      case 'score':
        comparison = a.averageScore - b.averageScore;
        break;
      case 'dropoff':
        comparison = a.dropoffRate - b.dropoffRate;
        break;
      case 'name':
        comparison = a.title.localeCompare(b.title);
        break;
      default:
        comparison = a.enrollments - b.enrollments;
    }

    return sortOrder === 'desc' ? -comparison : comparison;
  });
}

export async function GET(request: NextRequest) {
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
        `Unauthorized analytics access attempt by user ${session.user.id} with role ${session.user.role}`
      );
      return NextResponse.json(
        { error: 'Forbidden: sovra_admin role required' },
        { status: 403 }
      );
    }

    // Step 3: Parse and validate query parameters
    const searchParams = request.nextUrl.searchParams;

    // Parse sort parameter
    const sortParam = searchParams.get('sort') || DEFAULT_SORT;
    if (!VALID_SORT_FIELDS.includes(sortParam as SortField)) {
      return NextResponse.json(
        {
          error: 'Invalid sort parameter',
          message: `sort must be one of: ${VALID_SORT_FIELDS.join(', ')}`,
        },
        { status: 400 }
      );
    }
    const sort = sortParam as SortField;

    // Parse order parameter
    const orderParam = searchParams.get('order') || DEFAULT_ORDER;
    if (!VALID_ORDER_VALUES.includes(orderParam as SortOrder)) {
      return NextResponse.json(
        {
          error: 'Invalid order parameter',
          message: `order must be one of: ${VALID_ORDER_VALUES.join(', ')}`,
        },
        { status: 400 }
      );
    }
    const order = orderParam as SortOrder;

    // Parse page parameter
    const pageParam = searchParams.get('page');
    let page = DEFAULT_PAGE;
    if (pageParam !== null) {
      const parsedPage = parseInt(pageParam, 10);
      if (isNaN(parsedPage) || parsedPage < 1) {
        return NextResponse.json(
          {
            error: 'Invalid page parameter',
            message: 'page must be a positive integer',
          },
          { status: 400 }
        );
      }
      page = parsedPage;
    }

    // Parse limit parameter
    const limitParam = searchParams.get('limit');
    let limit = DEFAULT_LIMIT;
    if (limitParam !== null) {
      const parsedLimit = parseInt(limitParam, 10);
      if (isNaN(parsedLimit) || parsedLimit < MIN_LIMIT || parsedLimit > MAX_LIMIT) {
        return NextResponse.json(
          {
            error: 'Invalid limit parameter',
            message: `limit must be between ${MIN_LIMIT} and ${MAX_LIMIT}`,
          },
          { status: 400 }
        );
      }
      limit = parsedLimit;
    }

    // Step 4: Fetch all courses
    const allCourses = await getAllEnhancedCourses();

    // Step 5: Fetch analytics for each course in parallel
    const coursesWithAnalytics: CourseWithAnalytics[] = await Promise.all(
      allCourses.map(async (course) => {
        const analytics = await getCourseDetailedAnalytics(course.id);
        const overallDropoff = calculateOverallDropoffRate(analytics);

        return {
          courseId: course.id,
          title: getCourseTitle(course),
          status: course.status,
          enrollments: analytics.enrollments,
          completions: analytics.completions,
          completionRate: analytics.completionRate,
          averageScore: analytics.averageScore,
          averageTimeToComplete: analytics.averageTimeToComplete,
          moduleCount: course.modules?.length || 0,
          dropoffRate: overallDropoff,
        };
      })
    );

    // Step 6: Apply sorting
    const sortedCourses = sortCourses(coursesWithAnalytics, sort, order);

    // Step 7: Apply pagination
    const total = sortedCourses.length;
    const totalPages = Math.ceil(total / limit);
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    const paginatedCourses = sortedCourses.slice(startIndex, endIndex);

    // Step 8: Return response
    return NextResponse.json(
      {
        courses: paginatedCourses,
        pagination: {
          page,
          limit,
          total,
          pages: totalPages,
        },
      },
      { status: 200 }
    );
  } catch (error) {
    // Catch-all error handler
    console.error('Error fetching course analytics:', error);
    return NextResponse.json(
      {
        error: 'Internal server error',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
