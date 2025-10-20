# @repo/shared-types

A TypeScript types package for sharing common types across all packages in the monorepo.

## Purpose

This package contains shared TypeScript type definitions that can be used across all packages in the workspace to ensure type consistency and reduce duplication.

## Installation

In any package within this monorepo, add the dependency:

```json
{
  "devDependencies": {
    "@repo/shared-types": "workspace:*"
  }
}
```

## Usage

Import the types you need:

```typescript
// Import specific types
import { ApiResponse, BuildStatus, Website, Domain } from '@repo/shared-types';

// Import all website-related types
import { WebsiteData, WebsiteRow, CsvRowData } from '@repo/shared-types';

// Import all domain-related types
import { Domain, DomainTableData, ConnectDomainResponse } from '@repo/shared-types';

// Import all project-related types
import { Project, ProjectData, BuildConfig } from '@repo/shared-types';
```

## Available Types

### Common Types
- `ApiResponse<T>` - Standard API response wrapper
- `PaginatedResponse<T>` - Paginated API responses
- `BuildStatus` - Build status enum
- `DeployStatus` - Deploy status enum
- `DomainStatus` - Domain status enum
- `ConnectionStatus` - Connection status enum
- `Address` - Address interface
- `BaseEntity` - Base entity with common fields
- `Notification` - Notification interface
- `AppConfig` - Application configuration

### Website Types
- `WebsiteData` - Basic website data
- `Website` - Full website entity
- `CsvRowData` - CSV row structure
- `WebsiteRow` - Website row with build/deploy status
- `WebsiteApiResponse` - API response for websites

### Domain Types
- `Domain` - Domain entity
- `DomainTableData` - Domain table display data
- `DomainApiResponse` - API response for domains
- `ConnectDomainResponse` - Domain connection response
- `DomainConnection` - Domain connection data

### Project Types
- `Project` - Full project entity
- `ProjectData` - Basic project data
- `ProjectApiResponse` - API response for projects
- `BuildConfig` - Build configuration
- `DeployConfig` - Deploy configuration
- `ServerEventResponse` - Server-sent events

## Development

### Build the package
```bash
cd packages/shared-types
npm run build
```

### Watch for changes
```bash
npm run dev
```

### Type checking
```bash
npm run typecheck
```

## Adding New Types

1. Add your types to the appropriate file in `src/types/` or create a new file
2. Export them from `src/index.ts`
3. Run `npm run build` to generate the compiled types
4. The types will be available for import in other packages

## File Structure

```
src/
├── index.ts              # Main export file with common types
├── types/
│   ├── website.ts        # Website-related types
│   ├── domain.ts         # Domain-related types
│   └── project.ts        # Project-related types
```

## Examples

### Using in API responses
```typescript
import { ApiResponse, Website } from '@repo/shared-types';

async function getWebsites(): Promise<ApiResponse<Website[]>> {
  const response = await fetch('/api/websites');
  return response.json();
}
```

### Using in React components
```typescript
import { Website, BuildStatus } from '@repo/shared-types';

interface WebsiteCardProps {
  website: Website;
}

function WebsiteCard({ website }: WebsiteCardProps) {
  const isBuilt = website.build === 'complete';
  // ...
}
```

### Using in form validation
```typescript
import { CsvRowData } from '@repo/shared-types';

function validateCsvRow(row: CsvRowData): boolean {
  return !!(row.domain && row.name && row.service_name);
}
```