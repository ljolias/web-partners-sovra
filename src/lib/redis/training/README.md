# Training System Redis Analytics - Module Organization

This directory contains the modular implementation of the Training System Redis Analytics, split from the original monolithic `training.ts` file (1,240 lines) into organized, maintainable modules.

## Directory Structure

```
training/
├── README.md                 # This file
├── index.ts                  # Main entry point - re-exports all modules
├── types.ts                  # Type definitions and interfaces
├── keys.ts                   # Redis key generators and cache TTL constants
├── helpers.ts                # Utility functions (parsing, date ranges, etc.)
├── enrollments.ts            # Course enrollment and progress operations
├── analytics.ts              # Module dropoff rate analytics
├── timeseries.ts             # Time series data (daily enrollments/completions)
├── certifications.ts         # Certification management
├── credentials.ts            # Credential claim analytics
├── courses.ts                # Course analytics and overview metrics
└── enhanced.ts               # Enhanced course format mapping functions
```

## Module Breakdown

### 1. **types.ts** (Type Definitions)
Exports all TypeScript interfaces:
- `ModuleDropoffRate`
- `CourseDetailedAnalytics`
- `TimeSeriesDataPoint`
- `CredentialClaimAnalytics`
- `TrainingOverviewMetrics`
- `EnhancedTrainingProgress`
- `ModuleProgress`
- `TrainingCertificationRecord`

### 2. **keys.ts** (Redis Key Generators)
Exports the `trainingKeys` object with all Redis key generators:
- Course enrollments/completions
- Module enrollments/completions
- User progress tracking
- Time series data
- Certification tracking
- Cache keys

Also exports `CACHE_TTL` constants.

### 3. **helpers.ts** (Utility Functions)
Private helper functions used across modules:
- `safeParseNumber()` - Safe number parsing from Redis
- `safeParseJSON()` - Safe JSON parsing with fallback
- `getDateRange()` - Generate date arrays
- `calculatePercentage()` - Safe percentage calculation
- `getLocalizedName()` - Extract localized strings

### 4. **enrollments.ts** (Enrollment Operations)
Course enrollment and user progress functions:
- `getCourseEnrollments()` - Get enrolled user IDs
- `getCourseEnrollmentCount()` - Count enrollments
- `getCourseCompletions()` - Get completion user IDs
- `getCourseCompletionCount()` - Count completions
- `getUserCourseProgressData()` - Get user progress
- `recordEnrollment()` - Record new enrollment
- `recordCompletion()` - Record course completion
- `recordModuleStart()` - Record module start
- `recordModuleCompletion()` - Record module completion
- `saveUserCourseProgress()` - Save/update progress

### 5. **analytics.ts** (Dropoff Analytics)
Module dropoff rate calculations:
- `getModuleDropoffRate()` - Calculate single module dropoff
- `getCourseModuleDropoffRates()` - Get all module dropoff rates

### 6. **timeseries.ts** (Time Series Analytics)
Daily enrollment and completion tracking:
- `getDailyEnrollmentCounts()` - Daily enrollment counts
- `getDailyCompletionCounts()` - Daily completion counts
- `getEnrollmentTimeSeries()` - Enrollment time series with fallback
- `getCompletionTimeSeries()` - Completion time series with fallback

### 7. **certifications.ts** (Certification Management)
Training certification CRUD operations:
- `getAllTrainingCertifications()` - Get all certifications
- `getCredentialStats()` - Get certification statistics
- `issueTrainingCertification()` - Issue new certification
- `updateCertificationStatus()` - Update certification status

### 8. **credentials.ts** (Credential Analytics)
Credential claim pattern analysis:
- `getCredentialClaimAnalytics()` - Comprehensive claim analytics

### 9. **courses.ts** (Course Analytics)
Detailed course analytics and overview:
- `getCourseDetailedAnalytics()` - Detailed course metrics
- `calculateAverageCompletion()` - Average completion rate
- `getTrainingOverviewMetrics()` - System-wide overview
- `invalidateAllTrainingCaches()` - Clear all caches
- `invalidateCourseCache()` - Clear specific course cache

### 10. **enhanced.ts** (Enhanced Course Functions)
Legacy to enhanced format mapping:
- `getAllEnhancedCourses()` - Get courses in enhanced format
- `getEnhancedCoursesByStatus()` - Filter by status

## Usage

Import from the main training module (backward compatible):

```typescript
import {
  getCourseEnrollments,
  getCourseDetailedAnalytics,
  getCredentialClaimAnalytics,
  trainingKeys,
} from '@/lib/redis/training';
```

Or import specific modules:

```typescript
import { getCourseEnrollments } from '@/lib/redis/training/enrollments';
import { getCourseDetailedAnalytics } from '@/lib/redis/training/courses';
```

## Migration Notes

The original `training.ts` file has been:
1. Backed up to `training.ts.backup`
2. Replaced with a simple re-export from `./training/index.ts`

All existing imports will continue to work without changes, ensuring backward compatibility.

## Benefits of Modular Structure

1. **Maintainability** - Easier to locate and modify specific functionality
2. **Readability** - Smaller, focused files are easier to understand
3. **Testability** - Individual modules can be tested in isolation
4. **Collaboration** - Reduced merge conflicts with separate files
5. **Performance** - Tree-shaking can remove unused modules
6. **Organization** - Clear separation of concerns
