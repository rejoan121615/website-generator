import type {
  AstroProjectBuilderResultType,
  CsvRowDataType,
} from "../types/DataType.js";
import { folderCreator } from "./folder-creator.js";
import { srcCodeBuilder } from "./src-code-builder.js";
import { cloudFlareScriptBuilder } from "./cloudflare-script-builder.js";
import { getRootDir } from "../utilities/path-solver.js";
import fs from 'fs-extra';
import path from 'path';
import { ProjectBuilderLogger } from '@repo/log-helper'



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

    ProjectBuilderLogger({
      domain,
      logMessage: `Folder creation result: ${JSON.stringify(folderCreationResult)}`,
      logType: "success",
    });

    // create src folder and files
    const srcCodeBuilderResult = await srcCodeBuilder(data);

    // create cloudflare scripts such as deploy and remove
    const cloudFlareScriptBuilderResult = await cloudFlareScriptBuilder(
      turboRepoRoot,
      data
    );

    // run pnpm install and build commands
    // const pnpmCmdHandlerResult = await pnpmCmdHandler({
    //   rootDir: turboRepoRoot,
    //   domain: domain,
    // });

    console.log("Astro project build process completed for domain: ", domain);

    return {
      success: true,
      message: `Astro project build process completed for domain: ${domain}`,
      data: [
        folderCreationResult,
        srcCodeBuilderResult,
        cloudFlareScriptBuilderResult
      ],
    };
  } catch (error) {
    console.error("Error occurred during Astro project build process:", error);
    astroProjectRemover(data);
    return {
      success: false,
      message: `Astro project build process failed for domain: ${domain}`,
      data: null,
    };
  }
}


export async function astroProjectRemover (data: CsvRowDataType) : Promise<AstroProjectBuilderResultType> {
  const turboRepoRoot = getRootDir("../../../../");
  const { domain } = data;
  try {
    const appFolderPath = path.join(turboRepoRoot, "apps", domain);
    await fs.remove(appFolderPath);
    console.log(`Corrupted project ${domain} removed successfully ...`);
    return {
      success: true,
      message: `Corrupted project ${domain} removed successfully ...`,
      data: null,
    };
  } catch (error) {
    console.error(`Removing corrupted project ${domain} failed`, error);
    return {
      success: false,
      message: `Removing corrupted project ${domain} failed`,
      data: null,
    };
  }
}