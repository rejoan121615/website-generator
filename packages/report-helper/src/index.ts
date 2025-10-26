import fs, { ensureDirSync, ensureFileSync } from "fs-extra";
import path from "path";
import { getRootDir } from "./utils/path-solver.js";
import { EventResType } from "@repo/shared-types";
import { LogBuilder } from "@repo/log-helper";

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
}) : Promise<EventResType> {
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
      `Domain,Cf-Project-Name,Live-Url\n${domain},${CfProjectName},${liveUrl}\n`
    );
    LogBuilder({
      domain: domain || "general",
      logMessage: `Report written successfully for domain: ${domain}`,
      logType: "info",
      logFileName: "report",
    });
    return {
      SUCCESS: true,
      MESSAGE: `Report written successfully for domain: ${domain}`,
    }
  } catch (error) {
    console.error("Error writing report:", error);
    LogBuilder({
      domain: domain || "general",
      logMessage: `Error writing report for domain: ${domain}`,
      logType: "error",
      logFileName: "report",
      error: error instanceof Error ? error : undefined,
    });
    return {
      SUCCESS: false,
      MESSAGE: "Error writing report",
    };
  }
}



export async function ReportRemover({ domain }: { domain: string }) : Promise<EventResType> {
  const reportDir = path.resolve(reportFolder, domain);

  try {
    await fs.remove(reportDir);
    console.log(`Successfully removed report for domain: ${domain}`);
    LogBuilder({
      domain: domain || "general",
      logMessage: `Successfully removed report for domain: ${domain}`,
      logType: "info",
      logFileName: "report",
    });
    return {
      SUCCESS: true,
      MESSAGE: `Successfully removed report for domain: ${domain}`,
    };
  } catch (error) {
    console.error("Error removing report:", error);
    LogBuilder({
      domain: domain || "general",
      logMessage: `Error removing report for domain: ${domain}`,
      logType: "error",
      logFileName: "report",
      error: error instanceof Error ? error : undefined,
    });
    return {
      SUCCESS: false,
      MESSAGE: "Error removing report",
    };
  }
}
