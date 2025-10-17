import env from "dotenv";
import Cloudflare from "cloudflare";
import path from "path";
import { DomainResTYPE, ProjectsResTYPE } from "../types/DataType.type.js";


const projectRoot = path.resolve(process.cwd(), "../../");
const dotEnvPath = path.resolve(projectRoot, ".env");
env.config({ path: dotEnvPath });

const cfClient = new Cloudflare({
  apiToken: process.env.CLOUDFLARE_API_TOKEN,
});


export async function FetchProjects(): Promise<ProjectsResTYPE> {
  try {
    let { result } = await cfClient.pages.projects.list({
        account_id: process.env.CLOUDFLARE_ACCOUNT_ID!,
    });

    console.log('Your projects res', result);

    return {
      SUCCESS: true,
      MESSAGE: "Projects fetched successfully",
      DATA: result,
    };

  } catch (error) {
    const apiError = error instanceof Cloudflare.APIError ? error : undefined;
    return {
      SUCCESS: false,
      MESSAGE: "Failed to fetch domains",
      ERROR: apiError,
    };
  }
}
