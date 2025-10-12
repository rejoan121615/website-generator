import fs, { ensureDirSync, ensureFileSync } from "fs-extra";
import path from "path";
import { getRootDir } from "./utils/path-solver.js";
import { GetApiResTYPE } from "./types/Types.type.js";

const reportFolder = path.resolve(getRootDir("../../../../"), "reports");

export async function ReportBuilder({
  domain,
  CfProjectName,
  liveUrl,
  fileName,
}: {
  domain: string;
  CfProjectName: string | undefined;
  liveUrl: string;
  fileName: "deploy";
}) {
  const buildReport = path.resolve(
    reportFolder,
    domain,
    fileName,
    `latest-${fileName}.csv`
  );
  // make sure the report folder exists
  ensureDirSync(path.dirname(buildReport));

  // make sure the file is available to append log
  ensureFileSync(buildReport);

  try {
    await fs.writeFile(
      buildReport,
      `Domain, Cf-Project-Name, Live-Url\n${domain},${CfProjectName},${liveUrl}\n`
    );
  } catch (error) {
    console.error("Error writing report:", error);
  }
}



export async function ReportRemover({ domain }: { domain: string }) : Promise<GetApiResTYPE> {
  const reportDir = path.resolve(reportFolder, domain);

  try {
    await fs.remove(reportDir);
    console.log(`Successfully removed report for domain: ${domain}`);
    return {
      SUCCESS: true,
      MESSAGE: `Successfully removed report for domain: ${domain}`,
    };
  } catch (error) {
    console.error("Error removing report:", error);
    return {
      SUCCESS: false,
      MESSAGE: "Error removing report",
    };
  }
}
