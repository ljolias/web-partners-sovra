# Redis Operations Modules

This directory contains organized Redis operations modules, refactored from the original 1,502-line `operations.ts` file.

## Module Structure

### Core Utilities
- **helpers.ts** - Shared utility functions (`toRedisHash`, `generateId`)

### Partner & User Management
- **partners.ts** (212 lines) - Partner CRUD operations, tier management, search
- **users.ts** (35 lines) - User management operations
- **credentials.ts** (102 lines) - Partner credentials (SovraID) operations

### Business Operations
- **deals.ts** (102 lines) - Deal lifecycle management
- **quotes.ts** (81 lines) - Quote generation and versioning
- **commissions.ts** (29 lines) - Commission tracking

### Training & Certification
- **training.ts** (54 lines) - Training module operations (legacy)
- **courses.ts** (140 lines) - Training courses admin operations
- **certifications.ts** (32 lines) - Certification management

### Legal & Documents
- **legal-legacy.ts** (61 lines) - Legacy legal operations
- **documents.ts** (220 lines) - Enhanced legal document operations (V2)

### Analytics & Tracking
- **audit.ts** (127 lines) - Audit log operations
- **achievements.ts** (21 lines) - Achievement tracking
- **tierHistory.ts** (40 lines) - Tier change history
- **annualProgress.ts** (50 lines) - Annual progress tracking

### Other Services
- **sessions.ts** (31 lines) - Session management
- **copilot.ts** (45 lines) - Copilot chat operations
- **pricing.ts** (55 lines) - Pricing configuration

## Usage

All functions are re-exported through `index.ts`, so existing imports continue to work:

```typescript
// Works the same as before
import { getPartner, createDeal, updateQuote } from '@/lib/redis/operations';
```

Or import from specific modules for better code organization:

```typescript
// Import from specific module
import { getPartner, createPartner } from '@/lib/redis/operations/partners';
import { getDeal, updateDeal } from '@/lib/redis/operations/deals';
```

## Migration

The original `operations.ts` file has been:
1. Backed up to `operations.ts.backup`
2. Replaced with a simple re-export from `./operations`

No changes are required to existing code that imports from `operations.ts`.

## Benefits

- **Maintainability**: Each module focuses on a single domain
- **Performance**: Smaller files load faster in editors
- **Discoverability**: Clear module names make functions easier to find
- **Testing**: Easier to write focused unit tests per module
- **Collaboration**: Reduces merge conflicts with smaller files
