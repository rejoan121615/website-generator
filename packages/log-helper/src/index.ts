import fs, { ensureDirSync, ensureFileSync } from "fs-extra";
import path from "path";
import { getRootDir } from "./utils/path-solver.js";
import winston from 'winston'

const reportFolder = path.resolve(getRootDir("../../../../"), "logs");

export async function LogBuilder({
  domain,
  logMessage,
  logType,
  context,
  error,
  logFileName,
  newLog = false
}: {
  domain: "general" | string;
  logMessage: string;
  logType: "error" | "warn" | "info" | "verbose" | "debug" | "silly";
  logFileName: "app-generator" | "cloudflare";
  error?: Error;
  context?: Record<string, any>;
  newLog?: boolean
}) {
  const buildReport = path.resolve(reportFolder, domain, `${logFileName}.log`);

  if (newLog && fs.existsSync(buildReport)) {
    fs.removeSync(buildReport);
  }
  // make sure the report folder exists
  ensureDirSync(path.dirname(buildReport));

  // make sure the file is available to append log
  ensureFileSync(buildReport);

  // write winston logger to the file
  try {
    const logger = winston.createLogger({
      level: logType,
      format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.errors({ stack: true }),
        winston.format.json()
      ),
      defaultMeta: context || {},
      transports: [
        new winston.transports.Console(),
        new winston.transports.File({ filename: buildReport })
      ]
    });

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


    if (typeof logger[logType] === 'function') {
      (logger as any)[logType](logObj);
    } else {
      logger.info(logObj);
    }
  } catch (error) {
    console.error("Error while logging message:", error);
  }
}
