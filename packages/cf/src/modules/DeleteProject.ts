import env from "dotenv";
import Cloudflare from "cloudflare";
import path from "path";
import { GetApiResTYPE } from "../types/DataType.type.js";
import { LogBuilder } from "@repo/log-helper";
import { ReportRemover } from "@repo/report-helper";

const projectRoot = path.resolve(process.cwd(), "../../");
const dotEnvPath = path.resolve(projectRoot, ".env");
env.config({ path: dotEnvPath });

export async function deleteProject({
  projectName,
}: {
  projectName: string;
}): Promise<GetApiResTYPE> {
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
    const result = await client.pages.projects.delete(cfProjectName, {
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
    };
  }
}