import type {
  AstroProjectBuilderResultType,
} from "../types/DataType.js";
import { CsvRowDataType } from '@repo/shared-types'
import { folderCreator } from "./folder-creator.js";
import { srcCodeBuilder } from "./src-code-builder.js";
import { cloudFlareScriptBuilder } from "./cloudflare-script-builder.js";
import { getRootDir } from "../utilities/path-solver.js";
import fs from "fs-extra";
import path from "path";
import { LogBuilder } from "@repo/log-helper";

export async function astroProjectCreator(
  data: CsvRowDataType
): Promise<AstroProjectBuilderResultType> {
  const { domain } = data;
  const startTime = Date.now();
  
  LogBuilder({
    domain: data.domain,
    logMessage: `Starting Astro project creation for ${domain}`,
    logType: "info",
    context: { 
      function: "astroProjectCreator",
      businessName: data.name,
      serviceType: data.service_name,
      email: data.email,
      phone: data.phone
    },
    logFileName: "app-generator",
  });
  
  try {
    const turboRepoRoot = getRootDir("../../../../");

    LogBuilder({
      domain: data.domain,
      logMessage: `Resolved turbo repo root: ${turboRepoRoot}`,
      logType: "debug",
      context: { function: "astroProjectCreator", turboRepoRoot },
      logFileName: "app-generator",
    });

    // create domain specific folder
    LogBuilder({
      domain: data.domain,
      logMessage: `Creating folder structure for ${domain}`,
      logType: "debug",
      context: { function: "astroProjectCreator", step: "folder-creation" },
      logFileName: "app-generator",
    });
    
    const folderCreationResult = await folderCreator({
      domain: domain,
    });


    // create src folder and files
    const srcCodeBuilderResult = await srcCodeBuilder(data);

    // create cloudflare scripts such as deploy and remove
    const cloudFlareScriptBuilderResult = await cloudFlareScriptBuilder(
      turboRepoRoot,
      data
    );

    if (cloudFlareScriptBuilderResult.SUCCESS) {
      LogBuilder({
        domain: data.domain,
        logMessage: `Cloudflare scripts created successfully`,
        logType: "info",
        logFileName: "app-generator",
      });
    }

    const processingTime = Date.now() - startTime;
    
    LogBuilder({
      domain: data.domain,
      logMessage: `Astro project creation completed successfully for ${domain}`,
      logType: "info",
      context: { 
        function: "astroProjectCreator",
        step: "completion-success",
        performance: {
          processingTimeMs: processingTime,
          processingTimeSec: `${(processingTime / 1000).toFixed(2)}s`
        },
        results: {
          folderCreation: folderCreationResult.SUCCESS,
          srcCodeBuilding: srcCodeBuilderResult.SUCCESS,
          cloudflareScripts: cloudFlareScriptBuilderResult.SUCCESS
        }
      },
      logFileName: "app-generator",
    });
    
    return {
      SUCCESS: true,
      MESSAGE: `Astro app creating completed for domain: ${domain}`,
      DATA: [
        folderCreationResult,
        srcCodeBuilderResult,
        cloudFlareScriptBuilderResult,
      ],
    };
  } catch (error) {
    console.error("Error occurred during Astro project creation:", error);
    LogBuilder({
      domain: data.domain,
      logMessage: `Error occurred during Astro project creation`,
      logType: "error",
      context: { function: "astroProjectCreator" },
      error: error instanceof Error ? error : undefined,
      logFileName: "app-generator",
    });
    return {
      SUCCESS: false,
      MESSAGE: `Astro project creation failed for domain: ${domain}`,
      DATA: null,
    };
  }
}

export async function astroProjectRemover(
  data: CsvRowDataType
): Promise<AstroProjectBuilderResultType> {
  const turboRepoRoot = getRootDir("../../../../");
  const { domain } = data;
  const startTime = Date.now();
  
  LogBuilder({
    domain: data.domain,
    logMessage: `Starting removal of corrupted project: ${domain}`,
    logType: "warn",
    context: { function: "astroProjectRemover", reason: "cleanup" },
    logFileName: "app-generator",
  });
  
  try {
    const appFolderPath = path.join(turboRepoRoot, "apps", domain);
    
    // Check if folder exists before attempting removal
    if (await fs.pathExists(appFolderPath)) {
      const folderStats = await fs.stat(appFolderPath);
      
      LogBuilder({
        domain: data.domain,
        logMessage: `Removing project folder: ${appFolderPath}`,
        logType: "debug",
        context: { 
          function: "astroProjectRemover",
          folderPath: appFolderPath,
          folderSize: folderStats.size,
          createdAt: folderStats.birthtime
        },
        logFileName: "app-generator",
      });
      
      await fs.remove(appFolderPath);
      
      const processingTime = Date.now() - startTime;
      
      console.log(`Corrupted project ${domain} removed successfully ...`);
      
      LogBuilder({
        domain: data.domain,
        logMessage: `Corrupted project ${domain} removed successfully`,
        logType: "info",
        context: { 
          function: "astroProjectRemover",
          result: "success",
          processingTimeMs: processingTime
        },
        logFileName: "app-generator",
      });
      
      return {
        SUCCESS: true,
        MESSAGE: `Corrupted project ${domain} removed successfully ...`,
        DATA: null,
      };
    } else {
      LogBuilder({
        domain: data.domain,
        logMessage: `Project folder not found for removal: ${appFolderPath}`,
        logType: "warn",
        context: { function: "astroProjectRemover", folderPath: appFolderPath },
        logFileName: "app-generator",
      });
      
      return {
        SUCCESS: true,
        MESSAGE: `Project folder not found: ${domain}`,
        DATA: null,
      };
    }
  } catch (error) {
    const processingTime = Date.now() - startTime;
    
    console.error(`Removing corrupted project ${domain} failed`, error);
    
    LogBuilder({
      domain: data.domain,
      logMessage: `Failed to remove corrupted project: ${domain}`,
      logType: "error",
      context: { 
        function: "astroProjectRemover",
        result: "failed",
        processingTimeMs: processingTime
      },
      error: error instanceof Error ? error : undefined,
      logFileName: "app-generator",
    });
    
    return {
      SUCCESS: false,
      MESSAGE: `Removing corrupted project ${domain} failed`,
      DATA: null,
    };
  }
}
