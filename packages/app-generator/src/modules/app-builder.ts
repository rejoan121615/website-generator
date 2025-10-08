import type { CsvRowDataType } from "../types/DataType.js";
import { folderCreator } from "./folder-creator.js";
import { srcCodeBuilder } from "./src-code-builder.js";
import { cloudFlareScriptBuilder } from "./cloudflare-script-builder.js";
import { getRootDir } from "../utilities/path-solver.js";
import { pnpmCmdHandler } from "./pnpm-cmd-handler.js";


export async function astroProjectBuilder(
  data: CsvRowDataType
) {
  const { domain } = data;
  const turboRepoRoot = getRootDir('../../../../');

  // create domain specific folder 
  await folderCreator({
    domain: domain
  });

  // create src folder and files
  await srcCodeBuilder(data);

  // create cloudflare scripts such as deploy and remove
  cloudFlareScriptBuilder(turboRepoRoot, data);

  // run pnpm install and build commands
  pnpmCmdHandler({ rootDir: turboRepoRoot, domain: domain });

  console.log('Astro project build process completed for domain: ', domain);


}
