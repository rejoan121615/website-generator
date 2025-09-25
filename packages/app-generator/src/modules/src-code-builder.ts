import path from "path";
import fs from "fs-extra";
import { CsvRowDataType } from "../types/DataType.js";
import { getRootDir } from "../utilities/path-solver.js";
import { spintaxHandler } from "./spintax-handler.js";
import { packageJsonFileBuilder } from "./app-scripts-builder.js";

const turboRepoRoot = getRootDir("../../../../");

// src folder handler
export async function srcCodeBuilder(data: CsvRowDataType) {
  console.log("Creating Astro app ...", data.domain);

  const baseFrontendPath = path.join(turboRepoRoot, "packages", "baseFrontend");
  const appFolderPath = path.join(turboRepoRoot, "apps", data.domain);

  // Ensure the destination directory exists
  await fs.ensureDir(appFolderPath);

  // Read all files and directories from baseFrontend
  const items = (
    await fs.readdir(baseFrontendPath, { recursive: true, encoding: "utf8" })
  ).filter((item) => {
    const segments = item.split(path.sep);
    return !segments.includes("node_modules") && !segments.includes(".astro") && !segments.includes(".turbo") && !segments.includes("dist");
  });

  for (const item of items) {
    const srcPath = path.join(baseFrontendPath, item);
    const destPath = path.join(appFolderPath, item);

    const stat = await fs.stat(srcPath);
    if (stat.isDirectory()) {
      await fs.ensureDir(destPath);
    } else if (stat.isFile()) {
      if (item.endsWith(".astro")) {
        // process astro file with spintax handler
        await spintaxHandler(srcPath, destPath);
      } else if (item.endsWith("package.json")) {
        // process package.json file
        packageJsonFileBuilder( data.domain, srcPath, destPath)

      } else {
        // process none astro file normally
        await fs.copyFile(srcPath, destPath);
      }
    }
  }

  console.log(`Astro app created successfully for domain: ${data.domain}`);
}
