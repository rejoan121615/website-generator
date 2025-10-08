import type { CsvRowDataType } from "../types/DataType.js";
import { folderCreator } from "./folder-creator.js";
import { srcCodeBuilder } from "./src-code-builder.js";
import { cloudFlareScriptBuilder } from "./cloudflare-script-builder.js";
import { getRootDir } from "../utilities/path-solver.js";


export function astroProjectBuilder(
  data: CsvRowDataType
) {
  const { domain } = data;
  const turboRepoRoot = getRootDir('../../../../');

  // create domain specific folder 
  folderCreator({
    domain: domain
  });

  // create src folder and files
  srcCodeBuilder(data);

  // create cloudflare scripts such as deploy and remove
  cloudFlareScriptBuilder(turboRepoRoot, data);


}
