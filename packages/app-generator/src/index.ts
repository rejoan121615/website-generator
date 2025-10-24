import dotenv from "dotenv";
import path from "path";
import fs from "fs-extra";
import { parse } from "csv-parse";
import { CsvRowDataType } from "@repo/shared-types";
import { getRootDir } from "./utilities/path-solver.js";
import { astroProjectCreator } from "./modules/app-builder.js";
import { LogBuilder } from "@repo/log-helper";

const turboRepoRoot = getRootDir("../../../../");

dotenv.config({ path: path.resolve(turboRepoRoot, ".env") });

const csvFilePath = path.join(turboRepoRoot, "data", "websites.csv");
const outputDir = path.join(turboRepoRoot, "apps");

// Log system startup
LogBuilder({
  domain: "general",
  logMessage: "Website generator starting up",
  logType: "info",
  context: { 
    function: "main-startup",
    csvFilePath,
    outputDir,
    nodeVersion: process.version,
    platform: process.platform
  },
  logFileName: "app-generator",
  newLog: true
});

// create output dir if not exists
fs.ensureDirSync(outputDir);

LogBuilder({
  domain: "general",
  logMessage: `Output directory ensured: ${outputDir}`,
  logType: "debug",
  context: { function: "main-startup" },
  logFileName: "app-generator",
});

// check if the file exists
if (fs.existsSync(csvFilePath)) {
  LogBuilder({
    domain: "general",
    logMessage: `CSV file found, starting processing: ${csvFilePath}`,
    logType: "info",
    context: { function: "main-csv-processor", csvFilePath },
    logFileName: "app-generator",
  });

  // create readable stream
  const csvStream = fs.createReadStream(csvFilePath);
  let processedCount = 0;
  let errorCount = 0;
  const startTime = Date.now();

  const parser = csvStream.pipe(
    parse({
      columns: true, // use first row as header and generate objects
      delimiter: ",",
    })
  );

  parser.on("data", async (row: CsvRowDataType) => {
    processedCount++;
    
    LogBuilder({
      domain: row.domain,
      logMessage: `Starting processing for domain: ${row.domain}`,
      logType: "info",
      context: { 
        function: "main-csv-processor",
        domainCount: processedCount,
        domainName: row.name,
        serviceType: row.service_name
      },
      logFileName: "app-generator",
    });

    try {
      const result = await astroProjectCreator(row);
      
      if (result.SUCCESS) {
        LogBuilder({
          domain: row.domain,
          logMessage: `Successfully completed processing for domain: ${row.domain}`,
          logType: "info",
          context: { 
            function: "main-csv-processor",
            processingResult: "success",
            totalProcessed: processedCount
          },
          logFileName: "app-generator",
        });
      } else {
        errorCount++;
        LogBuilder({
          domain: row.domain,
          logMessage: `Failed to process domain: ${row.domain} - ${result.MESSAGE}`,
          logType: "error",
          context: { 
            function: "main-csv-processor",
            processingResult: "failed",
            errorCount,
            failureReason: result.MESSAGE
          },
          logFileName: "app-generator",
        });
      }
    } catch (error) {
      errorCount++;
      LogBuilder({
        domain: row.domain,
        logMessage: `Exception while processing domain: ${row.domain}`,
        logType: "error",
        context: { 
          function: "main-csv-processor",
          processingResult: "exception",
          errorCount
        },
        error: error instanceof Error ? error : undefined,
        logFileName: "app-generator",
      });
    }
  });

  parser.on("end", () => {
    const processingTime = Date.now() - startTime;
    const successCount = processedCount - errorCount;
    const successRate = processedCount > 0 ? (successCount / processedCount * 100).toFixed(2) : 0;
    
    console.log(`CSV file successfully processed - ${processedCount} domains, ${successCount} successful, ${errorCount} errors`);
    
    LogBuilder({
      domain: "general",
      logMessage: `CSV file processing completed`,
      logType: processedCount === successCount ? "info" : "warn",
      context: { 
        function: "main-csv-processor",
        summary: {
          totalDomains: processedCount,
          successCount,
          errorCount,
          successRate: `${successRate}%`,
          processingTimeMs: processingTime,
          processingTimeSec: `${(processingTime / 1000).toFixed(2)}s`
        }
      },
      logFileName: "app-generator",
    });
  });

  parser.on("error", (err) => {
    console.error("Error while processing CSV:", err);
    LogBuilder({
      domain: "general",
      logMessage: `Error while processing CSV file`,
      logType: "error",
      context: { function: "main-csv-processor", error: err },
      logFileName: "app-generator",
    });
  });
} else {
  console.error(`CSV file not found at path: ${csvFilePath}`);
  process.exit(1);
}
