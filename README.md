## Website Generator - Client Instructions

Follow these steps to set up and generate your websites:

### 1. Create a `.env` File
Create a file named `.env` in the root of this project. Add all required API keys and configuration values to this file. Example:

Add the following environment variables to your `.env` file, replacing the placeholder values with your actual credentials and API keys:

```
CLOUDFLARE_API_TOKEN=your_cloudflare_api_token
CLOUDFLARE_ACCOUNT_ID=your_cloudflare_account_id
GITHUB_USERNAME=your_github_username
GITHUB_REPOSITORY=your_github_repository
DEPLOYMENT_BRANCH=your_deployment_branch

API_KEY=your_api_key_here
ANOTHER_SECRET=your_secret_here
# Add all other required environment variables
```

**Note:**  
- Never share your `.env` file or its contents publicly.
- Make sure all required variables are filled in before proceeding.
- If you are unsure about any value, contact your project administrator.

### 2. Install Dependencies
First, install all dependencies using pnpm:

```bash
pnpm install
```

### 3. Generate and Deploy Websites
To generate and deploy the websites, run the following command:

```bash
pnpm run generate
```

This single command will handle all the necessary steps:
- Build the required packages.
- Generate the website applications based on `data/websites.csv`.
- Install dependencies for the newly created applications.
- Build the applications.
- Deploy the final sites to Cloudflare.


### 4. Update Website Data
The websites are generated based on the data in `data/websites.csv`. To add or update sites, edit this file and re-run `pnpm run generate`.

### 5. Deployment Reports
All deployment reports are saved in the `reports/deploy` directory. You can find details about each deployment there.

### 6. Delete Deployed Sites
To delete the project from cloudflare just run `pnpm run site:remove`

---
If you have any issues, ensure your `.env` file is complete and all dependencies are installed.
