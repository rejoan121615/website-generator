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

### 2. Create `websites.csv`
Create a file named `websites.csv` inside the `data` folder (`data/websites.csv`). Copy the data from `data/sample-data.csv` and paste it into `websites.csv`. Ensure the data follows CSV conventions.

### 3. Install Dependencies
First, install all dependencies using pnpm:

```bash
pnpm install
```

### 4. Generate Websites
To generate the websites, run the following command:

```bash
pnpm run generate
```

This command will handle all the necessary steps:
- Build the required packages.
- Generate the website applications based on `data/websites.csv`.
- Install dependencies for the newly created applications.
- Build the applications.

### 5. Deploy Websites
To deploy the generated websites to Cloudflare, run:

```bash
pnpm run site:deploy
```

### 6. Preview Websites Locally
To preview the generated websites locally, run:

```bash
pnpm run site:preview
```

After running this command, you can click on the URL that appears (usually something like `http://localhost:3000`). On the left side, you'll see a list of all generated sites. You can navigate through the sites using the up/down arrow keys on your keyboard.

### 7. Update Website Data
The websites are generated based on the data in `data/websites.csv`. To add or update sites, edit this file and re-run `pnpm run generate`.

### 8. Deployment Reports
All deployment reports are saved in the `reports/deploy` directory. You can find details about each deployment there.

### 9. Delete Deployed Sites
To delete the project from cloudflare just run `pnpm run site:remove`

---
If you have any issues, ensure your `.env` file is complete and all dependencies are installed.
