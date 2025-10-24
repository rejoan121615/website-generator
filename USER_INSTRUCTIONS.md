# Website Generator System - User Instructions

## Overview
This is an automated website generation and deployment system that creates multiple Astro-based static websites from CSV data and deploys them to Cloudflare Pages. The system includes a dashboard for management and monitoring.

---

## Prerequisites
- **Node.js**: Version 22.0.0 or higher
- **pnpm**: Version 10.0.0 or higher
- **Cloudflare Account**: With API access

---

## Initial Setup

### 1. Environment Configuration
Create a `.env` file in the root directory with the following variables:

```env
CLOUDFLARE_API_TOKEN=your_cloudflare_api_token
CLOUDFLARE_ACCOUNT_ID=your_cloudflare_account_id
GITHUB_USERNAME=your_github_username
GITHUB_REPOSITORY=your_github_repository
DEPLOYMENT_BRANCH=your_deployment_branch
```

**Where to get these:**
- **Cloudflare API Token**: Cloudflare Dashboard → My Profile → API Tokens → Create Token
- **Cloudflare Account ID**: Cloudflare Dashboard → Account → Account ID
- **GitHub credentials**: Your GitHub username and repository name for version control

### 2. Install Dependencies
```bash
pnpm install
```

---

## Core Functionalities

### 1. **Website Generation** (`pnpm run generate`)

**What it does:**
- Reads business data from `data/websites.csv`
- Generates complete Astro websites for each business
- Processes spintax variations in content
- Replaces tokens with business-specific data
- Optimizes images
- Creates deployment scripts
- Builds static sites ready for deployment

**CSV File Format:**
The `data/websites.csv` file must contain these columns:
- `domain`: Website domain (e.g., austindetailing.com)
- `name`: Business name
- `service_name`: Service type (e.g., electrician, plumber)
- `address`: JSON string with street, city, state, country
- `phone`: Contact phone number
- `email`: Contact email
- `site_title`: Website title
- `meta_title`: SEO meta title
- `meta_description`: SEO meta description
- `logo_url`: Logo filename (must exist in `packages/baseFrontend/public/logo/`)

**Example CSV row:**
```csv
austindetailing.com,Austin Detailing,electrician,"{""street"":""1234 Main St"",""city"":""Austin"",""state"":""TX"",""country"":""US""}",512-555-0198,contact@austindetailing.com,Austin Detailing,Austin's Premier Service,Professional services in Austin,logo.png
```

**Steps:**
1. Copy `data/sample-data.csv` to `data/websites.csv`
2. Edit `data/websites.csv` with your business data
3. Ensure logos are in `packages/baseFrontend/public/logo/`
4. Run: `pnpm run generate`

**Output:**
- Generated websites in `apps/` folder (one folder per domain)
- Build logs in `logs/{domain}/app-generator.log`
- Each website is a complete Astro project ready to deploy

---

### 2. **Website Deployment** (`pnpm run site:deploy`)

**What it does:**
- Deploys all generated websites to Cloudflare Pages
- Creates Cloudflare projects if they don't exist
- Uploads static files
- Configures custom domains
- Generates deployment reports

**Steps:**
1. Ensure websites are generated first (`pnpm run generate`)
2. Run: `pnpm run site:deploy`

**Output:**
- Websites live on Cloudflare Pages
- Deployment logs in `logs/{domain}/cloudflare.log`
- Deployment reports in `reports/{domain}/deploy/`

---

### 3. **Website Removal** (`pnpm run site:remove`)

**What it does:**
- Deletes websites from Cloudflare Pages
- Removes custom domain configurations
- Cleans up Cloudflare projects

**Steps:**
```bash
pnpm run site:remove
```

**Output:**
- Websites removed from Cloudflare
- Removal logs in `logs/{domain}/cloudflare.log`

---

### 4. **Local Preview** (`pnpm run site:preview`)

**What it does:**
- Starts local preview servers for all generated websites
- Allows you to view websites before deployment

**Steps:**
1. Run: `pnpm run site:preview`
2. Open browser to `http://localhost:4321` (or the port shown in terminal)
3. Navigate between sites using arrow keys or the site selector

---

### 5. **Dashboard** (`pnpm run dashboard`)

