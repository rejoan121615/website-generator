import env from "dotenv";
import Cloudflare from "cloudflare";
import path from "path";
import { DomainResTYPE, ProjectsResTYPE } from "../types/DataType.type.js";
import { LogBuilder } from "@repo/log-helper";


const projectRoot = path.resolve(process.cwd(), "../../");
const dotEnvPath = path.resolve(projectRoot, ".env");
env.config({ path: dotEnvPath });

const cfClient = new Cloudflare({
  apiToken: process.env.CLOUDFLARE_API_TOKEN,
});


export async function FetchProjects(): Promise<ProjectsResTYPE> {
  try {
    let { result } = await cfClient.pages.projects.list({
        account_id: process.env.CLOUDFLARE_ACCOUNT_ID!,
    });

    LogBuilder({
      domain: "general",
      logMessage: `Successfully fetched projects` ,
      logType: "info",
      context: { function: "FetchProjects", result },
      logFileName: "cloudflare",
    });
    return {
      SUCCESS: true,
      MESSAGE: "Projects fetched successfully",
      DATA: result,
    };

  } catch (error) {
    const apiError = error instanceof Cloudflare.APIError ? error : undefined;
    LogBuilder({
      domain: "general",
      logMessage: `Failed to fetch projects: ${apiError?.message || error}`,
      logType: "error",
      context: { function: "FetchProjects" },
      logFileName: "cloudflare",
      error: error instanceof Error ? error : undefined,
    });
    return {
      SUCCESS: false,
      MESSAGE: "Failed to fetch domains",
      ERROR: apiError,
    };
  }
}
