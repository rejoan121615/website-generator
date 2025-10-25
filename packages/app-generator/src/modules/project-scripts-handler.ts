import { EventResType } from "@repo/shared-types";
import { LogBuilder } from "@repo/log-helper";
import path from "path";
import fs from "fs-extra";

export async function ProjectScriptsHandler({
  domain,
  turboRepoRoot,
}: {
  domain: string;
  turboRepoRoot: string;
}): Promise<EventResType> {
  const scriptsDir = path.join(turboRepoRoot, "apps", domain, "scripts");
  fs.ensureDirSync(scriptsDir);

  try {
    LogBuilder({
      domain,
      logMessage: `Creating project scripts for ${domain}`,
      logType: "info",
      logFileName: "astro-generator",
    });

    const buildScriptResult = await createBuildScript({ domain, scriptsDir });

    if (buildScriptResult.SUCCESS) {
      LogBuilder({
        domain,
        logMessage: `Project scripts created successfully for ${domain}`,
        logType: "info",
        logFileName: "astro-generator",
      });
    } else {
      LogBuilder({
        domain,
        logMessage: `Failed to create project scripts for ${domain}`,
        logType: "error",
        error: buildScriptResult.ERROR instanceof Error ? buildScriptResult.ERROR : undefined,
        logFileName: "astro-generator",
      });
    }

    return {
      MESSAGE: "Project scripts created successfully",
      SUCCESS: true,
    };
  } catch (error) {
    const errorObj = error as Error;
    LogBuilder({
      domain,
      logMessage: `Failed to create project scripts for ${domain}`,
      logType: "error",
      error: errorObj,
      context: { function: "ProjectScriptsHandler" },
      logFileName: "astro-generator",
    });

    return {
      MESSAGE: `Failed to create project scripts for ${domain}: ${errorObj.message}`,
      SUCCESS: false,
      ERROR: errorObj,
    };
  }
}

export async function createBuildScript({
  domain,
  scriptsDir,
}: {
  domain: string;
  scriptsDir: string;
}): Promise<EventResType> {
  try {
    const buildScriptPath = path.join(scriptsDir, "build.js");
    const buildScriptContent = `
// Build script for ${domain}
import { runAstroBuild } from "@repo/scripts";

( async () => {
  await runAstroBuild({ domain: "${domain}" });
})()
`;

    await fs.writeFile(buildScriptPath, buildScriptContent);
    console.log(`build.js created successfully ...`);

    LogBuilder({
      domain,
      logMessage: `build.js script created successfully`,
      logType: "info",
      logFileName: "astro-generator",
    });

    return {
      SUCCESS: true,
      MESSAGE: `build script created for ${domain}`,
    };
  } catch (err) {
    const error = err as Error;
    
    LogBuilder({
      domain,
      logMessage: `Failed to create build.js for ${domain}`,
      logType: "error",
      error,
      context: { function: "createBuildScript", scriptsDir },
      logFileName: "astro-generator",
    });

    return {
      SUCCESS: false,
      MESSAGE: `Failed to create build.js for ${domain}: ${error.message}`,
      ERROR: error,
    };
  }
}
