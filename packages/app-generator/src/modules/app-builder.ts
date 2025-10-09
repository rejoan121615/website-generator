import type {
  AstroProjectBuilderResultType,
  CsvRowDataType,
} from "../types/DataType.js";
import { folderCreator } from "./folder-creator.js";
import { srcCodeBuilder } from "./src-code-builder.js";
import { cloudFlareScriptBuilder } from "./cloudflare-script-builder.js";
import { getRootDir } from "../utilities/path-solver.js";
import { pnpmCmdHandler } from "./pnpm-cmd-handler.js";

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
    return {
      success: false,
      message: `Astro project build process failed for domain: ${domain}`,
      data: null,
    };
  }
}
