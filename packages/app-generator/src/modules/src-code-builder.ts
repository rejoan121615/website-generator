import path from "path";
import fs from "fs-extra";
import { getRootDir } from "../utilities/path-solver.js";
import { spintaxAndTokenHandler } from "./spintax-handler.js";
import {
  astroConfigFileBuilder,
  packageJsonFileBuilder,
} from "./app-scripts-builder.js";
import { SeoComponentHandler } from "./seo-component-handler.js";
import { LogBuilder } from '@repo/log-helper'
import { CsvRowDataType, EventResType } from "@repo/shared-types";

const turboRepoRoot = getRootDir("../../../../");

// src folder handler
export async function srcCodeBuilder(
  data: CsvRowDataType
): Promise<EventResType> {
  const startTime = Date.now();
  
  console.log("Creating Astro app ...", data.domain);

  LogBuilder({
    domain: data.domain,
    logMessage: `Starting Astro source code building for ${data.domain}`,
    logType: "info",
    context: { 
      function: "srcCodeBuilder",
      businessName: data.name,
      serviceType: data.service_name
    },
    logFileName: "app-generator",
  });

  const baseFrontendPath = path.join(turboRepoRoot, "packages", "baseFrontend");
  const appFolderPath = path.join(turboRepoRoot, "apps", data.domain);
  
  LogBuilder({
    domain: data.domain,
    logMessage: `Resolved paths for source building`,
    logType: "debug",
    context: { 
      function: "srcCodeBuilder",
      baseFrontendPath,
      appFolderPath
    },
    logFileName: "app-generator",
  });

  try {
    // Ensure the destination directory exists
    LogBuilder({
      domain: data.domain,
      logMessage: `Ensuring destination directory exists: ${appFolderPath}`,
      logType: "debug",
      context: { function: "srcCodeBuilder", step: "directory-creation" },
      logFileName: "app-generator",
    });
    
    await fs.ensureDir(appFolderPath);

    // Read all files and directories from baseFrontend
    LogBuilder({
      domain: data.domain,
      logMessage: `Scanning base frontend directory: ${baseFrontendPath}`,
      logType: "debug",
      context: { function: "srcCodeBuilder", step: "directory-scanning" },
      logFileName: "app-generator",
    });
    
    const allItems = await fs.readdir(baseFrontendPath, {
      recursive: true,
      encoding: "utf8",
    });
    
    const items = allItems.filter((item) => {
      const segments = item.split(path.sep);
      return (
        !segments.includes("node_modules") &&
        !segments.includes(".astro") &&
        !segments.includes(".turbo") &&
        !segments.includes("dist")
      );
    });
    
    LogBuilder({
      domain: data.domain,
      logMessage: `File scanning completed`,
      logType: "info",
      context: { 
        function: "srcCodeBuilder",
        step: "file-scanning-complete",
        totalItemsFound: allItems.length,
        filteredItems: items.length,
        excludedItems: allItems.length - items.length
      },
      logFileName: "app-generator",
    });

    // file and folder filter to handle specific files differently
    let processedFiles = 0;
    let processedDirectories = 0;
    let errorCount = 0;
    const fileProcessingStart = Date.now();
    
    LogBuilder({
      domain: data.domain,
      logMessage: `Starting file processing loop`,
      logType: "info",
      context: { 
        function: "srcCodeBuilder",
        step: "file-processing-start",
        totalItemsToProcess: items.length
      },
      logFileName: "app-generator",
    });
    
    for (const item of items) {
      const srcPath = path.join(baseFrontendPath, item);
      const destPath = path.join(appFolderPath, item);

      try {
        const stat = await fs.stat(srcPath);
        
        if (stat.isDirectory()) {
          LogBuilder({
            domain: data.domain,
            logMessage: `Creating directory: ${item}`,
            logType: "silly",
            context: { 
              function: "srcCodeBuilder",
              step: "directory-creation",
              itemPath: item
            },
            logFileName: "app-generator",
          });
          
          await fs.ensureDir(destPath);
          processedDirectories++;
        } else if (stat.isFile()) {
          LogBuilder({
            domain: data.domain,
            logMessage: `Processing file: ${item}`,
            logType: "silly",
            context: { 
              function: "srcCodeBuilder",
              step: "file-processing",
              itemPath: item,
              fileSize: stat.size,
              fileType: path.extname(item)
            },
            logFileName: "app-generator",
          });
          
          if (item.endsWith("Seo.astro")) {
          let seoRes = await SeoComponentHandler({ csvRowData: data, destPath, srcPath });
          if (!seoRes.SUCCESS) {
            LogBuilder({
              domain: data.domain,
              logMessage: `${seoRes.MESSAGE}`,
              logType: "error",
              context: { function: "srcCodeBuilder", srcPath, destPath },
              error: seoRes.ERROR,
              logFileName: "app-generator"
            });
          }
        } else if (item.endsWith(".astro")) {
          // process astro file with spintax handler
          let spintaxRes = await spintaxAndTokenHandler({
            csvData: data,
            inputPath: srcPath,
            outputPath: destPath,
          });

          if (!spintaxRes.SUCCESS) {
            LogBuilder({
              domain: data.domain,
              logMessage: `${spintaxRes.MESSAGE}`,
              logType: "error",
              context: { function: "srcCodeBuilder", srcPath, destPath },
              logFileName: "app-generator"
            });
          }
        } else if (item.endsWith("package.json")) {
          // process package.json file
         let packageJsonRes = await packageJsonFileBuilder(data.domain, srcPath, destPath);
          if (!packageJsonRes.SUCCESS) {
            LogBuilder({
              domain: data.domain,
              logMessage: `${packageJsonRes.MESSAGE}`,
              logType: "error",
              context: { function: "srcCodeBuilder", srcPath, destPath },
              logFileName: "app-generator"
            });
          }
        } else if (item.endsWith("astro.config.mjs")) {
          let astroConfigRes = await astroConfigFileBuilder({ csvData: data, srcPath, destPath });
          if (!astroConfigRes.SUCCESS) {
            LogBuilder({
              domain: data.domain,
              logMessage: `${astroConfigRes.MESSAGE}`,
              logType: "error",
              context: { function: "srcCodeBuilder", srcPath, destPath },
              logFileName: "app-generator"
            });
          }
        } else {
          // process none astro file normally
          LogBuilder({
            domain: data.domain,
            logMessage: `Copying static file: ${item}`,
            logType: "silly",
            context: { function: "srcCodeBuilder", step: "static-file-copy", filePath: item },
            logFileName: "app-generator",
          });
          
          await fs.copyFile(srcPath, destPath);
        }
          
          processedFiles++;
        }
      } catch (itemError) {
        errorCount++;
        LogBuilder({
          domain: data.domain,
          logMessage: `Error processing item: ${item}`,
          logType: "error",
          context: { 
            function: "srcCodeBuilder",
            step: "item-processing-error",
            itemPath: item,
            errorCount
          },
          error: itemError instanceof Error ? itemError : undefined,
          logFileName: "app-generator",
        });
      }
    }
    
    const fileProcessingTime = Date.now() - fileProcessingStart;
    const totalProcessingTime = Date.now() - startTime;
    
    LogBuilder({
      domain: data.domain,
      logMessage: `File processing loop completed`,
      logType: "info",
      context: { 
        function: "srcCodeBuilder",
        step: "file-processing-complete",
        statistics: {
          totalItems: items.length,
          processedFiles,
          processedDirectories,
          errorCount,
          fileProcessingTimeMs: fileProcessingTime,
          fileProcessingTimeSec: `${(fileProcessingTime / 1000).toFixed(2)}s`
        }
      },
      logFileName: "app-generator",
    });
    
    LogBuilder({
      domain: data.domain,
      logMessage: `Astro app created successfully in => apps/${data.domain}`,
      logType: "info",
      context: { 
        function: "srcCodeBuilder",
        step: "completion-success",
        performance: {
          totalProcessingTimeMs: totalProcessingTime,
          totalProcessingTimeSec: `${(totalProcessingTime / 1000).toFixed(2)}s`,
          avgTimePerFile: processedFiles > 0 ? `${(fileProcessingTime / processedFiles).toFixed(2)}ms` : "0ms"
        },
        summary: {
          processedFiles,
          processedDirectories,
          errorCount,
          successRate: processedFiles > 0 ? `${((processedFiles - errorCount) / processedFiles * 100).toFixed(2)}%` : "100%"
        }
      },
      logFileName: "app-generator",
    });
    
    return { 
      SUCCESS: errorCount === 0, 
      MESSAGE: errorCount === 0 ? "Astro app created" : `Astro app created with ${errorCount} errors`
    };
  } catch (error) {
    const totalProcessingTime = Date.now() - startTime;
    
    LogBuilder({
      domain: data.domain,
      logMessage: `Critical error during Astro app creation`,
      logType: "error",
      context: { 
        function: "srcCodeBuilder",
        step: "critical-failure",
        appFolderPath,
        performance: {
          failedAfterMs: totalProcessingTime,
          failedAfterSec: `${(totalProcessingTime / 1000).toFixed(2)}s`
        },
        environment: {
          nodeVersion: process.version,
          platform: process.platform,
          workingDirectory: process.cwd()
        }
      },
      error: error instanceof Error ? error : undefined,
      logFileName: "app-generator",
    });
    
    return { 
      SUCCESS: false, 
      MESSAGE: `Error creating Astro app: ${error instanceof Error ? error.message : error}` 
    };
  }
}
