import env from "dotenv";
import Cloudflare, { APIError } from "cloudflare";
import path from "path";
import { DeleteProjectResTYPE, GetApiResTYPE } from "../types/DataType.type.js";
import { LogBuilder } from "@repo/log-helper";
import { ReportRemover } from "@repo/report-helper";
import { GetProjectName } from "../lib/GetProjectName.js";

const projectRoot = path.resolve(process.cwd(), "../../");
const dotEnvPath = path.resolve(projectRoot, ".env");
env.config({ path: dotEnvPath });

export async function deleteProject({
  domainName,
}: {
  domainName: string;
}): Promise<DeleteProjectResTYPE> {
  if (!process.env.CLOUDFLARE_API_TOKEN && !process.env.CLOUDFLARE_ACCOUNT_ID) {
    throw new Error(
      "CLOUDFLARE_API_TOKEN or CLOUDFLARE_ACCOUNT_ID is missing, check .env file"
    );
  }

  const client = new Cloudflare({ apiToken: process.env.CLOUDFLARE_API_TOKEN });

  const { projectName, hasSubdomain, rootDomain, subDomain } = GetProjectName(domainName);

  console.log(`Attempting to delete project: ${projectName}`);
  try {
    // Step 1: Get project details to check for custom domains
    const projectDetails = await client.pages.projects.get(projectName, {
      account_id: process.env.CLOUDFLARE_ACCOUNT_ID!,
    });

    console.log('project details ', projectDetails);

    // Step 2: Remove custom domains and their DNS records if they exist
    if (projectDetails.domains && projectDetails.domains.length > 0) {
      console.log(`Found ${projectDetails.domains.length} domains, removing them and their DNS records...`);
      
      for (const domain of projectDetails.domains) {
        // Skip the default .pages.dev subdomain
        if (!domain.endsWith('.pages.dev')) {
          try {
            console.log(`Removing custom domain: ${domain}`);
            
            // Remove DNS records first
            await removeDNSRecords(client, domain);
            
            // Then remove from Pages project
            await client.pages.projects.domains.delete(projectName, domain, {
              account_id: process.env.CLOUDFLARE_ACCOUNT_ID!,
            });
            console.log(`Successfully removed domain: ${domain}`);
          } catch (domainError) {
            console.warn(`Failed to remove domain ${domain}:`, domainError);
            // Continue with other domains even if one fails
          }
        }
      }
      
      // Wait a bit for domain removals to propagate
      console.log("Waiting for domain removals to complete...");
      await new Promise(resolve => setTimeout(resolve, 3000));
    }

    // Step 3: Delete the project (this also deletes all deployments)
    await client.pages.projects.delete(projectName, {
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
      DATA: { deleted: true },
    };
  } catch (error) {
    console.log('error ', error);
    LogBuilder({
      domain: projectName,
      logMessage: "Failed to delete project",
      logType: "error",
      context: { function: "deleteProject" },
      logFileName: "undeploy",
      error: error instanceof Error ? error : undefined,
    });
    

    return {
      SUCCESS: false,
      MESSAGE: "Failed to delete project",
      ERROR: error instanceof APIError ? error : undefined,
    };
  }
}

// Helper function to remove DNS records
async function removeDNSRecords(client: Cloudflare, domain: string) {
  try {
    const { hasSubdomain, rootDomain, subDomain } = GetProjectName(domain);
    
    // Get the zone ID for the root domain
    const zones = await client.zones.list({
      name: rootDomain,
    });

    if (!zones.result || zones.result.length === 0) {
      console.warn(`Zone for ${rootDomain} not found, skipping DNS record removal`);
      return;
    }

    const zoneId = zones.result[0].id;
    
    // Get all DNS records for the zone
    const dnsRecords = await client.dns.records.list({
      zone_id: zoneId,
    });

    if (!dnsRecords.result) {
      console.warn(`No DNS records found for zone ${rootDomain}`);
      return;
    }

    // Find and delete the relevant CNAME record
    const recordName = hasSubdomain ? subDomain : rootDomain;
    const cNameRecord = dnsRecords.result.find(record => 
      record.type === 'CNAME' && 
      (record.name === recordName || record.name === `${recordName}.${rootDomain}` || 
       (record.name === rootDomain && !hasSubdomain))
    );

    if (cNameRecord) {
      console.log(`Removing DNS CNAME record: ${cNameRecord.name}`);
      await client.dns.records.delete(cNameRecord.id!, {
        zone_id: zoneId,
      });
      console.log(`Successfully removed DNS record: ${cNameRecord.name}`);
    } else {
      console.log(`No matching CNAME record found for ${domain}`);
    }

  } catch (error) {
    console.warn(`Failed to remove DNS records for ${domain}:`, error);
    // Don't throw error, just log warning as DNS removal is not critical for project deletion
  }
}