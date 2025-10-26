import dotenv from "dotenv";
import path from "path";
import fs from "fs-extra";
import { getRootDir } from "./utilities/path-solver.js";
import { astroProjectCreator } from "./modules/app-builder.js";
import { LogBuilder } from "@repo/log-helper";
import { CsvProcessor } from "./modules/csv-processor.js";

const turboRepoRoot = getRootDir("../../../../");

dotenv.config({ path: path.resolve(turboRepoRoot, ".env") });

const csvFilePath = path.join(turboRepoRoot, "data", "websites.csv");
const outputDir = path.join(turboRepoRoot, "apps");

// Log system startup
LogBuilder({
  domain: "General",
  logMessage: "Website generator starting up",
  logType: "info",
  logFileName: "astro-generator",
  newLog: true,
});

// create output dir if not exists
fs.ensureDirSync(outputDir);

LogBuilder({
  domain: "General",
  logMessage: `Output directory ensured: ${outputDir}`,
  logType: "debug",
  logFileName: "astro-generator",
});

// check if the file exists
if (fs.existsSync(csvFilePath)) {
  LogBuilder({
    domain: "General",
    logMessage: `CSV file found, starting processing: ${csvFilePath}`,
    logType: "info",
    logFileName: "astro-generator",
  });

  // process csv file data
  (async () => {
    const csvProcessRes = await CsvProcessor({ csvPath: csvFilePath });

    // process csv data if file is valid
    if (csvProcessRes.SUCCESS && csvProcessRes.DATA) {
      for (const row of csvProcessRes.DATA) {
        try {
          const result = await astroProjectCreator(row);

          if (result.SUCCESS) {
            LogBuilder({
              domain: row.domain,
              logMessage: `Successfully completed processing for domain: ${row.domain}`,
              logType: "info",
              logFileName: "astro-generator",
            });
          } else {
            LogBuilder({
              domain: row.domain,
              logMessage: `Failed to process domain: ${row.domain} - ${result.MESSAGE}`,
              logType: "error",
              logFileName: "astro-generator",
            });
          }
        } catch (error) {
          LogBuilder({
            domain: row.domain,
            logMessage: `Exception while processing domain: ${row.domain}`,
            logType: "error",
            error: error instanceof Error ? error : undefined,
            logFileName: "astro-generator",
          });
        }
      }
    } else {
      // csv file processing error
      LogBuilder({
        domain: "General",
        logMessage: `Please check csv file: ${csvFilePath} - ${csvProcessRes.MESSAGE}`,
        logType: "error",
        logFileName: "astro-generator",
      });
    }
  })();
} else {
  console.error(`CSV file not found at path: ${csvFilePath}`);
  process.exit(1);
}
