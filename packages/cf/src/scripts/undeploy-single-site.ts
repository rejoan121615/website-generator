import path from "path";
import fs from "fs-extra";
import { deleteProject } from "../modules/DeleteProject.js";

async function undeploySingleProject() {
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
    deleteProject({ domainName: hasDomain })
      .then((data) => {
        if (data.SUCCESS) {
          console.log(
            `Project with domain ${hasDomain} has been undeployed successfully.`
          );
        } else {
            console.log(
              `Failed to undeploy project with domain ${hasDomain}. Reason: ${data.MESSAGE}`
            );
        }
      })
      .catch((error) => {
        console.log("An error occurred during undeployment:", error);
      });
  } catch (error) {
    console.log("An error occurred during deployment:", error);
  }
}

// Execute the function
undeploySingleProject();
