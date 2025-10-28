# Website Generator

A powerful monorepo-based system that automates the creation, building, and deployment of multiple Astro-based websites from CSV data, featuring a Next.js dashboard for management and Cloudflare Pages deployment.

## 🚀 Quick Start

```bash
# Clone the repository
git clone https://github.com/rejoan121615/website-generator.git
cd website-generator

# Install and build everything
pnpm run ready

# Start generating websites
pnpm run generate
```

## 📋 System Requirements

- **Node.js**: Version 22.0.0 or higher
- **PNPM**: Version 10.0.0 or higher
- **Git**: For cloning the repository
- **Cloudflare Account**: For website deployment

## 🛠️ Installation

### Step 1: Clone the Repository

```bash
git clone https://github.com/rejoan121615/website-generator.git
cd website-generator
```

### Step 2: Install and Build Everything

```bash
pnpm run ready
```

This command will:
- Install all packages and prepare the system for use

## ⚙️ Configuration

### Step 1: Create Environment File

Create a `.env` file in the root directory and add your Cloudflare credentials:

```env
# Required for deployment
CLOUDFLARE_API_TOKEN=your_cloudflare_api_token
CLOUDFLARE_ACCOUNT_ID=your_cloudflare_account_id

# Optional
CLOUDFLARE_EMAIL=your_email
WRANGLER_LOG_PATH=logs/wrangler.log
GITHUB_USERNAME=your_github_username
GITHUB_REPOSITORY=website-generator
DEPLOYMENT_BRANCH=main
```

### Step 2: Get Cloudflare Credentials

