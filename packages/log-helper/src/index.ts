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
  logFileName: "app-generator" | "cloudflare" | "report";
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
      transports: [
        // Console - Simple, human-readable format
        new winston.transports.Console({
          format: winston.format.printf(({ level, message }) => {
            const icon = level === 'error' ? '✗' : level === 'warn' ? '⚠' : '✓';
            return `${icon} ${message}`;
          })
        }),
        // File - Simple text format with timestamp
        new winston.transports.File({ 
          filename: buildReport,
          format: winston.format.combine(
            winston.format.timestamp(),
            winston.format.printf(({ level, message, timestamp }) => {
              const icon = level === 'error' ? '✗' : level === 'warn' ? '⚠' : '✓';
              const time = String(timestamp).replace('T', ' ').split('.')[0];
              return `${time} ${icon} ${message}`;
            })
          )
        })
      ]
    });

    // Build simple message with error details if present
    let fullMessage = logMessage;
    if (error) {
      if (error instanceof Error) {
        fullMessage += `\n   Error: ${error.message}`;
        if (error.stack) {
          // Extract file path and line number from stack
          const stackLines = error.stack.split('\n');
          const relevantLine = stackLines.find(line => line.includes('.astro') || line.includes('.ts') || line.includes('.js'));
          if (relevantLine) {
            fullMessage += `\n   Location: ${relevantLine.trim()}`;
          }
        }
      } else {
        fullMessage += `\n   Error: ${JSON.stringify(error)}`;
      }
    }

    if (typeof logger[logType] === 'function') {
      (logger as any)[logType](fullMessage);
    } else {
      logger.info(fullMessage);
    }
  } catch (error) {
    console.error("Error while logging message:", error);
  }
}
