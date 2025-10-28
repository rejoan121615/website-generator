import path from "path";
import fs from "fs-extra";
import { execa } from "execa";
import { getRootDir } from "../utilities/path-solver.js";

async function removeWithPowerShell(fullPath: string): Promise<void> {
  try {
    // Use PowerShell's Remove-Item with Force and Recurse flags
    await execa("powershell.exe", [
      "-Command",
      `Remove-Item -Path '${fullPath}' -Recurse -Force -ErrorAction Stop`,
    ]);
    console.log(`✓ Deleted via PowerShell: ${path.basename(fullPath)}`);
  } catch (error) {
    console.error(`✗ PowerShell deletion failed for ${path.basename(fullPath)}`);
    throw error;
  }
}

async function removeWithRetry(
  fullPath: string,
  maxRetries = 3,
  delay = 1000
): Promise<void> {
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      await fs.remove(fullPath);
      console.log(`✓ Deleted: ${path.basename(fullPath)}`);
      return;
    } catch (error: any) {
      if (error.code === "EBUSY" || error.code === "EPERM") {
        if (attempt === maxRetries) {
          console.log(
            `⚠ Retrying with PowerShell: ${path.basename(fullPath)}`
          );
          await removeWithPowerShell(fullPath);
          return;
        }
        console.log(
          `⚠ Retry ${attempt}/${maxRetries}: ${path.basename(fullPath)}`
        );
        await new Promise((resolve) => setTimeout(resolve, delay));
      } else {
        throw error;
      }
    }
  }
}

async function removeSingleProject() {
  try {
    // Get command line arguments (skip first 2: node and script path)
    console.log("✓ Starting project removal...");
    const args = process.argv.slice(2);
    const hasDomainFlag = args.find((arg) => arg.trim() === "--domain");
    const hasDomain = args[1];

    if (!hasDomainFlag) {
      console.log(
        "✗ The --domain flag is required. Add --domain domain.com at the end of your command."
      );
      return;
    } else if (!hasDomain) {
      console.log(
        "✗ Please provide a domain after the --domain flag. Add --domain domain.com at the end of your command."
      );
      return;
    }

    const turboRepoRoot = getRootDir("../../../../");
    const appsPath = path.join(turboRepoRoot, "apps", hasDomain);
    const logsPath = path.join(turboRepoRoot, "logs", hasDomain);

    let deletedCount = 0;

    // Remove from apps folder
    if (await fs.pathExists(appsPath)) {
      await removeWithRetry(appsPath);
      deletedCount++;
    } else {
      console.log(`⚠ Project not found in /apps: ${hasDomain}`);
    }

    // Remove from logs folder
    if (await fs.pathExists(logsPath)) {
      await removeWithRetry(logsPath);
      deletedCount++;
    } else {
      console.log(`⚠ Logs not found in /logs: ${hasDomain}`);
    }

    if (deletedCount > 0) {
      console.log(`✓ Project "${hasDomain}" deleted successfully`);
    } else {
      console.log(`✗ Project "${hasDomain}" not found in apps or logs`);
    }
  } catch (error) {
    console.error("✗ Error while deleting project:", error);
    process.exit(1);
  }
}

// Execute the function
removeSingleProject();
