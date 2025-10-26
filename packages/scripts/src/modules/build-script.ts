import { execa } from 'execa'
import path from 'path'
import fs from 'fs-extra'
import { EventResType } from '@repo/shared-types'
import { LogBuilder } from '@repo/log-helper'

export async function runAstroBuild({ domain }: { domain: string }): Promise<EventResType> {
  console.log('executing build command from @repo/scripts');
  
  LogBuilder({
    domain,
    logMessage: `Starting Astro build for ${domain}`,
    logType: "info",
    logFileName: "build",
    newLog: true
  });

  if (!domain) {
    const error = new Error("Domain is required to run the build.");
    LogBuilder({
      domain: "general",
      logMessage: "Domain is required to run the build",
      logType: "error",
      logFileName: "build",
    });
    throw error;
  }

  try {
    // The script runs from apps/{domain} directory, so we need to go up 2 levels to get to workspace root
    const turboRepoRoot = path.resolve(process.cwd(), "../../");
    const projectPath = path.join(turboRepoRoot, "apps", domain);
    
    console.log(`Building project at: ${projectPath}`);

    // Check if project exists
    if (!fs.existsSync(projectPath)) {
      console.error(`Project not found: ${projectPath}`);
      
      LogBuilder({
        domain,
        logMessage: `Project not found at path: ${projectPath}`,
        logType: "error",
        logFileName: "build",
      });

      return {
        SUCCESS: false,
        MESSAGE: `Project not found: ${projectPath}`,
      };
    }

    // Run astro build and capture output
    const result = await execa("astro", ["build"], {
      stdio: ["inherit", "inherit", "pipe"], // Inherit stdout, pipe stderr to capture errors
      preferLocal: true,
      cwd: projectPath,
      reject: false, // Don't throw on non-zero exit
    });

    if (result.exitCode === 0) {
      LogBuilder({
        domain,
        logMessage: `Astro build completed successfully for ${domain}`,
        logType: "info",
        logFileName: "build",
      });

      return {
        SUCCESS: true,
        MESSAGE: `Build completed successfully for ${domain}`,
      };
    } else {
      // Extract error details from stderr
      const stderr = result.stderr || '';
      const errorMatch = stderr.match(/Unexpected "(.*?)"\s+Location:\s+(.*?)(?=\s+Stack trace:|$)/s);
      
      let errorDetails = '';
      if (errorMatch) {
        const errorType = errorMatch[1];
        const location = errorMatch[2].trim();
        errorDetails = `Unexpected "${errorType}"\nLocation: ${location}`;
      } else {
        // Fallback to showing first few lines of stderr
        errorDetails = stderr.split('\n').slice(0, 5).join('\n');
      }

      LogBuilder({
        domain,
        logMessage: `Astro build failed for ${domain}\n${errorDetails}`,
        logType: "error",
        logFileName: "build",
      });

      return {
        SUCCESS: false,
        MESSAGE: `Build failed for ${domain} with exit code ${result.exitCode}`,
      };
    }
  } catch (error: any) {
    // Unexpected errors
    console.error(`Error occurred while building project: ${error.message}`);
    
    LogBuilder({
      domain,
      logMessage: `Astro build failed for ${domain}: ${error.message}`,
      logType: "error",
      error: error instanceof Error ? error : undefined,
      logFileName: "build",
    });

    return {
      SUCCESS: false,
      MESSAGE: `Build failed for ${domain}: ${error.message}`,
    };
  }
}