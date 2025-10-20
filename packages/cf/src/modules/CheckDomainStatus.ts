import path from "path";
import env from "dotenv";
import Cloudflare, { APIError } from "cloudflare";
import { CheckDomainStatusResTYPE } from "../types/DataType.type.js";

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
      return {
        SUCCESS: true,
        MESSAGE: "Domain status fetched successfully",
        DATA: domainStatus
      };
    }

    return {
      SUCCESS: false,
      MESSAGE: "Domain not found",
    };
  } catch (error) {
    const err = error instanceof APIError ? error : null;
    return {
      SUCCESS: false,
      MESSAGE: err ? err.message : "Failed to check domain status",
      ERROR: err || undefined,
    };
  }
}
