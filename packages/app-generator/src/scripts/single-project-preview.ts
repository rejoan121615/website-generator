import path from "path";
import fs from "fs-extra";
import { execa } from "execa";

async function deploySingleProject() {
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
    const projectDir = path.join(turboRepoRoot, "apps", hasDomain);
    const staticSitePath = path.join(turboRepoRoot, "apps", hasDomain, "dist");

    if (fs.pathExistsSync(staticSitePath)) {
      try {
        await execa("pnpm", ["preview"], {
          cwd: projectDir,
          stdio: "inherit", 
        });

      } catch (error) {
        console.error("Error during pnpm install and build:", error);
      }
    } else {
      console.log(
        `Project with this ${hasDomain} domain is not ready for preview.`
      );
      console.log(`Make sure you have built this project already`);
      return;
    }
  } catch (error) {
    console.log("An error occurred during deployment:", error);
  }
}

// Execute the function
deploySingleProject();
