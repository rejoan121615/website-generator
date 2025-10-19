import path from "path";
import env from "dotenv";
import Cloudflare, { APIError } from "cloudflare";
import { ConnectDomainResTYPE } from "../types/DataType.type.js";
import { parse } from 'tldts'
import { GetProjectName } from "../lib/GetProjectName.js";

const projectRoot = path.resolve(process.cwd(), "../../");
const dotEnvPath = path.resolve(projectRoot, ".env");

env.config({ path: dotEnvPath });

export async function ConnectDomainV2({
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

  try {
    // Step 1: Connect domain to Pages project
    const response = await client.pages.projects.domains.create(projectName, {
      name: domainName,
      account_id: process.env.CLOUDFLARE_ACCOUNT_ID,
    });

    console.log("Domain connected to Pages project:", response);

    // Step 2: Get the zone ID for the domain (use root domain for subdomains)
    const zoneSearchDomain = hasSubdomain ? rootDomain : domainName;
    
    if (!zoneSearchDomain) {
      return {
        SUCCESS: false,
        MESSAGE: "Unable to determine zone domain",
      };
    }

    const zones = await client.zones.list({
      name: zoneSearchDomain
    });

    if (!zones.result || zones.result.length === 0) {
      return {
        SUCCESS: false,
        MESSAGE: `Domain ${zoneSearchDomain} not found in your Cloudflare account. Please add it as a zone first.`,
      };
    }

    const zoneId = zones.result[0].id;

    // Step 3: For root domains, use Cloudflare Pages custom domain feature instead of manual DNS
    if (!hasSubdomain) {
      console.log(`Root domain ${domainName} connected via Pages custom domain. No manual DNS records needed.`);
      
      // Clean up any existing CNAME records that might cause conflicts
      const existingRecords = await client.dns.records.list({
        zone_id: zoneId
      });

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

      return {
        SUCCESS: true,
        MESSAGE: `Root domain ${domainName} connected successfully via Cloudflare Pages custom domain`,
        DATA: response || undefined,
      };
    }

    // Step 4: For subdomains, create CNAME record as usual
    const existingRecords = await client.dns.records.list({
      zone_id: zoneId
    });

    const pagesSubdomain = `${projectName}.pages.dev`;
    const recordName = subDomain;

    const existingRecord = existingRecords.result?.find(record => 
      record.name === domainName && record.type === "CNAME"
    );

    if (existingRecord) {
      await client.dns.records.update(existingRecord.id, {
        zone_id: zoneId,
        type: "CNAME",
        name: recordName,
        content: pagesSubdomain,
        proxied: true,
        ttl: 1
      });
      console.log(`Updated existing CNAME record for subdomain ${domainName}`);
    } else {
      await client.dns.records.create({
        zone_id: zoneId,
        type: "CNAME",
        name: recordName,
        content: pagesSubdomain,
        proxied: true,
        ttl: 1
      });
      console.log(`Created new CNAME record for subdomain ${domainName}`);
    }

    return {
      SUCCESS: true,
      MESSAGE: `Subdomain ${domainName} connected and DNS configured successfully`,
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