#### API Token:
1. Go to [Cloudflare Dashboard](https://dash.cloudflare.com/profile/api-tokens)
2. Click "Create Token" → "Custom Token"
3. Add permissions:
   - **Zone:Zone:Read**
   - **Zone:DNS:Edit**
   - **Account:Cloudflare Pages:Edit**

#### Account ID:
1. Go to [Cloudflare Dashboard](https://dash.cloudflare.com/)
2. Select any domain
3. Copy "Account ID" from the right sidebar

### Step 3: Prepare CSV Data

Create `data/websites.csv` with the required columns:

```csv
template,domain,name,service_name,address,phone,email,site_title,meta_title,meta_description,logo_url
base-template,example.com,Example Business,consulting,"{""street"":""123 Main St"",""city"":""London"",""state"":""England"",""country"":""UK""}",020-1234-5678,info@example.com,Example Business in London,London's Best Consulting,Professional consulting services in London,logo.png
```

**Note**: Template name must exactly match a folder in the `templates/` directory.

## 🎯 Available Commands

### Website Generation
```bash
# Generate all websites from CSV
pnpm run generate

# Generate a single website
pnpm run generate:single --domain example.com
```

### Preview Websites
```bash
# Preview all generated websites locally
pnpm run preview

# Preview a single website locally
pnpm run preview:single --domain example.com
```

### Deploy to Cloudflare
```bash
# Deploy all websites to Cloudflare Pages
pnpm run deploy

# Deploy a single website
pnpm run deploy:single --domain example.com
```

### Management
```bash
# Start web dashboard
pnpm run dashboard
# Access at: http://localhost:3000

# Undeploy websites from Cloudflare
pnpm run undeploy                    # All websites
pnpm run undeploy:single --domain example.com  # Single website

# Delete generated websites
pnpm run delete                      # All websites
pnpm run delete:single --domain example.com    # Single website
```

## 🖥️ Dashboard

Launch the web-based management interface:

```bash
pnpm run dashboard
```

Access at: **http://localhost:3000**

### Dashboard Features:
- **Websites Page**: Manage all websites, trigger builds/deployments
- **Domains Page**: Connect custom domains to Cloudflare projects
- **CSV Data Page**: Upload/edit website data

## 📊 CSV Data Structure

Your `data/websites.csv` controls website generation. Each row creates one website.

### Required Columns:
| Column | Description | Example |
|--------|-------------|---------|
| `template` | Template folder name | `base-template` |
| `domain` | Website domain | `example.com` |
| `name` | Business name | `Example Business` |
| `service_name` | Type of service | `consulting` |
| `address` | JSON address data | `{"street":"123 Main St",...}` |
| `phone` | Contact phone | `020-1234-5678` |
| `email` | Contact email | `info@example.com` |
| `site_title` | Full site title | `Example Business in London` |
| `meta_title` | SEO title | `London's Best Consulting` |
| `meta_description` | SEO description | `Professional consulting services` |
| `logo_url` | Logo filename | `logo.png` |

### Available Templates:
- **base-template**: General business template
- **agency-template**: Marketing agency design
- **astropie-template**: Restaurant/food business
- **idol-template**: SaaS/software product
- **kreativ-template**: Creative agency
- **preline-template**: Corporate business

## 🔄 Typical Workflow

1. **Setup**: Clone repo, run `pnpm run ready`, configure `.env`
2. **Data**: Add your websites to `data/websites.csv`
3. **Generate**: Run `pnpm run generate` to create all sites
4. **Preview**: Use `pnpm run preview` to test locally
5. **Deploy**: Run `pnpm run deploy` to publish to Cloudflare Pages
6. **Manage**: Use `pnpm run dashboard` for ongoing management

## 📁 Project Structure

```
website-generator/
├── data/                    # CSV data files
│   ├── websites.csv         # Your website data
│   └── sample-data.csv      # Example data
├── templates/               # Astro template projects
│   ├── base-template/
│   ├── agency-template/
│   └── ...
├── packages/                # Core system packages
│   ├── app-generator/       # Website generation engine
│   ├── cf/                  # Cloudflare deployment
│   ├── dashboard/           # Next.js management UI
│   └── ...
├── apps/                    # Generated websites (created by system)
├── reports/                 # Deployment reports
└── logs/                    # System logs
```

## 🔧 Advanced Features

### Spintax Content Variation
Create unique content variations using spintax syntax:
```astro
<h1>[[Professional|Expert|Certified]] {{service_name}} Services</h1>
```

### Token Replacement
Use CSV data tokens throughout templates:
```astro
<h1>Welcome to {{name}}</h1>
<p>Contact us at {{phone}} or {{email}}</p>
<p>Located in {{city}}, {{state}}</p>
```

### Weighted Spintax
Control variation probability:
```astro
[[Emergency~3|Urgent~2|Fast~1]] Service Available
```

## 🐛 Troubleshooting

### Common Issues:

1. **Template not found**: Ensure template name in CSV matches folder in `templates/`
2. **Deployment fails**: Check `.env` file has valid Cloudflare credentials
3. **Tokens not replacing**: Verify token names match CSV column names exactly
4. **Build fails**: Check logs in `logs/general/` directory

### Getting Help:
- Check `logs/general/` for detailed error logs
- View deployment reports in `reports/*/deploy/`
- Use the dashboard for visual debugging

## 📚 Documentation

- **[Complete User Guide](guidelines/USER_GUIDE.md)**: Detailed usage instructions
- **[Technical Architecture Guide](guidelines/TECHNICAL_ARCHITECTURE_GUIDE.md)**: System architecture and development
- **[Template Development Guide](guidelines/SPINTAX_AND_TOKENS_GUIDE.md)**: Creating custom templates

## 🚨 Important Notes

- **Environment Variables**: Never commit your `.env` file to version control
- **Domain Matching**: Domain names in commands must exactly match CSV entries
- **Template Names**: Template names are case-sensitive and must match folder names
- **CSV Format**: Address column must be valid JSON string

## 📞 Support

- **GitHub Repository**: [rejoan121615/website-generator](https://github.com/rejoan121615/website-generator)
- **Issues**: Report bugs or request features via GitHub Issues
- **Documentation**: Check the `guidelines/` directory for detailed guides

---

**System Version**: 1.0.0  
**Compatible with**: Node.js 22+, PNPM 10+  
**Last Updated**: January 2025
