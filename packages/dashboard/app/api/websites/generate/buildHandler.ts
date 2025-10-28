import {
  astroProjectCreator,
  astroProjectRemover,
} from "@repo/app-generator/app-builder";
import { execa, ExecaError } from "execa";
import { ProjectRoot } from "@/lib/assists";
import path from "path";
import { sendSSE } from "@/lib/assists";
import { LogBuilder } from "@repo/log-helper";
import { WebsiteRowTYPE } from "@repo/shared-types";


export async function AstroAppBuilder(websiteRowData: WebsiteRowTYPE) {
  const projectDir = path.resolve(ProjectRoot(), "apps", websiteRowData.domain);

  const processStream = new ReadableStream({
    async start(controller) {
      try {
        // controller.enqueue(
        //   `Creating ${websiteRowData.domain} project src ...\n`
        // );
        sendSSE(controller, {
          MESSAGE: `Building project src`,
          CSV_DATA: { ...websiteRowData, build: "processing" },
        });
        await astroProjectCreator(websiteRowData);
        // controller.enqueue(`Project src created successfullly...\n`);
        sendSSE(controller, {
          MESSAGE: `Project src build successfullly`,
          CSV_DATA: { ...websiteRowData, build: "processing" },
        });
        // install node modules using pnpm install
        sendSSE(controller, {
          MESSAGE: `Started installing node modules`,
          CSV_DATA: { ...websiteRowData, build: "processing" },
        });
        const pnpmInstallProcess = await execa("pnpm", ["install"], {
          cwd: projectDir,
          timeout: 60000,
        });

        sendSSE(controller, {
          MESSAGE: `Node modules installed successfully`,
          CSV_DATA: { ...websiteRowData, build: "processing" },
        });
        // build astro project
        sendSSE(controller, {
          MESSAGE: `Started building Astro project`,
          CSV_DATA: { ...websiteRowData, build: "processing" },
        });
        await execa("pnpm", ["build"], {
          cwd: projectDir,
          timeout: 120000,
        });

        sendSSE(controller, {
          MESSAGE: `Project build successfully...`,
          CSV_DATA: { ...websiteRowData, build: "complete" },
        });
        controller.close();
      } catch (error) {
        if (error instanceof ExecaError) {
          LogBuilder({
            domain: websiteRowData.domain,
            logMessage: `${error.message}`,
            logType: "error",
            error: error,
            logFileName: "build"
          });

          sendSSE(controller, {
            MESSAGE: `Failed to build projects. Please check log file.`,
            CSV_DATA: { ...websiteRowData, build: "failed" },
          });
          controller.close();
        } else {

        }
      }
    },
  });

  return new Response(processStream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      Connection: "keep-alive",
    },
  });
}

