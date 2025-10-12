import env from "dotenv";
import Cloudflare from "cloudflare";
import path from "path";
import { GetApiResTYPE } from "./types/DataType.type.js";
import { execa } from "execa";
import { LogBuilder } from "@repo/log-helper";
import { ReportBuilder, ReportRemover } from "@repo/report-helper";

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
    LogBuilder({
      domain: domainName,
      logMessage: "CLOUDFLARE_API_TOKEN or CLOUDFLARE_ACCOUNT_ID is missing",
      logType: "fatal",
      context: { function: "deploy" },
      logFileName: "cf-deploy",
    });
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
    LogBuilder({
      domain: domainName,
      logMessage: "Using existing project for deployment",
      logType: "info",
      context: { function: "deploy" },
      logFileName: "cf-deploy",
    });

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

          LogBuilder({
            domain: domainName,
            logMessage: "New project created successfully",
            logType: "info",
            context: { function: "deploy" },
            logFileName: "cf-deploy",
          });

          return await DeployApihandler({ domainName, cfProjectName });
        } catch (error) {
          LogBuilder({
            domain: domainName,
            logMessage: "Creating new project failed",
            logType: "error",
            context: { function: "deploy" },
            logFileName: "cf-deploy",
            error: error instanceof Error ? error : undefined,
          });
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

    const { exitCode, stack } = await subprocess;

    if (exitCode === 0) {
      console.log("Deployment completed successfully!");
      subprocess.kill(); // kill the subprocess
      LogBuilder({
        domain: domainName,
        logMessage: "Deployment complete",
        logType: "info",
        context: { function: "DeployApihandler" },
        logFileName: "cf-deploy",
      });
      // fetch project details
      const { id, name, domains, subdomain, latest_deployment } =
        await cfClient.pages.projects.get(cfProjectName, {
          account_id: process.env.CLOUDFLARE_ACCOUNT_ID!,
        });

      if (latest_deployment && latest_deployment.url) {
        ReportBuilder({
          domain: domainName,
          CfProjectName: name,
          liveUrl: latest_deployment.url,
          fileName: "deploy",
        });
      }

      return {
        SUCCESS: true,
        MESSAGE: "Deployment initiated successfully",
        DATA: { name, domains, subdomain, latest_deployment },
      };
    } else {
      console.log("Project upload failed");
      LogBuilder({
        domain: domainName,
        logMessage: "Project upload failed",
        logType: "error",
        context: { function: "DeployApiHandler" },
        logFileName: "cf-deploy",
        error: stack,
      });
      return {
        SUCCESS: false,
        MESSAGE: "Project upload failed",
      };
    }
  } catch (error) {
    console.log("Error during deployment:", error);
    LogBuilder({
      domain: domainName,
      logMessage: "Error during deployment",
      logType: "error",
      context: { function: "DeployApiHandler" },
      logFileName: "cf-deploy",
      error: error instanceof Error ? error : undefined,
    });
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
export async function deleteProject({ projectName }: { projectName: string }) : Promise<GetApiResTYPE> {
  if (!process.env.CLOUDFLARE_API_TOKEN && !process.env.CLOUDFLARE_ACCOUNT_ID) {
    throw new Error(
      "CLOUDFLARE_API_TOKEN or CLOUDFLARE_ACCOUNT_ID is missing, check .env file"
    );
  }

  const client = new Cloudflare({ apiToken: process.env.CLOUDFLARE_API_TOKEN });
  const cfProjectName = projectName.trim().toLowerCase().replaceAll(".", "-");

  console.log(`Attempting to delete project: ${cfProjectName}`);
  try {
    // Delete the project (this also deletes all deployments)
    const result  = await client.pages.projects.delete(cfProjectName, {
      account_id: process.env.CLOUDFLARE_ACCOUNT_ID!,
    });

    LogBuilder({
      domain: projectName,
      logMessage: "Project deleted successfully",
      logType: "info",
      context: { function: "deleteProject" },
      logFileName: "undeploy",
    });

    console.log(`Project '${projectName}' deleted successfully.`);

    // remove report
    const reportRemovalResult = await ReportRemover({ domain: projectName });
    if (!reportRemovalResult.SUCCESS) {
      console.error(`Failed to remove report for project '${projectName}': ${reportRemovalResult.MESSAGE}`);
    }

    return {
      SUCCESS: true,
      MESSAGE: "Project deleted successfully",
    };
  } catch (error) {

    LogBuilder({
      domain: projectName,
      logMessage: "Failed to delete project",
      logType: "error",
      context: { function: "deleteProject" },
      logFileName: "undeploy",
      error: error instanceof Error ? error : undefined,
    });

    console.error(`Failed to delete project '${projectName}':`, error);
    return {
      SUCCESS: false,
      MESSAGE: "Failed to delete project",
    }
  }
}
