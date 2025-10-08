import fs from "fs-extra";
import path from "path";
import { getRootDir } from "../utilities/path-solver.js";
import { PromiseResultType } from "../types/DataType.js";

export async function folderCreator(data: {
  domain: string;
}): Promise<PromiseResultType> {
  return new Promise(async (resolve, reject) => {
    const { domain } = data;

    const outputDir = path.join(getRootDir("../../../../"), "apps");

    if (!domain && !outputDir) {
      console.warn("Skipping creation of directory with missing domain");
      return reject({ success: false, message: "Missing domain or output directory" });
    }
    // create folder inside build-output folder with domain name
    try {
      await fs.ensureDir(path.join(outputDir, domain));
      console.log(`----------------------------------------------`);
      console.log(`Folder Created for : ${domain}`);
      return resolve({ success: true, message: `Folder created for domain: ${domain}` });

    } catch (err) {
      console.log(`Failed to create folder for domain "${domain}":`, err);
      return reject({ success: false, message: `Failed to create folder for domain "${domain}": ${err}` });
    }
  });
}
