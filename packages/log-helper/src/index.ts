import fs, { ensureDirSync, ensureFileSync } from "fs-extra";
import path from "path";
import { getRootDir } from "./utils/path-solver.js";
import pino from "pino";

const reportFolder = path.resolve(getRootDir("../../../../"), "reports");

export async function LogBuilder({
  domain,
  logMessage,
  logType,
  context,
  error,
  logFileName = "dashboard"
}: {
  domain: string;
  logMessage: string;
  logType: "fatal" | "error" | "warn" | "info" | "debug" | "trace";
  error?: Error;
  context?: Record<string, any>;
  logFileName?: string;
}) {
  const buildReport = path.resolve(reportFolder, domain, `${logFileName}-log.log`);
  // make sure the report folder exists
  ensureDirSync(path.dirname(buildReport));

  // make sure the file is available to append log
  ensureFileSync(buildReport);

  // write pino logger to the file
  try {
    const logger = pino(
      {
        level: logType,
        formatters: {
          level: (label) => ({ level: label }),
          log: (log) => ({ ...log }),
        },
        timestamp: pino.stdTimeFunctions.isoTime,
        base: context ? { ...context } : {},
      },
      pino.destination(buildReport)
    );

    // Build the log object
    const logObj: Record<string, any> = {
      message: logMessage,
      ...(context || {})
    };
    if (error) {
      logObj.error = error instanceof Error ? {
        name: error.name,
        message: error.message,
        stack: error.stack
      } : error;
    }

    // append log message to domain specific log file using the correct log level
    if (typeof logger[logType] === 'function') {
      logger[logType](logObj);
    } else {
      logger.info(logObj);
    }
  } catch (error) {
    console.error("Error while logging message:", error);
  }
}
