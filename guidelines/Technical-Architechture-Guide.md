# Technical Architecture Guide

A comprehensive technical guide explaining how the website generator system works, including architecture, packages, workflows, and the dashboard UI.

---

## Table of Contents

1. [System Overview](#system-overview)
2. [Architecture](#architecture)
3. [Package Structure](#package-structure)
4. [Core Packages](#core-packages)
5. [Command Reference](#command-reference)
6. [Dashboard UI](#dashboard-ui)
7. [Workflows](#workflows)
8. [API Endpoints](#api-endpoints)
9. [Deployment Architecture](#deployment-architecture)
10. [Data Flow](#data-flow)

---

## System Overview

The website generator is a **monorepo-based** system built with **PNPM workspaces** and **Turbo** that automates the creation, building, and deployment of multiple Astro-based websites from CSV data. It features a Next.js dashboard for managing websites, domains, and deployments to Cloudflare Pages.

### Key Technologies

- **Monorepo**: PNPM workspace with Turbo for task orchestration
- **Frontend**: Astro 5.x (templates), Next.js 15.x (dashboard)
- **Deployment**: Cloudflare Pages via Wrangler CLI
- **Database**: Prisma (dashboard data persistence)
- **Styling**: Tailwind CSS, Material-UI (dashboard)
- **Runtime**: Node.js ≥22.0.0, PNPM ≥10.0.0

---

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                      MONOREPO ROOT                          │
│  (website-generator/)                                       │
└─────────────────────────────────────────────────────────────┘
                           │
        ┌──────────────────┼──────────────────┐
        │                  │                  │
   ┌────▼────┐      ┌──────▼──────┐    ┌─────▼─────┐
   │  data/  │      │ templates/  │    │ packages/ │
   │         │      │             │    │           │
   │ CSV     │      │ 6 Astro     │    │ 9 Node    │
   │ files   │      │ templates   │    │ packages  │
   └─────────┘      └─────────────┘    └─────┬─────┘
                                              │
        ┌──────────────┬──────────────┬───────┴────────┬─────────────┐
        │              │              │                │             │
   ┌────▼─────┐  ┌────▼────┐   ┌─────▼──────┐  ┌──────▼─────┐ ┌────▼────┐
   │   app-   │  │   cf    │   │  dashboard │  │log-helper  │ │ shared- │
   │generator │  │         │   │   (Next.js)│  │            │ │  types  │
   │          │  │ Deploy  │   │            │  │  Winston   │ │         │
   └────┬─────┘  │ Manager │   │   MUI UI   │  └────────────┘ └─────────┘
        │        └────┬────┘   └─────┬──────┘
        │             │              │
        │             │              │
        ▼             ▼              ▼
   ┌────────────────────────────────────┐
   │         apps/ (Generated)          │
   │                                    │
   │  domain1.com/                      │
   │  domain2.com/                      │
   │  domain3.com/                      │
   │  ...                               │
   └────────────────────────────────────┘
                   │
                   ▼
          ┌────────────────┐
          │  Cloudflare    │
          │     Pages      │
          │                │
          │  Static Hosting│
          └────────────────┘
```

---

## Package Structure

### Workspace Configuration (`pnpm-workspace.yaml`)

```yaml
packages:
  - "apps/*"          # Generated Astro websites
  - "packages/*"      # Core functionality packages
  - "templates/*"     # Astro templates
```

### Directory Layout

```
website-generator/
├── data/                      # CSV data files
│   ├── websites.csv           # Production website data
│   ├── sample-data.csv        # Sample/test data
│   └── domains.csv            # Domain mappings
├── templates/                 # Astro template projects
│   ├── agency-template/
│   ├── astropie-template/
│   ├── base-template/
│   ├── idol-template/
│   ├── kreativ-template/
│   └── preline-template/
├── packages/                  # Core system packages
│   ├── app-generator/         # Website generation engine
│   ├── cf/                    # Cloudflare deployment
│   ├── dashboard/             # Next.js management UI
│   ├── log-helper/            # Winston logging
│   ├── report-helper/         # Report generation
│   ├── scripts/               # Build script handlers
│   ├── shared-types/          # TypeScript types
│   ├── spintax-preview/       # Spintax dev tools
│   └── typescript-config/     # Shared TS config
├── apps/                      # Generated websites (empty initially)
├── reports/                   # Deployment reports
├── logs/                      # System logs
└── guidelines/                # Documentation
```

---

## Core Packages

### 1. **@repo/app-generator**

**Purpose**: Core website generation engine

**Location**: `packages/app-generator/`

**Key Responsibilities**:
- Read CSV data from `data/websites.csv`
- Clone template projects based on `template` column
- Process spintax syntax (`[[option1|option2]]`)
- Replace tokens (`{{token_name}}`) with CSV data
- Generate unique content per domain using seedrandom
- Build project structure in `apps/domain.com/`
- Create build/preview scripts per project

**Key Modules**:
```typescript
app-generator/src/
├── index.ts                    // Main entry point, CSV parsing
├── modules/
│   ├── app-builder.ts          // Orchestrates project creation
│   ├── folder-creator.ts       // Creates directory structure
│   ├── src-code-builder.ts     // Copies & processes template files
│   ├── spintax-handler.ts      // Spintax/token processing (CORE)
│   ├── cloudflare-script-builder.ts  // CF deploy scripts
│   └── project-scripts-handler.ts    // Build scripts
├── types/
└── utilities/
```

**Package.json Scripts**:
```json
{
  "start": "node ./dist/index.js",              // Generate all websites
  "generate:single": "node ./dist/scripts/generate-single.js",  // Generate one
  "project:preview": "node ./dist/scripts/preview.js",
  "remove:all": "node ./dist/scripts/remove-all-apps.js",
  "remove:single": "node ./dist/scripts/remove-single-app.js"
}
```

**Dependencies**:
- `csv-parse`: Parse CSV files
- `seedrandom`: Deterministic random for spintax
- `sharp`: Image optimization
- `@repo/log-helper`, `@repo/shared-types`

---

### 2. **@repo/cf**

**Purpose**: Cloudflare Pages deployment manager

**Location**: `packages/cf/`

**Key Responsibilities**:
- Deploy static sites to Cloudflare Pages
- Manage Cloudflare projects via API
- Connect custom domains to deployments
- Remove/undeploy projects
- Generate deployment reports

**Key Modules**:
```typescript
cf/src/
├── index.ts                    // Export all modules
├── modules/
│   ├── DeployProject.ts        // Deploy to CF Pages
│   ├── DeleteProject.ts        // Remove CF projects
│   ├── ConnectDomain.ts        // Custom domain setup
│   ├── FetchProjects.ts        // List CF projects
│   └── FetchDomains.ts         // List CF domains
├── scripts/
│   ├── deploy-single-site.js   // Deploy one site
│   └── undeploy-single-site.js // Remove one site
└── types/
```

**Package.json Scripts**:
```json
{
  "deploy:single": "node ./dist/scripts/deploy-single-site.js",
  "undeploy:single": "node ./dist/scripts/undeploy-single-site.js"
}
```

**Dependencies**:
- `cloudflare`: CF API SDK
- `wrangler`: CF CLI tool
- `execa`: Execute shell commands
- `tldts`: Domain parsing

**Environment Variables**:
```env
CLOUDFLARE_API_TOKEN=your_token
CLOUDFLARE_ACCOUNT_ID=your_account_id
```

---

### 3. **@repo/dashboard**

**Purpose**: Next.js web UI for managing websites and deployments

**Location**: `packages/dashboard/`

**Key Responsibilities**:
- Display/manage website data from CSV
- Trigger builds, deployments, removals
- CSV upload/edit/merge operations
- Domain management and connection
- Real-time build progress via Server-Sent Events (SSE)
- Prisma database for persistent data

**Tech Stack**:
- **Framework**: Next.js 15.5.4 with Turbopack
- **UI**: Material-UI v7.3.4 (@mui/material)
- **Data Grid**: @mui/x-data-grid
- **Notifications**: Notistack
- **Database**: Prisma + PostgreSQL/SQLite
- **Styling**: Tailwind CSS v4 + Emotion

**App Structure**:
```
dashboard/app/
├── layout.tsx                  // Root layout
├── page.tsx                    // Redirects to /websites
├── websites/
│   └── page.tsx                // Website management UI
├── domains/
│   └── page.tsx                // Domain management UI
├── csv-data/
│   └── page.tsx                // CSV upload/edit UI
└── api/
    ├── websites/
    │   ├── route.ts            // GET /api/websites
    │   ├── build/route.ts      // POST /api/websites/generate (SSE)
    │   ├── deploy/route.ts     // POST /api/websites/deploy (SSE)
    │   └── remove/route.ts     // POST /api/websites/remove (SSE)
    ├── domains/
    │   ├── route.ts            // GET /api/domains
    │   └── connect/route.ts    // POST /api/domains/connect
    ├── projects/
    │   └── route.ts            // GET /api/projects
    └── csv/
        └── route.ts            // CSV operations
```

**Package.json Scripts**:
```json
{
  "dev": "next dev --turbopack",
  "build": "next build --turbopack",
  "start": "next start"
}
```

**Dependencies**:
```json
{
  "@mui/material": "^7.3.4",
  "@mui/x-data-grid": "^8.13.1",
  "@prisma/client": "^6.17.1",
  "next": "15.5.4",
  "react": "19.1.0",
  "notistack": "^3.0.2",
  "csv-parse": "^6.1.0",
  "csv-stringify": "^6.6.0",
  "axios": "^1.12.2"
}
```

---

### 4. **@repo/log-helper**

**Purpose**: Centralized logging system using Winston

**Location**: `packages/log-helper/`

**Features**:
- File-based logging to `logs/` directory
- Domain-specific log files
- Multiple log levels (info, debug, error, warn)
- Structured JSON logging

**Usage**:
```typescript
import { LogBuilder } from "@repo/log-helper";

LogBuilder({
  domain: "example.com",
  logMessage: "Starting build process",
  logType: "info",
  logFileName: "build-process"
});
```

**Dependencies**:
- `winston`: Logging library
- `fs-extra`: File operations

---

### 5. **@repo/report-helper**

**Purpose**: Generate deployment/build reports

**Location**: `packages/report-helper/`

**Features**:
- Write reports to `reports/` directory
- Domain-specific report folders
- JSON and text format reports

**Dependencies**:
- `pino`: Fast JSON logger
- `@repo/log-helper`

---

### 6. **@repo/scripts**

**Purpose**: Handle Astro project build script execution

**Location**: `packages/scripts/`

**Responsibilities**:
- Execute `pnpm install` in generated apps
- Run `astro build` commands
- Capture and log output
- Error handling for build failures

**Dependencies**:
- `execa`: Command execution
- `@repo/log-helper`

---

### 7. **@repo/shared-types**

**Purpose**: Shared TypeScript type definitions

**Location**: `packages/shared-types/`

**Key Types**:
```typescript
// CSV data structure
export type CsvRowDataType = {
  template: string;
  domain: string;
  name: string;
  service_name: string;
  address: string;  // JSON string
  phone: string;
  email: string;
  site_title: string;
  meta_title: string;
  meta_description: string;
  logo_url: string;
}

// Website row with build status
export type WebsiteRowTYPE = CsvRowDataType & {
  id: number;
  build: "complete" | "failed" | "processing" | "unavailable";
  deployed: "complete" | "failed" | "processing" | "unavailable";
  log?: string;
  report?: string;
}

// Address structure
export type CsvAddressType = {
  street: string;
  city: string;
  state: string;
  country: string;
  postcode?: string;
}

// Server-Sent Events
export type ServerEventResTYPE = {
  MESSAGE: string;
  CSV_DATA: WebsiteRowTYPE;
}
```

---

### 8. **@repo/spintax-preview**

**Purpose**: Development helper for image spintax preview

**Location**: `packages/spintax-preview/`

**Usage**:
```typescript
import { SpintaxImagePreview } from "@repo/spintax-preview";

const heroImage = SpintaxImagePreview({
  spintaxItem: [img1, img2, img3],
  previewItemIndex: 0  // Preview first image during dev
});
```

**Note**: Import automatically removed during production build

---

### 9. **@repo/typescript-config**

**Purpose**: Shared TypeScript configuration

**Location**: `packages/typescript-config/`

**File**: `base.json`

**Usage**: Extended by all packages
```json
{
  "extends": "@repo/typescript-config/base.json"
}
```

---

## Command Reference

### Root Package Scripts (`package.json`)

#### **Development & Build**

```bash
# Compile packages in watch mode
pnpm run compile

# Build all packages
pnpm run build

# Install dependencies and build everything
pnpm run ready
```

#### **Website Generation**

```bash
# Generate all websites from data/websites.csv
pnpm run generate
# Flow: Build packages → Generate apps → Install deps → Build apps

# Generate a single website (interactive prompt)
pnpm run generate:single
```

#### **Preview**

```bash
# Preview all generated websites locally
pnpm run preview

# Preview a single website (interactive prompt)
pnpm run preview:single
```

#### **Deployment**

```bash
# Deploy all websites to Cloudflare Pages
pnpm run deploy

# Deploy a single website (interactive prompt)
pnpm run deploy:single
```

#### **Removal**

```bash
# Remove all deployed sites from Cloudflare
pnpm run undeploy

# Remove a single deployed site (interactive prompt)
pnpm run undeploy:single

# Delete all generated apps from apps/ folder
pnpm run delete

# Delete a single app (interactive prompt)
pnpm run delete:single
```

#### **Dashboard**

```bash
# Start Next.js dashboard UI
pnpm run dashboard
# Opens at http://localhost:3000
```

---

## Dashboard UI

### Overview

The dashboard is a **Next.js 15** application with **Material-UI** providing a graphical interface to manage the entire website generation and deployment pipeline.

### Pages

#### 1. **Websites Page** (`/websites`)

**Features**:
- **Data Grid**: View all websites from `data/websites.csv`
- **Search**: Filter websites by domain, name, service
- **Actions per row**:
  - **Build**: Trigger website generation and Astro build
  - **Deploy**: Deploy to Cloudflare Pages
  - **Remove**: Delete from Cloudflare
  - **View Details**: Show full website data in modal
  - **View Log**: Show build logs
  - **View Report**: Show deployment report

**Real-time Updates**:
- Uses Server-Sent Events (SSE) for live build/deploy progress
- Status changes: `processing` → `complete` or `failed`
- Toast notifications (notistack) for success/error

**Table Columns**:
- Template
- Domain
- Name
- Service Name
- Build Status (chip: green/red/orange)
- Deployed Status (chip: green/red/orange)
- Actions (button group)

---

#### 2. **Domains Page** (`/domains`)

**Features**:
- **Domain List**: All domains from CSV with connection status
- **Status Indicators**:
  - `Deploy First`: Website not yet deployed to CF
  - `Ready`: Website deployed, ready to connect domain
  - `Processing`: Domain connection in progress
  - `Connected`: Custom domain successfully connected
  - `Failed`: Connection failed

**Actions**:
- **Connect Domain**: Attach custom domain to Cloudflare project
- **Check Status**: Refresh domain connection status

**Data Sources**:
- Websites from CSV
- Cloudflare projects via API
- Cloudflare domains via API

---

#### 3. **CSV Data Page** (`/csv-data`)

**Features**:
- **View CSV Data**: Display `data/websites.csv` in data grid
- **Search & Filter**: Find specific rows
- **Upload CSV**:
  - **Replace Mode**: Overwrite entire CSV
  - **Merge Mode**: Add new rows, update existing
- **Edit Rows**: Click row to view/edit in modal
- **Download CSV**: Export current data

**CSV Upload Modal**:
- Drag & drop CSV file
- Preview before upload
- Choose merge or replace strategy
- Validation: Ensures required columns exist

---

### Components

```
dashboard/components/
├── Navbar.tsx                  // Top navigation bar
├── SectionTitle.tsx            // Page section headers
├── TableControlBar.tsx         // Search bar for data grids
├── ToolsTopBar.tsx             // Action buttons (upload, download)
├── WebsiteDetailsModal.tsx     // Website data detail view
├── CsvDetailsModal.tsx         // CSV row edit modal
└── CSVUploadModal.tsx          // CSV file upload dialog
```

---

### API Routes (Next.js App Router)

#### **GET /api/websites**

**Returns**: All websites from `data/websites.csv` with build/deploy status

```typescript
Response: {
  SUCCESS: boolean;
  DATA: WebsiteRowTYPE[];
}
```

---

#### **POST /api/websites/build**

**Purpose**: Generate and build a website

**Request Body**:
```json
{
  "data": {
    "domain": "example.com",
    "template": "base-template",
    ...
  }
}
```

**Response**: Server-Sent Events (SSE) stream

```
data: {"MESSAGE":"Starting build for example.com","CSV_DATA":{...,"build":"processing"}}

data: {"MESSAGE":"Build complete","CSV_DATA":{...,"build":"complete"}}
```

**Process**:
1. Calls `@repo/app-generator` to generate website
2. Runs `pnpm install` in generated app
3. Runs `astro build`
4. Updates status and sends SSE events

---

#### **POST /api/websites/deploy**

**Purpose**: Deploy website to Cloudflare Pages

**Request Body**: Same as build

**Response**: SSE stream with deployment progress

**Process**:
1. Checks if build exists
2. Calls `@repo/cf` deployment module
3. Uploads `dist/` to Cloudflare Pages
4. Updates deployment status

---

#### **POST /api/websites/remove**

**Purpose**: Delete website from Cloudflare

**Request Body**:
```json
{
  "data": {
    "domain": "example.com"
  }
}
```

**Response**: SSE stream with removal progress

---

#### **GET /api/domains**

**Returns**: All domains from Cloudflare account

```typescript
Response: {
  SUCCESS: boolean;
  DATA: DomainDataTYPE[];
}
```

---

#### **POST /api/domains/connect**

**Purpose**: Connect custom domain to Cloudflare project

**Request Body**:
```json
{
  "domain": "example.com",
  "projectName": "example-com"
}
```

---

#### **GET /api/projects**

**Returns**: All Cloudflare Pages projects

```typescript
Response: {
  SUCCESS: boolean;
  DATA: ProjectDataTYPE[];
}
```

---

#### **POST /api/csv**

**Purpose**: Upload/replace/merge CSV data

**Request**: FormData with CSV file

**Query Params**: `?mode=replace` or `?mode=merge`

---

## Workflows

### 1. **Complete Website Generation Workflow**

```
User runs: pnpm run generate
         │
         ▼
┌────────────────────────────────────┐
│  Turbo: Build all packages         │
│  (@repo/app-generator, @repo/cf)   │
└────────┬───────────────────────────┘
         │
         ▼
┌────────────────────────────────────┐
│  @repo/app-generator/index.ts      │
│  - Read data/websites.csv          │
│  - Parse CSV rows                  │
└────────┬───────────────────────────┘
         │
         ▼ (For each CSV row)
┌────────────────────────────────────┐
│  astroProjectCreator()             │
│  1. folderCreator()                │
│     - Create apps/domain.com/      │
│  2. srcCodeBuilder()               │
│     - Copy template files          │
│     - Process spintax              │
│     - Replace tokens               │
│  3. cloudFlareScriptBuilder()      │
│     - Create deploy scripts        │
│  4. ProjectScriptsHandler()        │
│     - Create package.json          │
│     - Add build/preview scripts    │
└────────┬───────────────────────────┘
         │
         ▼
┌────────────────────────────────────┐
│  Turbo: pnpm install in apps/*     │
└────────┬───────────────────────────┘
         │
         ▼
┌────────────────────────────────────┐
│  Turbo: astro build for apps/*     │
│  - Output to apps/domain/dist/     │
└────────┬───────────────────────────┘
         │
         ▼
    ✅ Generation Complete
    Each domain has built site in apps/domain/dist/
```

---

### 2. **Single Website Deployment Workflow**

```
User clicks "Deploy" in Dashboard
         │
         ▼
┌────────────────────────────────────┐
│  POST /api/websites/deploy         │
│  - Validate domain                 │
│  - Check dist/ exists              │
└────────┬───────────────────────────┘
         │
         ▼
┌────────────────────────────────────┐
│  @repo/cf/DeployProject.ts         │
│  1. Create/verify CF project       │
│  2. Upload dist/ files             │
│  3. Trigger CF Pages build         │
└────────┬───────────────────────────┘
         │
         ▼
┌────────────────────────────────────┐
│  Generate deployment report        │
│  - Save to reports/domain/deploy/  │
└────────┬───────────────────────────┘
         │
         ▼
┌────────────────────────────────────┐
│  Send SSE to dashboard             │
│  - Update deployed: "complete"     │
│  - Show success notification       │
└────────────────────────────────────┘
         │
         ▼
    ✅ Site live at:
    https://domain.pages.dev
```

---

### 3. **Spintax & Token Processing Workflow**

```
srcCodeBuilder() processes .astro files
         │
         ▼
┌────────────────────────────────────┐
│  For each .astro file in template  │
│  1. Read file content              │
└────────┬───────────────────────────┘
         │
         ▼
┌────────────────────────────────────┐
│  parseSpintaxImagePreview()        │
│  - Convert SpintaxImagePreview()   │
│    to [[img1|img2|img3]]           │
│  - Remove import statement         │
└────────┬───────────────────────────┘
         │
         ▼
┌────────────────────────────────────┐
│  parseSpintax()                    │
│  - Find [[option1|option2]]        │
│  - Use seedrandom(domain) for      │
│    deterministic selection         │
│  - Select one option               │
│  - Support weighted: ~weight       │
└────────┬───────────────────────────┘
         │
         ▼
┌────────────────────────────────────┐
│  parseTokens()                     │
│  - Find {{token_name}}             │
│  - Replace with CSV data           │
│  - Example: {{name}} → "NYC Plumbers"│
└────────┬───────────────────────────┘
         │
         ▼
┌────────────────────────────────────┐
│  imageProcessor()                  │
│  - Remove unused image imports     │
│  - Optimize remaining images       │
└────────┬───────────────────────────┘
         │
         ▼
┌────────────────────────────────────┐
│  Write processed file to           │
│  apps/domain/src/...               │
└────────────────────────────────────┘
         │
         ▼
    ✅ Unique content per domain
```

---

### 4. **Domain Connection Workflow**

```
User clicks "Connect Domain" in Dashboard
         │
         ▼
┌────────────────────────────────────┐
│  POST /api/domains/connect         │
│  - Validate domain                 │
│  - Check project exists            │
└────────┬───────────────────────────┘
         │
         ▼
┌────────────────────────────────────┐
│  @repo/cf/ConnectDomain.ts         │
│  1. Get CF project name            │
│  2. Call CF API to attach domain   │
│  3. Return DNS instructions        │
└────────┬───────────────────────────┘
         │
         ▼
┌────────────────────────────────────┐
│  Dashboard shows:                  │
│  - CNAME record to add             │
│  - Status: "Processing"            │
└────────┬───────────────────────────┘
         │
         ▼ (User updates DNS)
┌────────────────────────────────────┐
│  CF validates DNS                  │
│  - Issues SSL certificate          │
│  - Status → "Connected"            │
└────────────────────────────────────┘
         │
         ▼
    ✅ Custom domain live
    https://custom-domain.com
```

---

## Deployment Architecture

### Cloudflare Pages Deployment

```
apps/domain.com/dist/
         │
         │ (Uploaded via Wrangler)
         ▼
┌────────────────────────────────────┐
│  Cloudflare Pages                  │
│                                    │
│  Project Name: domain-com          │
│  Branch: production                │
│  Build Output: dist/               │
└────────┬───────────────────────────┘
         │
         ▼
┌────────────────────────────────────┐
│  Generated URLs:                   │
│  - domain-com.pages.dev            │
│  - custom-domain.com (if connected)│
└────────────────────────────────────┘
         │
         ▼
┌────────────────────────────────────┐
│  Global CDN Distribution           │
│  - SSL/TLS automatic               │
│  - DDoS protection                 │
│  - Edge caching                    │
└────────────────────────────────────┘
```

### Project Naming Convention

```typescript
// Example: miami.plumbersbow.co.uk
// CF Project Name: miami-plumbersbow-co-uk

function getProjectName(domain: string): string {
  return domain.replace(/\./g, "-");
}
```

---

## Data Flow

### CSV → Website Generation

```
data/websites.csv
template,domain,name,service_name,...
base-template,plumber.com,NYC Plumbers,plumbing,...
         │
         ▼
┌────────────────────────────────────┐
│  CSV Parser (csv-parse)            │
│  - Read file                       │
│  - Parse rows                      │
│  - Validate columns                │
└────────┬───────────────────────────┘
         │
         ▼
┌────────────────────────────────────┐
│  CsvRowDataType[]                  │
│  {                                 │
│    template: "base-template",      │
│    domain: "plumber.com",          │
│    name: "NYC Plumbers",           │
│    ...                             │
│  }                                 │
└────────┬───────────────────────────┘
         │
         ▼ (For each row)
┌────────────────────────────────────┐
│  astroProjectCreator()             │
│  - Clone template                  │
│  - Process spintax with seedrandom │
│  - Replace tokens                  │
└────────┬───────────────────────────┘
         │
         ▼
apps/plumber.com/
├── src/
│   ├── pages/
│   │   └── index.astro  ← {{name}} → "NYC Plumbers"
│   │                      [[Pro|Expert]] → "Pro" (seeded)
│   └── components/
├── public/
├── dist/  (after build)
└── package.json
```

---

### Dashboard → API → Packages

```
Dashboard UI (Next.js)
         │
         │ (User clicks "Build")
         ▼
POST /api/websites/build
{
  data: {
    domain: "plumber.com",
    template: "base-template",
    ...
  }
}
         │
         ▼
┌────────────────────────────────────┐
│  API Route Handler                 │
│  - Create SSE stream               │
│  - Import @repo/app-generator      │
└────────┬───────────────────────────┘
         │
         ▼
┌────────────────────────────────────┐
│  @repo/app-generator               │
│  astroProjectCreator(data)         │
│  - Generate files                  │
│  - Log progress                    │
└────────┬───────────────────────────┘
         │
         │ (Send SSE events)
         ▼
Dashboard receives:
data: {"MESSAGE":"Creating folders","CSV_DATA":{...,"build":"processing"}}
data: {"MESSAGE":"Processing spintax","CSV_DATA":{...,"build":"processing"}}
data: {"MESSAGE":"Build complete","CSV_DATA":{...,"build":"complete"}}
         │
         ▼
Dashboard updates UI:
- Build status chip: green
- Toast notification: "Build successful"
- Enable "Deploy" button
```

---

## Environment Variables

### Required `.env` File (Root)

```env
# Cloudflare
CLOUDFLARE_API_TOKEN=your_cloudflare_api_token
CLOUDFLARE_ACCOUNT_ID=your_cloudflare_account_id

# Optional: GitHub integration
GITHUB_USERNAME=your_github_username
GITHUB_REPOSITORY=your_github_repository
DEPLOYMENT_BRANCH=main
```

### Dashboard Environment (`.env.local` in `packages/dashboard/`)

```env
# Database (Prisma)
DATABASE_URL="postgresql://user:password@localhost:5432/dashboard"

# Or SQLite for development
DATABASE_URL="file:./dev.db"
```

---

## Logging & Reporting

### Log Files

```
logs/
└── general/
    ├── astro-generator.log      # Generation logs
    ├── build-process.log        # Build logs
    └── deployment.log           # Deployment logs
```

### Reports

```
reports/
└── domain.com/
    └── deploy/
        ├── deployment-report.json
        └── deployment-summary.txt
```

---

## Error Handling

### Build Failures

```typescript
// In app-generator
try {
  await srcCodeBuilder(data);
} catch (error) {
  LogBuilder({
    domain: data.domain,
    logMessage: `Build failed: ${error.message}`,
    logType: "error",
    logFileName: "astro-generator"
  });
  
  return {
    SUCCESS: false,
    MESSAGE: "Build failed",
    DATA: { error: error.message }
  };
}
```

### Dashboard Error Display

- **Build Errors**: Status chip turns red, log button shows error details
- **Deploy Errors**: Toast notification with error message
- **CSV Errors**: Validation errors shown in upload modal

---

## Performance Considerations

### Parallel Processing

```typescript
// Turbo runs builds in parallel for multiple apps
turbo run build --filter="./apps/*"

// Dashboard: Parallel API calls
const [websites, domains, projects] = await Promise.all([
  axios.get('/api/websites'),
  axios.get('/api/domains'),
  axios.get('/api/projects')
]);
```

### Caching

```json
// turbo.json
{
  "tasks": {
    "build": {
      "outputs": ["dist/**"],
      "cache": false  // Disabled for dynamic content
    }
  }
}
```

### Optimization

- **Spintax**: Seedrandom ensures deterministic but unique output per domain
- **Images**: Sharp optimizes images during build
- **Cloudflare**: Global CDN caching for deployed sites

---

## Security

### API Token Protection

- `.env` file in `.gitignore`
- Tokens never exposed to client
- Server-side API calls only

### Dashboard Authentication

**Note**: Currently no authentication implemented. Add middleware for production:

```typescript
// packages/dashboard/middleware.ts
export function middleware(req: NextRequest) {
  // Add auth check
}
```

### Domain Validation

```typescript
// Validate domain format before deployment
function isValidDomain(domain: string): boolean {
  return /^[a-zA-Z0-9][a-zA-Z0-9-]{0,61}[a-zA-Z0-9]?\.[a-zA-Z]{2,}$/.test(domain);
}
```

---

## Troubleshooting

### Common Issues

#### 1. **Build Fails: Template not found**

**Cause**: `template` column in CSV doesn't match folder in `templates/`

**Solution**: Ensure template name matches exactly
```csv
base-template  ✅
base_template  ❌
baseTemplate   ❌
```

#### 2. **Spintax Not Processing**

**Cause**: Spintax in `<script>` or `<style>` tags

**Solution**: Only use spintax in HTML/Astro template sections

#### 3. **Token Showing as {{token}}**

**Cause**: Token name doesn't match CSV column

**Solution**: Verify CSV column names match token names exactly (case-sensitive)

#### 4. **Deployment Fails: CLOUDFLARE_API_TOKEN not set**

**Cause**: Missing `.env` file

**Solution**: Create `.env` in root with required variables

#### 5. **Dashboard: Cannot connect to database**

**Cause**: Prisma not initialized

**Solution**:
```bash
cd packages/dashboard
npx prisma generate
npx prisma migrate dev
```

---

## Development Tips

### Adding a New Template

1. Create template folder in `templates/`:
   ```bash
   cd templates/
   pnpm create astro@latest my-new-template
   ```

2. Add spintax/tokens to `.astro` files

3. Test with single generation:
   ```bash
   pnpm run generate:single
   # Choose your new template
   ```

### Debugging Generation

Enable detailed logs:
```typescript
// In app-generator/src/modules/app-builder.ts
LogBuilder({
  domain: data.domain,
  logMessage: `Step: ${currentStep}`,
  logType: "debug",  // Change to "debug" for verbose
  logFileName: "astro-generator"
});
```

View logs:
```bash
tail -f logs/general/astro-generator.log
```

### Testing Dashboard Locally

```bash
cd packages/dashboard
pnpm run dev

# Open http://localhost:3000
```

---

## Technology Stack Summary

| Component | Technology | Version | Purpose |
|-----------|-----------|---------|---------|
| **Monorepo** | PNPM Workspaces | 10.17.1 | Package management |
| **Build System** | Turbo | 2.5.6 | Task orchestration |
| **Templates** | Astro | 5.x | Static site generator |
| **Dashboard** | Next.js | 15.5.4 | Management UI |
| **UI Library** | Material-UI | 7.3.4 | Dashboard components |
| **Database** | Prisma | 6.17.1 | Dashboard persistence |
| **Deployment** | Cloudflare Pages | - | Static hosting |
| **CLI Tool** | Wrangler | 4.42.2 | CF deployment |
| **Logging** | Winston | 3.18.3 | File logging |
| **CSV Parsing** | csv-parse | 6.1.0 | Data processing |
| **Styling** | Tailwind CSS | 4.x | CSS framework |
| **Image Opt** | Sharp | 0.34.4 | Image processing |
| **Runtime** | Node.js | ≥22.0.0 | JavaScript runtime |

---

## Conclusion

This system provides a complete pipeline from CSV data to deployed websites:

1. **Data**: Define websites in CSV
2. **Generation**: Automated project creation with spintax/tokens
3. **Build**: Astro compiles to static files
4. **Deployment**: Cloudflare Pages hosting
5. **Management**: Dashboard UI for operations
6. **Monitoring**: Logs and reports for tracking

The modular architecture allows easy extension and customization of each component.

---

**Last Updated**: January 2025  
**System Version**: 1.0.0
