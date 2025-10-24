import env from "dotenv";
import Cloudflare from "cloudflare";
import path from "path";
import { execa } from "execa";
import { LogBuilder } from "@repo/log-helper";
import { ReportBuilder } from "@repo/report-helper";
import { DeployApiResTYPE } from "../types/DataType.type.js";

const projectRoot = path.resolve(process.cwd(), "../../");
const dotEnvPath = path.resolve(projectRoot, ".env");
env.config({ path: dotEnvPath });

const cfClient = new Cloudflare({
  apiToken: process.env.CLOUDFLARE_API_TOKEN,
});


export async function DeployApihandler({
  domainName,
  cfProjectName,
}: {
  domainName: string;
  cfProjectName: string;
}): Promise<DeployApiResTYPE> {
  try {
    LogBuilder({
      domain: domainName,
      logMessage: `Started uploading source code to the project...` ,
      logType: "info",
      context: { function: "DeployApihandler", domainName, cfProjectName },
      logFileName: "cloudflare",
    });
    console.log("Started uploading source code to the project...");
    // upload source code to the project
    const staticWebsitePath = path.join(
      projectRoot,
      "apps",
      domainName,
      "dist"
    );

    const commandArgs = [
      "pages",
      "deploy",
      staticWebsitePath,
      "--project-name",
      cfProjectName,
      "--branch",
      "main",
      "--commit-dirty=true",
    ];

    // wrangler using execa
    const subprocess = execa("wrangler", commandArgs, {
      env: {
        ...process.env,
        CLOUDFLARE_API_TOKEN: process.env.CLOUDFLARE_API_TOKEN,
        CLOUDFLARE_ACCOUNT_ID: process.env.CLOUDFLARE_ACCOUNT_ID,
        CLOUDFLARE_EMAIL: process.env.CLOUDFLARE_EMAIL,
        WRANGLER_LOG: process.env.WRANGLER_LOG || "info",
        WRANGLER_LOG_PATH: path.resolve(
          projectRoot,
          "logs",
          domainName,
          "wrangler.log"
        ),
      },
    });

    // show output
    subprocess.stdout?.pipe(process.stdout);
    subprocess.stderr?.pipe(process.stderr);

    const { exitCode, stack } = await subprocess;

    if (exitCode === 0) {
      console.log("Deployment completed successfully!");
      subprocess.kill(); // kill the subprocess
      LogBuilder({
        domain: domainName,
        logMessage: `Deployment initiated successfully for project ${cfProjectName}` ,
        logType: "info",
        context: { function: "DeployApihandler", domainName, cfProjectName },
        logFileName: "cloudflare",
      });
      // fetch project details
      const { id, name, domains, subdomain, latest_deployment } =
        await cfClient.pages.projects.get(cfProjectName, {
          account_id: process.env.CLOUDFLARE_ACCOUNT_ID!,
        });

      if (latest_deployment && latest_deployment.url) {
        ReportBuilder({
          domain: domainName,
          CfProjectName: name,
          liveUrl: latest_deployment.url,
          fileName: "deploy",
        });
      }

      return {
        SUCCESS: true,
        MESSAGE: "Deployment initiated successfully",
        DATA: { name, domains, subdomain, latest_deployment },
      };
    } else {
      console.log("Project upload failed");
      LogBuilder({
        domain: domainName,
        logMessage: `Project upload failed with exit code ${exitCode}` ,
        logType: "error",
        context: { function: "DeployApiHandler", domainName, exitCode },
        logFileName: "cloudflare",
        error: stack,
      });
      return {
        SUCCESS: false,
        MESSAGE: "Project upload failed",
      };
    }
  } catch (error) {
    console.log("Error during deployment:", error);
    LogBuilder({
      domain: domainName,
      logMessage: `Error during deployment: ${error}` ,
      logType: "error",
      context: { function: "DeployApiHandler", domainName },
      logFileName: "cloudflare",
      error: error instanceof Error ? error : undefined,
    });
    return {
      SUCCESS: false,
      MESSAGE: "Error during deployment",
    };
  }
}