import path from "path";
import fs from "fs-extra";
import { CsvRowDataType, PromiseResultType } from "../types/DataType.js";
import { getRootDir } from "../utilities/path-solver.js";
import { spintaxAndTokenHandler } from "./spintax-handler.js";
import {
  astroConfigFileBuilder,
  packageJsonFileBuilder,
} from "./app-scripts-builder.js";
import { SeoComponentHandler } from "./seo-component-handler.js";

const turboRepoRoot = getRootDir("../../../../");

// src folder handler
export async function srcCodeBuilder(
  data: CsvRowDataType
): Promise<PromiseResultType> {
  console.log("Creating Astro app ...", data.domain);

  const baseFrontendPath = path.join(turboRepoRoot, "packages", "baseFrontend");
  const appFolderPath = path.join(turboRepoRoot, "apps", data.domain);

  try {
    // Ensure the destination directory exists
    await fs.ensureDir(appFolderPath);

    // Read all files and directories from baseFrontend
    const items = (
      await fs.readdir(baseFrontendPath, {
        recursive: true,
        encoding: "utf8",
      })
    ).filter((item) => {
      const segments = item.split(path.sep);
      return (
        !segments.includes("node_modules") &&
        !segments.includes(".astro") &&
        !segments.includes(".turbo") &&
        !segments.includes("dist")
      );
    });

    // file and folder filter to handle specific files differently
    for (const item of items) {
      const srcPath = path.join(baseFrontendPath, item);
      const destPath = path.join(appFolderPath, item);

      const stat = await fs.stat(srcPath);
      if (stat.isDirectory()) {
        await fs.ensureDir(destPath);
      } else if (stat.isFile()) {
        if (item.endsWith("Seo.astro")) {
          await SeoComponentHandler({ csvRowData: data, destPath, srcPath });
        } else if (item.endsWith(".astro")) {
          // process astro file with spintax handler
          await spintaxAndTokenHandler({
            csvData: data,
            inputPath: srcPath,
            outputPath: destPath,
          });
        } else if (item.endsWith("package.json")) {
          // process package.json file
          await packageJsonFileBuilder(data.domain, srcPath, destPath);
        } else if (item.endsWith("astro.config.mjs")) {
          await astroConfigFileBuilder({ csvData: data, srcPath, destPath });
        } else {
          // process none astro file normally
          await fs.copyFile(srcPath, destPath);
        }
      }
    }
    return { success: true, message: "Astro app created" };
  } catch (error) {
    return { success: false, message: `Error creating Astro app: ${error}` };
  }
}
