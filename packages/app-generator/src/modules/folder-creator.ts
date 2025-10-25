import fs from "fs-extra";
import path from "path";
import { getRootDir } from "../utilities/path-solver.js";
import { LogBuilder } from "@repo/log-helper";
import { EventResType } from "@repo/shared-types";

export async function folderCreator(data: {
  domain: string;
}): Promise<EventResType> {
  const { domain } = data;

  const outputDir = path.join(getRootDir("../../../../"), "apps");

  if (!domain && !outputDir) {
    console.warn("Skipping creation of directory with missing domain");
    LogBuilder({
      domain: domain,
      logMessage: "Missing domain or output directory on folderCreator",
      logType: "silly",
      logFileName: "astro-generator",
    })
    // return { SUCCESS: false, MESSAGE: "Missing domain or output directory" };
  }
  // create folder inside build-output folder with domain name
  try {
    await fs.ensureDir(path.join(outputDir, domain));
    LogBuilder({
      domain: domain,
      logMessage: `Src folder created inside => apps/${domain}`,
      logType: "info",
      logFileName: "astro-generator",
    })
    return { SUCCESS: true, MESSAGE: `Folder created for domain: ${domain}` };
  } catch (err) {
    LogBuilder({
      domain: domain,
      logMessage: `Failed to create folder for domain "${domain}"`,
      logType: "error",
      context: { function: "folderCreator" },
      error: err instanceof Error ? err : undefined,
      logFileName: "astro-generator",
    });
    return {
      SUCCESS: false,
      MESSAGE: `Failed to create folder for domain "${domain}": ${err}`,
    };
  }
}
