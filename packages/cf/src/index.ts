import env from "dotenv";
import Cloudflare from "cloudflare";
import fs from "fs-extra";
import path from "path";
import { execSync } from "node:child_process";
import { fileURLToPath } from "url";
import { GetApiResTYPE } from "./types/DataType.type.js";

const dotEnvPath = path.resolve(process.cwd(), "../../", ".env");
env.config({ path: dotEnvPath });

export async function deploy({
  projectName,
  domainName,
  branchName = "main",
}: {
  projectName: string;
  domainName: string;
  branchName?: string;
}): Promise<GetApiResTYPE> {
  if (!process.env.CLOUDFLARE_API_TOKEN && !process.env.CLOUDFLARE_ACCOUNT_ID) {
    throw new Error(
      "CLOUDFLARE_API_TOKEN or CLOUDFLARE_ACCOUNT_ID is missing, check .env file"
    );
  }

  const client = new Cloudflare({
    apiToken: process.env.CLOUDFLARE_API_TOKEN,
  });

  console.log("Starting deployment........... for project:", domainName);

  // delete old csv file if exists
  const __filename = fileURLToPath(import.meta.url);
  const __dirname = path.dirname(__filename);
  const turboRepoRoot = path.resolve(__dirname, "../../../");
  const deploymentReportFilePath = path.join(
    turboRepoRoot,
    "reports",
    "deploy",
    domainName,
    "deployment_data.csv"
  );

  try {
    await fs.ensureFile(deploymentReportFilePath);
    await fs.outputFile(deploymentReportFilePath, ``);
  } catch (error) {
    console.log("Error ensuring or clearing deployment report file:", error);
  }

  // check if the project exists or create a new one

  try {
    console.log("Checking if project already exists...", projectName);
    const existingProjectRes = await client.pages.projects.get(projectName, {
      account_id: process.env.CLOUDFLARE_ACCOUNT_ID!,
    });

    console.log("Project already exists. Using the existing project...");
    const { id, name, domains, subdomain } = existingProjectRes;
    await fs.outputFile(
      deploymentReportFilePath,
      `id,name,domains,subdomain,currentDomain\n${id},${name},"${Array.isArray(domains) ? domains.join(";") : ""}","${subdomain ?? ""}","not-available"\n`
    );
  } catch (error) {
    console.log("Project not found, Creating new project...");

    try {
      // ceate new project
      const newProjectRes = await client.pages.projects.create({
        name: projectName,
        account_id: process.env.CLOUDFLARE_ACCOUNT_ID!,
        production_branch: branchName,
      });

      console.log("New project created successfully...");

      // store this project data inside csv file
      const { id, name, domains, subdomain } = newProjectRes;
      await fs.outputFile(
        deploymentReportFilePath,
        `id,name,domains,subdomain\n${id},${name},"${Array.isArray(domains) ? domains.join(";") : ""}","${subdomain ?? ""}","not-available"\n`
      );
      console.log("Project data saved to CSV:", deploymentReportFilePath);
    } catch (error) {
      console.log("Creating new project failed:", error);
      return {
        SUCCESS: false,
        MESSAGE: "Creating new project failed",
      };
    }
  }

  try {
    console.log("Started uploading source code to the project...");
    // upload source code to the project
    const staticWebsitePath = path.join(
      turboRepoRoot,
      "apps",
      domainName,
      "dist"
    );
    const command = `wrangler pages deploy "${staticWebsitePath}" --project-name ${projectName} --branch ${branchName} --commit-dirty=true`;
    try {
      execSync(command, {
        stdio: "inherit",
        env: {
          ...process.env, // Inherit other environment variables from the parent process
          CLOUDFLARE_API_TOKEN: process.env.CLOUDFLARE_API_TOKEN,
          CLOUDFLARE_ACCOUNT_ID: process.env.CLOUDFLARE_ACCOUNT_ID,
        },
      });
    } catch (error) {
      console.log("Project upload failed:", error);
      return {
        SUCCESS: false,
        MESSAGE: "Project upload failed",
      };
    }

    // get the project details again to get the assigned domain
    client.pages.projects
      .get(projectName, {
        account_id: process.env.CLOUDFLARE_ACCOUNT_ID!,
      })
      .then(async (projectDetails) => {
        const { id, name, domains, subdomain, latest_deployment } =
          projectDetails;
        await fs.outputFile(
          deploymentReportFilePath,
          `id,name,domains,subdomain,currentDomain\n${id},${name},"${Array.isArray(domains) ? domains.join(";") : ""}","${subdomain ?? ""}","${latest_deployment?.url ?? ""}"\n`
        );

        console.log("Deployment report file updated with latest domain...");
        return {
          SUCCESS: true,
          MESSAGE: "Deployment initiated successfully",
        };
      })
      .catch((error) => {
        console.log(
          "Error fetching project details, writing new published domain failed"
        );
        return {
          SUCCESS: true,
          MESSAGE: "Deployment initiated successfully",
        };
      });
  } catch (error) {
    console.log("Error uploading source code:", error);
    return {
      SUCCESS: false,
      MESSAGE: "Error uploading source code",
    };
  }

  // default return 
  return {
    SUCCESS: false,
    MESSAGE: 'Deployment process failed, please check logs for more details',
  }
}

/**
 * Delete a Cloudflare Pages project and all its deployments.
 * @param cfToken Cloudflare API token
 * @param cfId Cloudflare account ID
 * @param projectName Project name (unsanitized)
 */
export async function deleteProject({ projectName }: { projectName: string }) {
  if (!process.env.CLOUDFLARE_API_TOKEN && !process.env.CLOUDFLARE_ACCOUNT_ID) {
    throw new Error(
      "CLOUDFLARE_API_TOKEN or CLOUDFLARE_ACCOUNT_ID is missing, check .env file"
    );
  }

  const client = new Cloudflare({ apiToken: process.env.CLOUDFLARE_API_TOKEN });

  console.log(`Attempting to delete project: ${projectName}`);
  try {
    // Delete the project (this also deletes all deployments)
    await client.pages.projects.delete(projectName, {
      account_id: process.env.CLOUDFLARE_ACCOUNT_ID!,
    });
    console.log(`Project '${projectName}' deleted successfully.`);
  } catch (error) {
    console.error(`Failed to delete project '${projectName}':`, error);
    throw error;
  }
}
