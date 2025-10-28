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

async function removeAllProjects() {
  try {
    const turboRepoRoot = getRootDir("../../../../");
    const appsPath = path.join(turboRepoRoot, "apps");
    const logsPath = path.join(turboRepoRoot, "logs");

    // Get all files/folders inside apps
    const appsItems = await fs.readdir(appsPath);
    console.log(`✓ Found ${appsItems.length} items to delete in /apps`);

    for (const item of appsItems) {
      const fullPath = path.join(appsPath, item);
      await removeWithRetry(fullPath);
    }

    // Get all files/folders inside logs
    if (await fs.pathExists(logsPath)) {
      const logsItems = await fs.readdir(logsPath);
      console.log(`✓ Found ${logsItems.length} items to delete in /logs`);

      for (const item of logsItems) {
        const fullPath = path.join(logsPath, item);
        await removeWithRetry(fullPath);
      }
    }

    console.log("✓ All files and folders deleted successfully");
  } catch (error) {
    console.error("✗ Error while deleting contents:", error);
    process.exit(1);
  }
}

removeAllProjects();
