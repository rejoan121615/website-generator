import type {
  AstroProjectBuilderResultType,
} from "../types/DataType.js";
import { CsvRowDataType } from '@repo/shared-types'
import { folderCreator } from "./folder-creator.js";
import { srcCodeBuilder } from "./src-code-builder.js";
import { cloudFlareScriptBuilder } from "./cloudflare-script-builder.js";
import { getRootDir } from "../utilities/path-solver.js";
import fs from "fs-extra";
import path from "path";
import { LogBuilder } from "@repo/log-helper";

export async function astroProjectCreator(
  data: CsvRowDataType
): Promise<AstroProjectBuilderResultType> {
  const { domain } = data;
  try {
    const turboRepoRoot = getRootDir("../../../../");

    // create domain specific folder
    const folderCreationResult = await folderCreator({
      domain: domain,
    });


    // create src folder and files
    const srcCodeBuilderResult = await srcCodeBuilder(data);

    // create cloudflare scripts such as deploy and remove
    const cloudFlareScriptBuilderResult = await cloudFlareScriptBuilder(
      turboRepoRoot,
      data
    );

    if (cloudFlareScriptBuilderResult.SUCCESS) {
      LogBuilder({
        domain: data.domain,
        logMessage: `Cloudflare scripts created successfully`,
        logType: "info",
      });
    }

    return {
      SUCCESS: true,
      MESSAGE: `Astro app creating completed for domain: ${domain}`,
      DATA: [
        folderCreationResult,
        srcCodeBuilderResult,
        cloudFlareScriptBuilderResult,
      ],
    };
  } catch (error) {
    console.error("Error occurred during Astro project creation:", error);
    LogBuilder({
      domain: data.domain,
      logMessage: `Error occurred during Astro project creation`,
      logType: "error",
      context: { function: "astroProjectCreator" },
      error: error instanceof Error ? error : undefined,
    });
    return {
      SUCCESS: false,
      MESSAGE: `Astro project creation failed for domain: ${domain}`,
      DATA: null,
    };
  }
}

export async function astroProjectRemover(
  data: CsvRowDataType
): Promise<AstroProjectBuilderResultType> {
  const turboRepoRoot = getRootDir("../../../../");
  const { domain } = data;
  try {
    const appFolderPath = path.join(turboRepoRoot, "apps", domain);
    await fs.remove(appFolderPath);
    console.log(`Corrupted project ${domain} removed successfully ...`);
    return {
      SUCCESS: true,
      MESSAGE: `Corrupted project ${domain} removed successfully ...`,
      DATA: null,
    };
  } catch (error) {
    console.error(`Removing corrupted project ${domain} failed`, error);
    return {
      SUCCESS: false,
      MESSAGE: `Removing corrupted project ${domain} failed`,
      DATA: null,
    };
  }
}
