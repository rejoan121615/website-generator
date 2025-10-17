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
    // Step 1: Connect domain to Pages project
    const response = await client.pages.projects.domains.create(projectName, {
      name: domainName,
      account_id: process.env.CLOUDFLARE_ACCOUNT_ID,
    });

    console.log("Domain connected to Pages project:", response);

    // Step 2: Get the zone ID for the domain
    const zones = await client.zones.list({
      name: domainName
    });

    if (!zones.result || zones.result.length === 0) {
      return {
        SUCCESS: false,
        MESSAGE: `Domain ${domainName} not found in your Cloudflare account. Please add it as a zone first.`,
      };
    }

    const zoneId = zones.result[0].id;
    const pagesSubdomain = `${projectName}.pages.dev`;

    // Step 3: Check if DNS record already exists
    const existingRecords = await client.dns.records.list({
      zone_id: zoneId
    });

    // Step 4: Create or update CNAME record
    if (existingRecords.result && existingRecords.result.length > 0) {
      // Update existing CNAME record
      const recordId = existingRecords.result[0].id;
      await client.dns.records.update(recordId, {
        zone_id: zoneId,
        type: "CNAME",
        name: "@", // Root domain
        content: pagesSubdomain,
        proxied: true,
        ttl: 1 // Auto
      });
      console.log("Updated existing CNAME record");
    } else {
      // Create new CNAME record
      await client.dns.records.create({
        zone_id: zoneId,
        type: "CNAME",
        name: "@", // Root domain
        content: pagesSubdomain,
        proxied: true,
        ttl: 1 // Auto
      });
      console.log("Created new CNAME record");
    }

    // Step 5: Also create www CNAME if needed
    const allRecords = await client.dns.records.list({
      zone_id: zoneId
    });

    // Filter for existing www CNAME records
    const existingWwwRecord = allRecords.result?.find(record => 
      record.name === `www.${domainName}` && record.type === "CNAME"
    );

    if (!existingWwwRecord) {
      await client.dns.records.create({
        zone_id: zoneId,
        type: "CNAME",
        name: "www",
        content: pagesSubdomain,
        proxied: true,
        ttl: 1
      });
      console.log("Created www CNAME record successfully");
    } else {
      console.log("www CNAME record already exists, skipping creation");
    }

    return {
      SUCCESS: true,
      MESSAGE: "Domain connected and DNS records configured successfully",
      DATA: response || undefined,
    };

  } catch (error) {
    const err = error instanceof APIError ? error : null;
    const errorMsg = err?.errors[0]?.message || "Failed to connect domain or configure DNS";

    console.error("Error in ConnectDomain:", err || error);

    return {
      SUCCESS: false,
      MESSAGE: errorMsg,
      ERROR: err || undefined,
    };
  }
}
