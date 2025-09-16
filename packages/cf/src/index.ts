#!/usr/bin/env node

import "dotenv/config";
import Cloudflare from "cloudflare";
import fs from "fs-extra";
import path from "path";
import { execSync } from "node:child_process";
import { fileURLToPath } from "url";

const [
  CLOUDFLARE_API_TOKEN,
  CLOUDFLARE_ACCOUNT_ID,
  projectName,
  outputDir,
  githubUserName,
  githubRepoName,
  githubDeploymentBranchName,
] = process.argv.slice(2);

if (
  !CLOUDFLARE_API_TOKEN ||
  !CLOUDFLARE_ACCOUNT_ID ||
  !projectName ||
  !outputDir ||
  !githubUserName ||
  !githubRepoName ||
  !githubDeploymentBranchName
) {
  console.log("Missing deployment parameters. Deployment failed.");
  process.exit(1);
}

const client = new Cloudflare({
  apiToken: CLOUDFLARE_API_TOKEN,
});

(async () => {
  console.log("Starting deployment........... for project:", projectName);

  // delete old csv file if exists
  const __filename = fileURLToPath(import.meta.url);
  const __dirname = path.dirname(__filename);
  const turboRepoRoot = path.resolve(__dirname, "../../../");
  const deploymentReportFilePath = path.join(
    turboRepoRoot,
    "reports",
    "deploy",
    projectName,
    "deployment_data.csv"
  );
  console.log("Deployment report file path:", deploymentReportFilePath);
  try {
    await fs.ensureFile(deploymentReportFilePath);
    await fs.outputFile(deploymentReportFilePath, ``);
  } catch (error) {
    console.log("Error ensuring or clearing deployment report file:", error);
  }

  // check if the project exists or create a new one

  try {
    const existingProjectRes = await client.pages.projects.get(projectName, {
      account_id: CLOUDFLARE_ACCOUNT_ID,
    });
    const { id, name, domains, subdomain } = existingProjectRes;
    await fs.outputFile(
      deploymentReportFilePath,
      `id,name,domains,subdomain,currentDomain\n${id},${name},"${Array.isArray(domains) ? domains.join(";") : ""}","${subdomain ?? ""}","not-available"\n`
    );
    console.log("Project already exists. Using the existing project...");
  } catch (error) {
    const { errors } = error as {
      errors: Array<{ code: number; message: string }>;
    };
    console.log(errors[0]?.message);
    console.log("Creating new project...");

    try {
      // ceate new project
      const newProjectRes = await client.pages.projects.create({
        name: projectName,
        account_id: CLOUDFLARE_ACCOUNT_ID,
        production_branch: githubDeploymentBranchName,
      });

      console.log("New project created successfully.");

      // store this project data inside csv file
      const { id, name, domains, subdomain } = newProjectRes;
      await fs.outputFile(
        deploymentReportFilePath,
        `id,name,domains,subdomain\n${id},${name},"${Array.isArray(domains) ? domains.join(";") : ""}","${subdomain ?? ""}","not-available"\n`
      );
      console.log("Project data saved to CSV:", deploymentReportFilePath);
    } catch (error) {
      console.log("Creating new project failed:", error);
      process.exit(1);
    }
  }

  try {
    console.log("Started uploading source code to the project...");
    // upload source code to the project
    const staticWebsitePath = path.join(process.cwd(), outputDir);
    execSync(
      `wrangler pages deploy "${staticWebsitePath}" --project-name ${projectName} --branch ${githubDeploymentBranchName} --commit-dirty=true`,
      {
        stdio: "inherit",
        env: {
          ...process.env, // Inherit other environment variables from the parent process
          CLOUDFLARE_API_TOKEN: CLOUDFLARE_API_TOKEN,
          CLOUDFLARE_ACCOUNT_ID: CLOUDFLARE_ACCOUNT_ID,
        },
      }
    );

    // get the project details again to get the assigned domain
    client.pages.projects
      .get(projectName, {
        account_id: CLOUDFLARE_ACCOUNT_ID,
      })
      .then(async (projectDetails) => {
        const { id, name, domains, subdomain, latest_deployment } =
          projectDetails;
        console.log(
          "Project deployed successfully. url =>",
          latest_deployment?.url
        );
        console.log("Updating deployment report file with current domain...");
        await fs.outputFile(
          deploymentReportFilePath,
          `id,name,domains,subdomain,currentDomain\n${id},${name},"${Array.isArray(domains) ? domains.join(";") : ""}","${subdomain ?? ""}","${latest_deployment?.url ?? ""}"\n`
        );
      });
  } catch (error) {
    console.log("Error uploading source code:", error);
  }
})();
