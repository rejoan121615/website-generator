import env from "dotenv";
import Cloudflare, { APIError } from "cloudflare";
import path from "path";
import { DeleteProjectResTYPE, GetApiResTYPE } from "../types/DataType.type.js";
import { LogBuilder } from "@repo/log-helper";
import { ReportRemover } from "@repo/report-helper";

const projectRoot = path.resolve(process.cwd(), "../../");
const dotEnvPath = path.resolve(projectRoot, ".env");
env.config({ path: dotEnvPath });

export async function deleteProject({
  projectName,
}: {
  projectName: string;
}): Promise<DeleteProjectResTYPE> {
  if (!process.env.CLOUDFLARE_API_TOKEN && !process.env.CLOUDFLARE_ACCOUNT_ID) {
    throw new Error(
      "CLOUDFLARE_API_TOKEN or CLOUDFLARE_ACCOUNT_ID is missing, check .env file"
    );
  }

  const client = new Cloudflare({ apiToken: process.env.CLOUDFLARE_API_TOKEN });
  const cfProjectName = projectName.trim().toLowerCase().replaceAll(".", "-");

  console.log(`Attempting to delete project: ${cfProjectName}`);
  try {
    // Step 1: Get project details to check for custom domains
    const projectDetails = await client.pages.projects.get(cfProjectName, {
      account_id: process.env.CLOUDFLARE_ACCOUNT_ID!,
    });

    // Step 2: Remove custom domains if they exist
    if (projectDetails.domains && projectDetails.domains.length > 0) {
      console.log(`Found ${projectDetails.domains.length} domains, removing them first...`);
      
      for (const domain of projectDetails.domains) {
        // Skip the default .pages.dev subdomain
        if (!domain.endsWith('.pages.dev')) {
          try {
            console.log(`Removing custom domain: ${domain}`);
            await client.pages.projects.domains.delete(cfProjectName, domain, {
              account_id: process.env.CLOUDFLARE_ACCOUNT_ID!,
            });
            console.log(`Successfully removed domain: ${domain}`);
          } catch (domainError) {
            console.warn(`Failed to remove domain ${domain}:`, domainError);
            // Continue with other domains even if one fails
          }
        }
      }
      
      // Wait a bit for domain removals to propagate
      console.log("Waiting for domain removals to complete...");
      await new Promise(resolve => setTimeout(resolve, 3000));
    }

    // Step 3: Delete the project (this also deletes all deployments)
    await client.pages.projects.delete(cfProjectName, {
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
      console.error(
        `Failed to remove report for project '${projectName}': ${reportRemovalResult.MESSAGE}`
      );
    }

    return {
      SUCCESS: true,
      MESSAGE: "Project deleted successfully",
      DATA: { deleted: true },
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
    

    return {
      SUCCESS: false,
      MESSAGE: "Failed to delete project",
      ERROR: error instanceof APIError ? error : undefined,
    };
  }
}