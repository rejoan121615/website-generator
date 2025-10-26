import path from "path";
import env from "dotenv";
import Cloudflare, { APIError } from "cloudflare";
import { ConnectDomainResTYPE } from "../types/DataType.type.js";
import { GetProjectName } from "../lib/GetProjectName.js";
import { LogBuilder } from "@repo/log-helper";

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
    LogBuilder({
      domain: domainName || "general",
      logMessage: "CLOUDFLARE_API_TOKEN is not found in .env file",
      logType: "error",
      logFileName: "cloudflare",
    });
    return {
      SUCCESS: false,
      MESSAGE: "CLOUDFLARE_API_TOKEN is not found in .env file",
    };
  } else if (!process.env.CLOUDFLARE_ACCOUNT_ID) {
    console.error("CLOUDFLARE_ACCOUNT_ID is not found in .env file");
    LogBuilder({
      domain: domainName || "general",
      logMessage: "CLOUDFLARE_ACCOUNT_ID is not found in .env file",
      logType: "error",
      logFileName: "cloudflare",
    });
    return {
      SUCCESS: false,
      MESSAGE: "CLOUDFLARE_ACCOUNT_ID is not found in .env file",
    };
  } else if (!domainName) {
    console.error("Please provide a valid domain name");
    LogBuilder({
      domain: "general",
      logMessage: "Please provide a valid domain name",
      logType: "error",
      logFileName: "cloudflare",
    });
    return {
      SUCCESS: false,
      MESSAGE: "Please provide a valid domain name",
    };
  }

  const { projectName, hasSubdomain, rootDomain, subDomain } =
    GetProjectName(domainName);

  if (!projectName) {
    LogBuilder({
      domain: domainName || "general",
      logMessage: "Unable to parse domain name for project creation",
      logType: "error",
      logFileName: "cloudflare",
    });
    return {
      SUCCESS: false,
      MESSAGE: "Unable to parse domain name for project creation",
    };
  }

  const client = new Cloudflare({
    apiToken: process.env.CLOUDFLARE_API_TOKEN,
  });

  //   make request
  try {
    // Step 1: Connect domain to Pages project
    const response = await client.pages.projects.domains.create(projectName, {
      name: domainName,
      account_id: process.env.CLOUDFLARE_ACCOUNT_ID,
    });

    console.log("Domain connected to Pages project:", response);

    // Step 2: Get the zone ID for the domain (use root domain for subdomains)

    const zones = await client.zones.list({
      name: rootDomain,
    });

    const { subdomain: pageDomain } = await client.pages.projects.get(
      projectName,
      {
        account_id: process.env.CLOUDFLARE_ACCOUNT_ID!,
      }
    );

    if (!zones.result || zones.result.length === 0) {
      LogBuilder({
        domain: domainName,
        logMessage: `Domain ${domainName} not found in your Cloudflare account. Please add it as a zone first.`,
        logType: "error",
        logFileName: "cloudflare",
      });
      return {
        SUCCESS: false,
        MESSAGE: `Domain ${domainName} not found in your Cloudflare account. Please add it as a zone first.`,
      };
    }

    const zoneId = zones.result[0].id;
    // const pagesSubdomain = `${projectName}.pages.dev`;

    console.log("has subdomain ", hasSubdomain);
    // Step 4: Create or update DNS record based on domain type

    if (hasSubdomain) {
      await client.dns.records.create({
        zone_id: zoneId,
        type: "CNAME",
        name: subDomain,
        content: pageDomain,
        proxied: true,
        ttl: 1,
      });
    } else {
      await client.dns.records.create({
        zone_id: zoneId,
        type: "CNAME",
        name: "@",
        content: pageDomain,
        proxied: true,
        ttl: 1,
      });
    }

    console.log(`CNAME record created `);

    LogBuilder({
      domain: domainName,
      logMessage: hasSubdomain
        ? `Subdomain ${domainName} connected and DNS configured successfully`
        : `Domain ${domainName} connected and DNS records configured successfully`,
      logType: "info",
      logFileName: "cloudflare",
    });
    return {
      SUCCESS: true,
      MESSAGE: hasSubdomain
        ? `Subdomain ${domainName} connected and DNS configured successfully`
        : `Domain ${domainName} connected and DNS records configured successfully`,
      DATA: response || undefined,
    };
  } catch (error) {
    console.log(`Error => ${error}`);
    const err = error instanceof APIError ? error : null;
    const errorMsg =
      err?.errors[0]?.message || "Failed to connect domain or configure DNS";
    LogBuilder({
      domain: domainName,
      logMessage: `Failed to connect domain or configure DNS: ${errorMsg}`,
      logType: "error",
      logFileName: "cloudflare",
      error: error instanceof Error ? error : undefined,
    });
    return {
      SUCCESS: false,
      MESSAGE: errorMsg,
      ERROR: err || undefined,
    };
  }
}
