import path from "path";
import env from "dotenv";
import Cloudflare, { APIError } from "cloudflare";
import { CheckDomainStatusResTYPE } from "../types/DataType.type.js";
import { LogBuilder } from "@repo/log-helper";

const projectRoot = path.resolve(process.cwd(), "../../");
const dotEnvPath = path.resolve(projectRoot, ".env");

env.config({ path: dotEnvPath });

export async function CheckDomainStatus({
  projectName,
  domainName,
}: {
  projectName: string;
  domainName: string;
}) : Promise<CheckDomainStatusResTYPE> {
  if (!process.env.CLOUDFLARE_API_TOKEN || !process.env.CLOUDFLARE_ACCOUNT_ID) {
    return {
      SUCCESS: false,
      MESSAGE: "Missing Cloudflare credentials",
    };
  }

  const client = new Cloudflare({
    apiToken: process.env.CLOUDFLARE_API_TOKEN,
  });

  try {
    const domainStatus = await client.pages.projects.domains.get(
      projectName,
      domainName,
      {
        account_id: process.env.CLOUDFLARE_ACCOUNT_ID,
      }
    );

    if (domainStatus) {
      LogBuilder({
        domain: projectName || "general",
        logMessage: `Domain status fetched successfully for ${domainName}`,
        logType: "info",
        context: { function: "CheckDomainStatus", domainName, status: domainStatus },
        logFileName: "cloudflare",
      });
      return {
        SUCCESS: true,
        MESSAGE: "Domain status fetched successfully",
        DATA: domainStatus
      };
    }

    LogBuilder({
      domain: projectName || "general",
      logMessage: `Domain not found: ${domainName}`,
      logType: "warn",
      context: { function: "CheckDomainStatus", domainName },
      logFileName: "cloudflare",
    });
    return {
      SUCCESS: false,
      MESSAGE: "Domain not found",
    };
  } catch (error) {
    const err = error instanceof APIError ? error : null;
    LogBuilder({
      domain: projectName || "general",
      logMessage: err ? `Failed to check domain status: ${err.message}` : `Failed to check domain status: ${error}`,
      logType: "error",
      context: { function: "CheckDomainStatus", domainName },
      logFileName: "cloudflare",
      error: error instanceof Error ? error : undefined,
    });
    return {
      SUCCESS: false,
      MESSAGE: err ? err.message : "Failed to check domain status",
      ERROR: err || undefined,
    };
  }
}
