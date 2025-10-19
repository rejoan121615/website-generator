import path from "path";
import env from "dotenv";
import Cloudflare from "cloudflare";

const projectRoot = path.resolve(process.cwd(), "../../");
const dotEnvPath = path.resolve(projectRoot, ".env");

env.config({ path: dotEnvPath });

export async function CheckDomainDNS(domainName: string) {
  const client = new Cloudflare({
    apiToken: process.env.CLOUDFLARE_API_TOKEN!,
  });

  try {
    // Get zone info
    const zones = await client.zones.list({
      name: domainName
    });

    if (!zones.result || zones.result.length === 0) {
      console.log(`❌ Domain ${domainName} not found in your account`);
      return;
    }

    const zone = zones.result[0];
    console.log(`✅ Zone found: ${zone.name} (ID: ${zone.id})`);

    // Get all DNS records
    const records = await client.dns.records.list({
      zone_id: zone.id
    });

    console.log(`\n📋 DNS Records for ${domainName}:`);
    console.log("=" .repeat(50));
    
    records.result?.forEach(record => {
      console.log(`${record.type.padEnd(8)} | ${record.name.padEnd(30)} | ${record.content}`);
      if (record.proxied) {
        console.log("         | (Proxied through Cloudflare)");
      }
    });

    console.log(`\n🔍 Note: To check Pages domain status, use the Cloudflare dashboard`);
    console.log(`Visit: https://dash.cloudflare.com/${process.env.CLOUDFLARE_ACCOUNT_ID}/pages/view/[project-name]`);

  } catch (error) {
    console.error("Error checking domain:", error);
  }
}

// Usage example:
// CheckDomainDNS("plumbersbow.co.uk");