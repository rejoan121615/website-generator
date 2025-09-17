import Cloudflare from "cloudflare";
import fs from "fs-extra";
import path from "path";
import { execSync } from "node:child_process";
import { fileURLToPath } from "url";

export async function deploy({
  cfToken,
  cfId,
  projectName,
  branchName,
  outputDir,
}: {
  cfToken: string;
  cfId: string;
  projectName: string;
  branchName: string;
  outputDir: string;
}) {
  const client = new Cloudflare({
    apiToken: cfToken,
  });

  console.log("Starting deployment........... for project:", projectName);

  const modifiedProjectName = projectName
    .toLowerCase()
    .replace(/[^a-z0-9-]/g, "-")
    .replace(/^-+/, "")
    .replace(/-+$/, "")
    .replace(/--+/g, "-");

  // delete old csv file if exists
  const __filename = fileURLToPath(import.meta.url);
  const __dirname = path.dirname(__filename);
  const turboRepoRoot = path.resolve(__dirname, "../../../");
  const deploymentReportFilePath = path.join(
    turboRepoRoot,
    "reports",
    "deploy",
    projectName,
    "deployment_data.csv"
  );

  try {
    await fs.ensureFile(deploymentReportFilePath);
    await fs.outputFile(deploymentReportFilePath, ``);
  } catch (error) {
    console.log("Error ensuring or clearing deployment report file:", error);
  }

  // check if the project exists or create a new one

  try {
    const existingProjectRes = await client.pages.projects.get(
      modifiedProjectName,
      {
        account_id: cfId,
      }
    );

    console.log("Project already exists. Using the existing project...");
    const { id, name, domains, subdomain } = existingProjectRes;
    await fs.outputFile(
      deploymentReportFilePath,
      `id,name,domains,subdomain,currentDomain\n${id},${name},"${Array.isArray(domains) ? domains.join(";") : ""}","${subdomain ?? ""}","not-available"\n`
    );
  } catch (error) {
    console.log("Project not found, Creating new project...");

    try {
      // ceate new project
      const newProjectRes = await client.pages.projects.create({
        name: modifiedProjectName,
        account_id: cfId,
        production_branch: branchName,
      });

      console.log("New project created successfully...");

      // store this project data inside csv file
      const { id, name, domains, subdomain } = newProjectRes;
      await fs.outputFile(
        deploymentReportFilePath,
        `id,name,domains,subdomain\n${id},${name},"${Array.isArray(domains) ? domains.join(";") : ""}","${subdomain ?? ""}","not-available"\n`
      );
      console.log("Project data saved to CSV:", deploymentReportFilePath);
    } catch (error) {
      console.log("Creating new project failed:", error);
      process.exit(1);
    }
  }

  try {
    console.log("Started uploading source code to the project...");
    // upload source code to the project
    const staticWebsitePath = path.join(
      turboRepoRoot,
      "apps",
      projectName,
      "dist"
    );
    const command = `wrangler pages deploy "${staticWebsitePath}" --project-name ${modifiedProjectName} --branch ${branchName} --commit-dirty=true`;
    try {
      execSync(command, {
        stdio: "inherit",
        env: {
          ...process.env, // Inherit other environment variables from the parent process
          CLOUDFLARE_API_TOKEN: cfToken,
          CLOUDFLARE_ACCOUNT_ID: cfId,
        },
      });
    } catch (error) {
      console.log("Project upload failed:", error);
      process.exit(1);
    }

    // get the project details again to get the assigned domain
    client.pages.projects
      .get(modifiedProjectName, {
        account_id: cfId,
      })
      .then(async (projectDetails) => {
        try {
          const { id, name, domains, subdomain, latest_deployment } =
            projectDetails;
          await fs.outputFile(
            deploymentReportFilePath,
            `id,name,domains,subdomain,currentDomain\n${id},${name},"${Array.isArray(domains) ? domains.join(";") : ""}","${subdomain ?? ""}","${latest_deployment?.url ?? ""}"\n`
          );

          console.log("Deployment report file updated with latest domain...");
          process.exit(0);
        } catch (error) {
          console.log("Error writing latest published domain to file:", error);
          process.exit(1);
        }
      })
      .catch((error) => {
        console.log(
          "Error fetching project details, writing new published domain failed"
        );
        process.exit(1);
      });
  } catch (error) {
    console.log("Error uploading source code:", error);
    process.exit(1);
  }
}

/**
 * Delete a Cloudflare Pages project and all its deployments.
 * @param cfToken Cloudflare API token
 * @param cfId Cloudflare account ID
 * @param projectName Project name (unsanitized)
 */
export async function deleteProject({
  cfToken,
  cfId,
  projectName,
}: {
  cfToken: string;
  cfId: string;
  projectName: string;
}) {
  const client = new Cloudflare({ apiToken: cfToken });
  const modifiedProjectName = projectName
    .toLowerCase()
    .replace(/[^a-z0-9-]/g, "-")
    .replace(/^-+/, "")
    .replace(/-+$/, "")
    .replace(/--+/g, "-");

  console.log(`Attempting to delete project: ${modifiedProjectName}`);
  try {
    // Delete the project (this also deletes all deployments)
    await client.pages.projects.delete(modifiedProjectName, {
      account_id: cfId,
    });
    console.log(`Project '${modifiedProjectName}' deleted successfully.`);
  } catch (error) {
    console.error(`Failed to delete project '${modifiedProjectName}':`, error);
    throw error;
  }
}
