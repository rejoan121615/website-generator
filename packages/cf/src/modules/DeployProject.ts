import env from "dotenv";
import Cloudflare from "cloudflare";
import path from "path";
import { LogBuilder } from "@repo/log-helper";
import { DeployApihandler } from "./DeployApiHandler.js";
import fs from 'fs-extra';
import { GetProjectName } from "../lib/GetProjectName.js";
import { DeployResTYPE } from "../types/DataType.type.js";

const projectRoot = path.resolve(process.cwd(), "../../");
const dotEnvPath = path.resolve(projectRoot, ".env");
env.config({ path: dotEnvPath });

const cfClient = new Cloudflare({
  apiToken: process.env.CLOUDFLARE_API_TOKEN,
});

export async function DeployProject({
  domainName,
  branchName = "main",
}: {
  domainName: string;
  branchName?: string;
}): Promise<DeployResTYPE> {
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

  // check if the deployable project files exists or not
  const staticWebsiteFiles= path.join(projectRoot, "apps", domainName, "dist");

  if (!fs.existsSync(staticWebsiteFiles)) {
    LogBuilder({
      domain: domainName,
      logMessage: `Deployable project files not found at path: ${staticWebsiteFiles}`,
      logType: "fatal",
      context: { function: "deploy" },
      logFileName: "cf-deploy",
    });
    return {
      SUCCESS: false,
      MESSAGE: `Deployable project files not found at path: ${staticWebsiteFiles}`,
    };
  }


  const { projectName: cfProjectName, hasSubdomain } = GetProjectName(domainName);

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
         await cfClient.pages.projects.create({
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
          console.log("Error creating new project:", error);
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
