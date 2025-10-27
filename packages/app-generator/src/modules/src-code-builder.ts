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
  
  LogBuilder({
    domain: data.domain,
    logMessage: `Starting Astro source code building for ${data.domain}`,
    logType: "info",
    logFileName: "astro-generator",
  });

  const baseFrontendPath = path.join(turboRepoRoot, "templates", data.template);
  const appFolderPath = path.join(turboRepoRoot, "apps", data.domain);
  
  LogBuilder({
    domain: data.domain,
    logMessage: `Resolved paths for source building`,
    logType: "debug",
    logFileName: "astro-generator",
  });

  try {
    // Ensure the destination directory exists
    LogBuilder({
      domain: data.domain,
      logMessage: `Ensuring destination directory exists: ${appFolderPath}`,
      logType: "debug",
      logFileName: "astro-generator",
    });
    
    await fs.ensureDir(appFolderPath);

    // Read all files and directories from baseFrontend
    LogBuilder({
      domain: data.domain,
      logMessage: `Scanning base frontend directory: ${baseFrontendPath}`,
      logType: "debug",
      logFileName: "astro-generator",
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
      logFileName: "astro-generator",
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
      logFileName: "astro-generator",
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
            logFileName: "astro-generator",
          });
          
          await fs.ensureDir(destPath);
          processedDirectories++;
        } else if (stat.isFile()) {
          LogBuilder({
            domain: data.domain,
            logMessage: `Processing file: ${item}`,
            logType: "silly",
            logFileName: "astro-generator",
          });
          
          if (item.endsWith("Seo.astro")) {
          let seoRes = await SeoComponentHandler({ csvRowData: data, destPath, srcPath });
          if (!seoRes.SUCCESS) {
            LogBuilder({
              domain: data.domain,
              logMessage: `${seoRes.MESSAGE}`,
              logType: "error",
              error: seoRes.ERROR,
              logFileName: "astro-generator"
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
              logFileName: "astro-generator"
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
              logFileName: "astro-generator"
            });
          }
        } else if (item.endsWith("astro.config.mjs")) {
          let astroConfigRes = await astroConfigFileBuilder({ csvData: data, srcPath, destPath });
          if (!astroConfigRes.SUCCESS) {
            LogBuilder({
              domain: data.domain,
              logMessage: `${astroConfigRes.MESSAGE}`,
              logType: "error",
              logFileName: "astro-generator"
            });
          }
        } else {
          // process none astro file normally
          LogBuilder({
            domain: data.domain,
            logMessage: `Copying static file: ${item}`,
            logType: "silly",
            logFileName: "astro-generator",
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
          error: itemError instanceof Error ? itemError : undefined,
          logFileName: "astro-generator",
        });
      }
    }
    
    const fileProcessingTime = Date.now() - fileProcessingStart;
    const totalProcessingTime = Date.now() - startTime;
    
    LogBuilder({
      domain: data.domain,
      logMessage: `File processing loop completed`,
      logType: "info",
      logFileName: "astro-generator",
    });
    
    LogBuilder({
      domain: data.domain,
      logMessage: `Astro app created successfully in => apps/${data.domain}`,
      logType: "info",
      logFileName: "astro-generator",
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
      error: error instanceof Error ? error : undefined,
      logFileName: "astro-generator",
    });
    
    return { 
      SUCCESS: false, 
      MESSAGE: `Error creating Astro app: ${error instanceof Error ? error.message : error}` 
    };
  }
}
