import path from "path";
import fs from "fs-extra";
import { CsvRowDataType } from "@repo/shared-types";
import { execa } from "execa";
import { DeployProject } from "../modules/DeployProject.js";

async function generateSingleProject() {
  // Get command line arguments (skip first 2: node and script path)
  console.log("Starting project deployment ...");
  const args = process.argv.slice(2);
  const hasDomainFlag = args.find((arg) => arg.trim() === "--domain");
  const hasDomain = args[1];

  if (!hasDomainFlag) {
    console.log(
      "The --domain flag is required. Add --domain domain.com at the end of your command."
    );
    return;
  } else if (!hasDomain) {
    console.log(
      "Please provide a domain after the --domain flag. Add --domain domain.com at the end of your command."
    );
    return;
  }

  try {
    //   read csv file from data/websites.csv
    const turboRepoRoot = path.resolve(process.cwd(), "../../");
    const staticSitePath = path.join(turboRepoRoot, "apps", hasDomain, 'dist');
    const cloudflarePath = path.join(turboRepoRoot, "apps", hasDomain, 'cloudflare');

    if (fs.pathExistsSync(staticSitePath) && fs.pathExistsSync(cloudflarePath)) {
        DeployProject({ domainName: hasDomain }).then((uploadResult) => {

        const { SUCCESS,  DATA } = uploadResult;
        if (SUCCESS && DATA) {

            console.log(`✓ ${hasDomain} => Please visit this url for preview => https://${DATA.subdomain} `)
        } else {
            console.error(`✗ Deployment failed for domain ${hasDomain}.`);
        }
        }).catch((error) => {
          console.error(`Error occurred during deployment for domain ${hasDomain}:`, error);
        });
    } else {
      console.log(`Project with this ${hasDomain} domain is not ready for deployment.`);
      console.log(`Make sure you have built this project already`);
      return;
    }

  } catch (error) {
    console.log("An error occurred during deployment:", error);
  }
}

// Execute the function
generateSingleProject();
