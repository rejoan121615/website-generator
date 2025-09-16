import "dotenv/config";
import fs from "fs-extra";
import path from "path";
import type { CsvRowDataType } from "../types/DataType.js";

export function cloudFlareScriptBuilder(
  turboRepoRoot: string,
  data: CsvRowDataType
) {
  const { domain } = data;

  deployScriptBuilder(domain, turboRepoRoot);
  removeScriptBuilder(domain, turboRepoRoot);
}

async function deployScriptBuilder(domain: string, turboRepoRoot: string) {
  const cloudflareDir = path.join(turboRepoRoot, "apps", domain, "cloudflare");
  fs.ensureDirSync(cloudflareDir);

  const deployScriptPath = path.join(cloudflareDir, "deploy.js");
  if (!fs.existsSync(deployScriptPath)) {
    const deployScriptContent = `
// Cloudflare deploy script

import { deploy } from "@repo/cf";

deploy({
  cfToken: "${process.env.CLOUDFLARE_API_TOKEN}",
  cfId: "${process.env.CLOUDFLARE_ACCOUNT_ID}",
  projectName: "${domain}",
  branchName: "${process.env.DEPLOYMENT_BRANCH}",
  outputDir: "${process.env.GITHUB_REPOSITORY}",
});
`;
    await fs.writeFile(deployScriptPath, deployScriptContent);
    console.log(`cloudflare/deploy.js created successfully ...`);
  }
}

async function removeScriptBuilder(domain: string, turboRepoRoot: string) {
  const cloudflareDir = path.join(turboRepoRoot, "apps", domain, "cloudflare");
  fs.ensureDirSync(cloudflareDir);

  const removeScriptPath = path.join(cloudflareDir, "remove.js");
  if (!fs.existsSync(removeScriptPath)) {
    const removeScriptContent = `
// Cloudflare deploy script

import { deleteProject } from "@repo/cf";

deleteProject({
  cfToken: "${process.env.CLOUDFLARE_API_TOKEN}",
  cfId: "${process.env.CLOUDFLARE_ACCOUNT_ID}",
  projectName: "${domain}",
});
`;
    await fs.writeFile(removeScriptPath, removeScriptContent);
    console.log(`cloudflare/remove.js created successfully ...`);
  }
}
