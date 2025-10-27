import "dotenv/config";
import fs from "fs-extra";
import path from "path";
import { CsvRowDataType, EventResType } from "@repo/shared-types"; 

export async function cloudFlareScriptBuilder(
  turboRepoRoot: string,
  data: CsvRowDataType
): Promise<EventResType> {
  const { domain } = data;
  try {
    await deployScriptBuilder(domain, turboRepoRoot);
    await removeScriptBuilder(domain, turboRepoRoot);
    return {
      SUCCESS: true,
      MESSAGE: `Cloudflare scripts created for ${domain}`,
    };
  } catch (error: any) {
    return {
      SUCCESS: false,
      MESSAGE: `Error creating Cloudflare scripts for ${domain}: ${error?.message || error}`,
    };
  }
}

async function deployScriptBuilder(
  domain: string,
  turboRepoRoot: string
): Promise<EventResType> {
  try {
    const cloudflareDir = path.join(
      turboRepoRoot,
      "apps",
      domain,
      "cloudflare"
    );
    fs.ensureDirSync(cloudflareDir);

    const deployScriptPath = path.join(cloudflareDir, "deploy.js");
    if (!fs.existsSync(deployScriptPath)) {
      const deployScriptContent = `
// Cloudflare deploy script

import { deploy } from "@repo/cf";

deploy({
  projectName: "${domain}",
  branchName: "${process.env.DEPLOYMENT_BRANCH}"
});
`;
      await fs.writeFile(deployScriptPath, deployScriptContent);
      return {
        SUCCESS: true,
        MESSAGE: `cloudflare/deploy.js created successfully for ${domain}`,
      };
    } else {
      return {
        SUCCESS: true,
        MESSAGE: `cloudflare/deploy.js already exists for ${domain}`,
      };
    }
  } catch (error: any) {
    return {
      SUCCESS: false,
      MESSAGE: `Error creating cloudflare/deploy.js for ${domain}: ${error?.message || error}`,
    };
  }
}

async function removeScriptBuilder(
  domain: string,
  turboRepoRoot: string
): Promise<EventResType> {
  try {
    const cloudflareDir = path.join(
      turboRepoRoot,
      "apps",
      domain,
      "cloudflare"
    );
    fs.ensureDirSync(cloudflareDir);

    const removeScriptPath = path.join(cloudflareDir, "remove.js");
    if (!fs.existsSync(removeScriptPath)) {
      const removeScriptContent = `
// Cloudflare deploy script

import { deleteProject } from "@repo/cf";

deleteProject({
  domainName: "${domain}",
});
`;
      await fs.writeFile(removeScriptPath, removeScriptContent);
      return {
        SUCCESS: true,
        MESSAGE: `cloudflare/remove.js created successfully for ${domain}`,
      };
    } else {
      return {
        SUCCESS: true,
        MESSAGE: `cloudflare/remove.js already exists for ${domain}`,
      };
    }
  } catch (error: any) {
    return {
      SUCCESS: false,
      MESSAGE: `Error creating cloudflare/remove.js for ${domain}: ${error?.message || error}`,
    };
  }
}
