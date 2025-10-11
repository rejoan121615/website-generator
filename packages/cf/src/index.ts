import env from "dotenv";
import Cloudflare, { CloudflareError } from "cloudflare";
import fs from "fs-extra";
import path from "path";
import { execSync } from "node:child_process";
import { fileURLToPath } from "url";
import { GetApiResTYPE } from "./types/DataType.type.js";
import { execa, ExecaError } from "execa";

const projectRoot = path.resolve(process.cwd(), "../../");
const dotEnvPath = path.resolve(projectRoot, ".env");
env.config({ path: dotEnvPath });

const cfClient = new Cloudflare({
  apiToken: process.env.CLOUDFLARE_API_TOKEN,
});

export async function deploy({
  domainName,
  branchName = "main",
}: {
  domainName: string;
  branchName?: string;
}): Promise<GetApiResTYPE> {
  if (!process.env.CLOUDFLARE_API_TOKEN && !process.env.CLOUDFLARE_ACCOUNT_ID) {
    throw new Error(
      "CLOUDFLARE_API_TOKEN or CLOUDFLARE_ACCOUNT_ID is missing, check .env file"
    );
  }

  const cfProjectName = domainName.trim().toLowerCase().replaceAll(".", "-");

  console.log("Starting deployment........... for project:", domainName);

  // check if the project exists or create a new one

  try {
    console.log("Checking if cf project already exists...", cfProjectName);
    await cfClient.pages.projects.get(cfProjectName, {
      account_id: process.env.CLOUDFLARE_ACCOUNT_ID!,
    });

    console.log("Project already exists. Using the existing project...");

    return await DeployApihandler({ domainName, cfProjectName });
  } catch (error) {
    if (error instanceof Cloudflare.APIError) {
      const { status, errors } = error;
      if (status === 404) {
        console.log("Project not found, creating a new one...");

        // ------------------ create cf new project ------------------ 
        try {
          // create new project
          const newProjectRes = await cfClient.pages.projects.create({
            name: cfProjectName,
            account_id: process.env.CLOUDFLARE_ACCOUNT_ID!,
            production_branch: branchName,
          });

          console.log("New project created successfully...");

          return await DeployApihandler({ domainName, cfProjectName });
        } catch (error) {
          return {
            SUCCESS: false,
            MESSAGE: "Creating new project failed",
          };
        }
      } else {
        return {
          SUCCESS: false,
          MESSAGE: "Error checking project",
        };
      }
    }
  }

  // default return
  return {
    SUCCESS: false,
    MESSAGE: "Deployment process failed, please check logs for more details",
  };
}

async function DeployApihandler({
  domainName,
  cfProjectName,
}: {
  domainName: string;
  cfProjectName: string;
}): Promise<GetApiResTYPE> {
  try {
    console.log("Started uploading source code to the project...");
    // upload source code to the project
    const staticWebsitePath = path.join(
      projectRoot,
      "apps",
      domainName,
      "dist"
    );

    const commandArgs = [
      "pages",
      "deploy",
      staticWebsitePath,
      "--project-name",
      cfProjectName,
      "--branch",
      "main",
      "--commit-dirty=true",
    ];

    // wrangler using execa
    const subprocess = execa("wrangler", commandArgs, {
      env: {
        ...process.env,
        CLOUDFLARE_API_TOKEN: process.env.CLOUDFLARE_API_TOKEN,
        CLOUDFLARE_ACCOUNT_ID: process.env.CLOUDFLARE_ACCOUNT_ID,
      },
    });

    // show output
    subprocess.stdout?.pipe(process.stdout);
    subprocess.stderr?.pipe(process.stderr);

    const { exitCode } = await subprocess;

    if (exitCode === 0) {
      console.log("Deployment completed successfully!");
      subprocess.kill(); // kill the subprocess

      // fetch project details
      const { id, name, domains, subdomain, latest_deployment } =
        await cfClient.pages.projects.get(cfProjectName, {
          account_id: process.env.CLOUDFLARE_ACCOUNT_ID!,
        });

      return {
        SUCCESS: true,
        MESSAGE: "Deployment initiated successfully",
        DATA: { name, domains, subdomain, latest_deployment },
      };
    } else {
      console.log("Project upload failed");
      return {
        SUCCESS: false,
        MESSAGE: "Project upload failed",
      };
    }
  } catch (error) {
    console.log("Error during deployment:", error);
    return {
      SUCCESS: false,
      MESSAGE: "Error during deployment",
    };
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