**What it does:**
- Opens a web-based management dashboard
- Allows you to:
  - View all websites
  - Upload/edit CSV data
  - Manage domains
  - View deployment status
  - Monitor build logs
  - Trigger deployments

**Steps:**
1. Run: `pnpm run dashboard`
2. Open browser to `http://localhost:3000`

**Dashboard Features:**
- **Websites Tab**: View all generated websites with status
- **CSV Data Tab**: Upload and edit website data
- **Domains Tab**: Manage Cloudflare domains
- **Tools Tab**: Utility functions and monitoring

---

## Log Files

The system generates detailed log files for monitoring and debugging:

### Log File Locations:
- **Generation Logs**: `logs/{domain}/app-generator.log`
- **Build Logs**: `logs/{domain}/build.log`
- **Deployment Logs**: `logs/{domain}/cloudflare.log`
- **Report Logs**: `logs/{domain}/report.log`

### Log Format:
```
2025-10-24 20:20:36 ✓ Operation successful
2025-10-24 20:20:43 ✗ Operation failed with error details
2025-10-24 20:20:50 ⚠ Warning message
```

**Icons:**
- ✓ = Success
- ✗ = Error
- ⚠ = Warning

---

## Common Workflows

### **Adding New Websites**
1. Add new rows to `data/websites.csv`
2. Add corresponding logos to `packages/baseFrontend/public/logo/`
3. Run: `pnpm run generate`
4. Review logs in `logs/` folder
5. Run: `pnpm run site:preview` (to preview locally)
6. Run: `pnpm run site:deploy` (to deploy to Cloudflare)

### **Updating Existing Websites**
1. Edit the corresponding row in `data/websites.csv`
2. Run: `pnpm run generate` (regenerates only updated sites)
3. Run: `pnpm run site:deploy` (redeploys updated sites)

### **Removing Websites**
1. Remove the row from `data/websites.csv`
2. Run: `pnpm run site:remove` (removes from Cloudflare)
3. Manually delete the folder from `apps/` if needed

---

## Troubleshooting

### **Build Failures**
- Check `logs/{domain}/build.log` for error details
- Look for syntax errors in Astro files
- Verify CSV data is properly formatted
- Ensure all required fields are filled

### **Deployment Failures**
- Check `logs/{domain}/cloudflare.log`
- Verify Cloudflare API credentials in `.env`
- Ensure domain is available in Cloudflare
- Check network connectivity

### **CSV Parsing Errors**
- Ensure CSV follows proper format
- JSON fields (like address) must be properly escaped
- No missing required columns
- No extra commas or quotes

### **Logo/Image Issues**
- Logos must exist in `packages/baseFrontend/public/logo/`
- Use supported formats: .png, .jpg, .jpeg, .svg
- Ensure file names match exactly (case-sensitive)

---

## Advanced Commands

### Development Commands:
```bash
pnpm run build:packages      # Build all packages
pnpm run dev:apps           # Run development servers
pnpm run compile:packages   # Compile packages in watch mode
```

### Specific Operations:
```bash
pnpm run site:build         # Build all websites (without generating)
pnpm run project:build      # Full project rebuild + dashboard
```

---

## System Architecture

### **Packages Overview:**

1. **app-generator**: Generates Astro projects from CSV data
2. **baseFrontend**: Template Astro project with components
3. **cf**: Cloudflare API integration for deployment
4. **dashboard**: Next.js management dashboard
5. **log-helper**: Centralized logging system
6. **report-helper**: Deployment report generation
7. **scripts**: Build and deployment scripts
8. **shared-types**: TypeScript type definitions

### **Workflow:**
```
CSV Data → app-generator → Astro Projects → Build → Deploy to Cloudflare
                              ↓
                          Log Files
                              ↓
                        Reports Generated
```

---

## Important Notes

1. **Always run `pnpm install`** after pulling new code
2. **Never commit the `.env` file** (it contains secrets)
3. **CSV data must be properly formatted** or generation will fail
4. **Check logs** if any operation fails
5. **Preview locally** before deploying to production
6. **Backup `data/websites.csv`** before major changes

---

## Support

For issues or questions:
1. Check log files in `logs/` folder
2. Review error messages in terminal
3. Consult this documentation
4. Contact the development team with:
   - Command you ran
   - Error messages from logs
   - Screenshots if applicable
