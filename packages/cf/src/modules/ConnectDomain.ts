import path from "path";
import env from "dotenv";
import Cloudflare, { APIError } from "cloudflare";
import { ConnectDomainResTYPE } from "../types/DataType.type.js";

const projectRoot = path.resolve(process.cwd(), "../../");
const dotEnvPath = path.resolve(projectRoot, ".env");

env.config({ path: dotEnvPath });

export async function ConnectDomain({
  domainName,
}: {
  domainName: string;
}): Promise<ConnectDomainResTYPE> {
  if (!process.env.CLOUDFLARE_API_TOKEN) {
    console.error("CLOUDFLARE_API_TOKEN is not found in .env file");
    return {
      SUCCESS: false,
      MESSAGE: "CLOUDFLARE_API_TOKEN is not found in .env file",
    };
  } else if (!process.env.CLOUDFLARE_ACCOUNT_ID) {
    console.error("CLOUDFLARE_ACCOUNT_ID is not found in .env file");
    return {
      SUCCESS: false,
      MESSAGE: "CLOUDFLARE_ACCOUNT_ID is not found in .env file",
    };
  } else if (!domainName) {
    console.error("Please provide a valid domain name");
    return {
      SUCCESS: false,
      MESSAGE: "Please provide a valid domain name",
    };
  }

  const projectName = domainName.replaceAll(".", "-");

  const client = new Cloudflare({
    apiToken: process.env.CLOUDFLARE_API_TOKEN,
  });

  //   make request
  try {
    const response = await client.pages.projects.domains.create(projectName, {
      name: domainName,
      account_id: process.env.CLOUDFLARE_ACCOUNT_ID,
    });

    console.log("domain api response ", response);

    if (response) {
      return {
        SUCCESS: true,
        MESSAGE: "Domain connected successfully",
        DATA: response,
      };
    }
  } catch (error) {
    const err = error instanceof APIError ? error : null;
    console.log("Error connecting domain:", err);

    return {
      SUCCESS: false,
      MESSAGE: err ? err.message : "Failed to connect domain",
      ERROR: err || undefined,
    };
  }

  return {
    SUCCESS: false,
    MESSAGE: "Unknown error occurred in ConnectDomain",
  };
}
