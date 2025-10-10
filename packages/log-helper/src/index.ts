import fs, { ensureDirSync, ensureFileSync } from "fs-extra";
import path from "path";
import { getRootDir } from "./utils/path-solver.js";
import pino from "pino";

const reportFolder = path.resolve(getRootDir("../../../../"), "reports");

export async function ProjectBuilderLogger({
  domain,
  logMessage,
  logType,
}: {
  domain: string;
  logMessage: string;
  logType: "success" | "error" | "info" | "debug";
}) {
  const buildReport = path.resolve(reportFolder, domain, "build-report.log");

  // make sure the file is available to append log
  ensureFileSync(buildReport);

  // write pino logger to the file
  const logger = pino(
    {
    level: logType,
      formatters: {
        level: (label) => ({ level: label }),
        log: (log) => ({ ...log }),
      },
      timestamp: pino.stdTimeFunctions.isoTime,
    },
    pino.destination(buildReport)
  );

  // append log message to domain specific log file
  logger.info(logMessage);
}