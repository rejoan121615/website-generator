# Website Generator - User Guide

A complete guide to installing, configuring, and using the Website Generator system to create and deploy multiple websites from CSV data.

---

## Table of Contents

1. [System Requirements](#system-requirements)
2. [Installation](#installation)
3. [Configuration](#configuration)
4. [Getting Started](#getting-started)
5. [Command Reference](#command-reference)
6. [Dashboard Usage](#dashboard-usage)
7. [CSV Data Management](#csv-data-management)
8. [Troubleshooting](#troubleshooting)
9. [Best Practices](#best-practices)

---

## System Requirements

### Software Requirements

- **Node.js**: Version 22.0.0 or higher
- **PNPM**: Version 10.0.0 or higher


---

## Installation

### Step 1: Clone the Repository

Open your terminal and run:

```bash
git clone https://github.com/rejoan121615/website-generator.git
cd website-generator
```

### Step 2: Install and Build Everything

Run the ready command to install all dependencies and build the system:

```bash
pnpm run ready
```

This command will:
- Install all packages and prepare the system for use

---

## Configuration

### Step 1: Create Environment File

Create a `.env` file in the root directory.

### Step 2: Add Required Environment Variables

Edit the `.env` file and add your Cloudflare credentials:

```env
# CLOUDFLARE_API_TOKEN=
# CLOUDFLARE_ACCOUNT_ID=
# CLOUDFLARE_EMAIL=
# WRANGLER_LOG_PATH=
# GITHUB_USERNAME=
# GITHUB_REPOSITORY=
# DEPLOYMENT_BRANCH=
```

### Step 3: Get Cloudflare Credentials

#### Get API Token:
1. Go to [Cloudflare Dashboard](https://dash.cloudflare.com/profile/api-tokens)
2. Click "Create Token"
3. Use "Custom Token" template
4. Add permissions:
   - **Zone:Zone:Read**
   - **Zone:DNS:Edit**
   - **Account:Cloudflare Pages:Edit**
5. Copy the generated token to `CLOUDFLARE_API_TOKEN`

#### Get Account ID:
1. Go to [Cloudflare Dashboard](https://dash.cloudflare.com/)
2. Select any domain
3. Look for "Account ID" in the right sidebar
4. Copy the ID to `CLOUDFLARE_ACCOUNT_ID`

### Step 4: Prepare CSV Data

Create a file named `websites.csv` inside the `data` folder and add the required columns. Make sure to use this as the header:

#### template,domain,name,service_name,address,phone,email,site_title,meta_title,meta_description,logo_url

Then add your data maintaining this column order. You can use the `sample-data.csv` file as a reference and maintain the same structure. 

**Important**: Make sure the template name exactly matches the selected template folder name inside the `templates` directory. 

---

## Getting Started

### Quick Start (5 minutes)

1. **To generate all sites from websites.csv, please run:**
   ```bash
   pnpm run generate
   ```

2. **To generate a single site, use this command. Make sure the domain exactly matches the CSV record:**
   ```bash
   pnpm run generate:single --domain <domain name>
   ```

   Example: `pnpm run generate:single --domain rejoan.com`

3. **To preview all generated websites locally, please run:**
   ```bash
   pnpm run preview
   ```

4. **To preview a single website locally, use this command. Make sure the domain exactly matches the CSV record:**
   ```bash
   pnpm run preview:single --domain <domain name>
   ```

   Example: `pnpm run preview:single --domain rejoan.com`

5. **To deploy all generated websites to Cloudflare Pages, please run:**
   ```bash
   pnpm run deploy
   ```

6. **To deploy a single website to Cloudflare Pages, use this command. Make sure the domain exactly matches the CSV record:**
   ```bash
   pnpm run deploy:single --domain <domain name>
   ```

   Example: `pnpm run deploy:single --domain rejoan.com`

7. **To undeploy all deployed websites from Cloudflare Pages, please run:**
   ```bash
   pnpm run undeploy
   ```

8. **To undeploy a single deployed website from Cloudflare Pages, use this command. Make sure the domain exactly matches the CSV record:**
   ```bash
   pnpm run undeploy:single --domain <domain name>
   ```

   Example: `pnpm run undeploy:single --domain rejoan.com`

9. **To delete all generated websites from the apps/ folder, please run:**
   ```bash
   pnpm run delete
   ```

10. **To delete a single generated website from the apps/ folder, use this command. Make sure the domain exactly matches the CSV record:**
    ```bash
    pnpm run delete:single --domain <domain name>
    ```

    Example: `pnpm run delete:single --domain rejoan.com`

11. **To open the dashboard for management, please run:**
    ```bash
    pnpm run dashboard
    ```

    Then open your browser and go to: http://localhost:3000



## Dashboard Usage

### Accessing the Dashboard

1. Start the dashboard:
   ```bash
   pnpm run dashboard
   ```

2. Open your browser and go to: http://localhost:3000

### Dashboard Features

#### Websites Page (Default)

**Overview**: Manage all websites from your CSV data

**Features**:
- **View All Websites**: See domains, templates, build status
- **Search/Filter**: Find specific websites quickly
- **Per-Website Actions**:
  - **Build**: Generate the website files
  - **Deploy**: Upload to Cloudflare Pages
  - **Remove**: Delete from Cloudflare
  - **View Details**: See all website data
  - **View Log**: Check build/deploy logs
  - **View Report**: See deployment reports

**Status Indicators**:
- 🟢 **Complete**: Operation successful
- 🔴 **Failed**: Operation failed (check logs)
- 🟡 **Processing**: Operation in progress
- ⚪ **Unavailable**: Not started yet

#### Domains Page

**Overview**: Manage custom domain connections

**Features**:
- **Domain List**: All domains from CSV with connection status
- **Connection Status**:
  - **Deploy First**: Website needs to be deployed
  - **Ready**: Can connect custom domain
  - **Processing**: Domain connection in progress
  - **Connected**: Custom domain is live
  - **Failed**: Connection failed

**Actions**:
- **Connect Domain**: Attach your custom domain to Cloudflare project
- **Check Status**: Refresh domain connection status

#### CSV Data Page

**Overview**: Manage your website data

**Features**:
- **View CSV Data**: See all rows in a table
- **Search**: Find specific entries
- **Upload CSV**: Replace or merge data
  - **Replace Mode**: Overwrite entire CSV
  - **Merge Mode**: Add new rows, update existing
- **Edit Rows**: Click any row to edit details
- **Download CSV**: Export current data

### Dashboard Tips

1. **Real-time Updates**: Build and deploy progress updates automatically
2. **Notifications**: Success/error messages appear as toasts
3. **Logs**: Always check logs if operations fail
4. **Bulk Operations**: Use command line for batch operations

---

## CSV Data Management

### CSV File Structure

Your `data/websites.csv` file controls which websites are generated. Each row creates one website.

### Required Columns

| Column | Description | Example |
|--------|-------------|---------|
| `template` | Template folder name | `base-template` |
| `domain` | Website domain | `plumber-london.co.uk` |
| `name` | Business name | `London Plumbers Ltd` |
| `service_name` | Type of service | `plumbing` |
| `address` | JSON address data | `{"street":"123 Main St","city":"London",...}` |
| `phone` | Contact phone | `020 1234 5678` |
| `email` | Contact email | `info@example.com` |
| `site_title` | Full site title | `London Plumbers in London` |
| `meta_title` | SEO title | `London's Best Plumbers` |
| `meta_description` | SEO description | `Professional plumbing in London` |
| `logo_url` | Logo filename | `company-logo.png` |

### CSV Example

```csv
template,domain,name,service_name,address,phone,email,site_title,meta_title,meta_description,logo_url
base-template,plumber-london.co.uk,London Plumbers,plumbing,"{""street"":""123 Main St"",""city"":""London"",""state"":""England"",""country"":""UK""}",020-1234-5678,info@plumber-london.co.uk,London Plumbers in London,London's Best Plumbers,Professional plumbing services in London,plumber-logo.png
```

### Address Format

The address column must be a JSON string:

```json
{
  "street": "123 Main Street",
  "city": "London",
  "state": "England", 
  "country": "UK",
  "postcode": "SW1A 1AA"
}
```

### Available Templates

Choose from these pre-built templates:

- **base-template**: General business template
- **agency-template**: Marketing agency design
- **astropie-template**: Restaurant/food business
- **idol-template**: SaaS/software product
- **kreativ-template**: Creative agency
- **preline-template**: Corporate business

