import path from "path";
import env from "dotenv";
import Cloudflare, { APIError } from "cloudflare";
import { ConnectDomainResTYPE } from "../types/DataType.type.js";
import { parse } from 'tldts'
import { GetProjectName } from "../lib/GetProjectName.js";



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


  const { projectName, hasSubdomain, rootDomain, subDomain } = GetProjectName(domainName);

  if (!projectName) {
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

    // Step 4: Create or update DNS record based on domain type
    const recordName = hasSubdomain ? subDomain : "@"; // Use subdomain name or "@" for root

    // For root domains, we need to check if we should use CNAME flattening or direct Pages connection
    if (!hasSubdomain) {
      // For root domains, try to connect directly without creating CNAME to .pages.dev
      // Instead, let Cloudflare handle the connection internally
      console.log(`Root domain ${domainName} connected to Pages project. DNS will be handled by Cloudflare Pages automatically.`);
      
      // Remove any existing conflicting CNAME records for root domain
      const conflictingRecords = existingRecords.result?.filter(record => 
        record.name === domainName && record.type === "CNAME"
      );
      
      for (const record of conflictingRecords || []) {
        try {
          await client.dns.records.delete(record.id, { zone_id: zoneId });
          console.log(`Removed conflicting CNAME record for ${domainName}`);
        } catch (error) {
          console.warn(`Could not remove conflicting record:`, error);
        }
      }
    } else {
      // For subdomains, create CNAME as normal
      const existingRecord = existingRecords.result?.find(record => 
        record.name === domainName && record.type === "CNAME"
      );

      if (existingRecord) {
        // Update existing CNAME record
        await client.dns.records.update(existingRecord.id, {
          zone_id: zoneId,
          type: "CNAME",
          name: recordName,
          content: pagesSubdomain,
          proxied: true,
          ttl: 1 // Auto
        });
        console.log(`Updated existing CNAME record for ${domainName}`);
      } else {
        // Create new CNAME record
        await client.dns.records.create({
          zone_id: zoneId,
          type: "CNAME",
          name: recordName,
          content: pagesSubdomain,
          proxied: true,
          ttl: 1 // Auto
        });
        console.log(`Created new CNAME record for ${domainName}`);
      }
    }

    // Step 5: Create www CNAME only for root domains (not subdomains)
    if (!hasSubdomain) {
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
    } else {
      console.log("Skipping www record creation for subdomain");
    }

    return {
      SUCCESS: true,
      MESSAGE: hasSubdomain
        ? `Subdomain ${domainName} connected and DNS configured successfully`
        : `Domain ${domainName} connected and DNS records configured successfully`,
      DATA: response || undefined,
    };

  } catch (error) {
    const err = error instanceof APIError ? error : null;
    const errorMsg = err?.errors[0]?.message || "Failed to connect domain or configure DNS";

    return {
      SUCCESS: false,
      MESSAGE: errorMsg,
      ERROR: err || undefined,
    };
  }
}
