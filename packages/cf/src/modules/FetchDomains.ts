import env from "dotenv";
import Cloudflare from "cloudflare";
import path from "path";
import { DomainResTYPE } from "../types/DataType.type.js";
import { LogBuilder } from "@repo/log-helper";


const projectRoot = path.resolve(process.cwd(), "../../");
const dotEnvPath = path.resolve(projectRoot, ".env");
env.config({ path: dotEnvPath });

const cfClient = new Cloudflare({
  apiToken: process.env.CLOUDFLARE_API_TOKEN,
});


export async function FetchDomains(): Promise<DomainResTYPE> {
  try {
    let { result } = await cfClient.zones.list();

    LogBuilder({
      domain: "general",
      logMessage: `Successfully fetched domains` ,
      logType: "info",
      logFileName: "cloudflare",
    });
    return {
      SUCCESS: true,
      MESSAGE: "Domain fetched successfully",
      DATA: result,
    };

  } catch (error) {
    const apiError = error instanceof Cloudflare.APIError ? error : undefined;
    LogBuilder({
      domain: "general",
      logMessage: `Failed to fetch domains: ${apiError?.message || error}`,
      logType: "error",
      logFileName: "cloudflare",
      error: error instanceof Error ? error : undefined,
    });
    return {
      SUCCESS: false,
      MESSAGE: "Failed to fetch domains",
      ERROR: apiError,
    };
  }
}
