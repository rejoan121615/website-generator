import path from "path";
import env from "dotenv";
import Cloudflare, { APIError } from "cloudflare";
import { DomainGetResponse } from "cloudflare/resources/pages/projects.mjs";

const projectRoot = path.resolve(process.cwd(), "../../");
const dotEnvPath = path.resolve(projectRoot, ".env");

env.config({ path: dotEnvPath });

export async function CheckDomainStatus({
  projectName,
  domainName,
}: {
  projectName: string;
  domainName: string;
}) {
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
        DATA: {
          status: domainStatus.status, // "initializing", "pending_verification", "active"
          verification_data: domainStatus.verification_data,
          validation_data: domainStatus.validation_data,
          certificate_authority: domainStatus.certificate_authority,
          created_on: domainStatus.created_on,
        },
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
