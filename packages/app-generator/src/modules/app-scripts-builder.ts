import fs from "fs-extra";
import path from "path";
import type { CsvAddressType, CsvRowDataType, PromiseResultType } from "../types/DataType.js";
import { PageOptionsTYPE } from "../types/AstroHandler.js";

// ts config file builder
export async function tsConfigFileBuilder(
  domain: string,
  turboRepoRoot: string
): Promise<PromiseResultType> {
  try {
    const tsConfigFileContent = {
      extends: "astro/tsconfigs/strict",
      compilerOptions: {
        baseUrl: ".",
        paths: {
          "@repo/basefrontend/layout": [
            "../../packages/baseFrontend/src/layouts/BaseLayout.astro",
          ],
          "@repo/basefrontend/content": [
            "../../packages/baseFrontend/src/components/Content.astro",
          ],
        },
      },
      include: [".astro/types.d.ts", "**/*"],
      exclude: ["dist"],
    };

    // create ts config file
    const tsConFilePath = path.join(
      turboRepoRoot,
      "apps",
      domain,
      "tsconfig.json"
    );
    fs.createFileSync(tsConFilePath);
    fs.writeFileSync(tsConFilePath, JSON.stringify(tsConfigFileContent, null, 2));

    console.log(`tsconfig.json created successfully ...`);
    return {
      success: true,
      message: `tsconfig.json created successfully for ${domain}`,
    };
  } catch (error: any) {
    return {
      success: false,
      message: `Error creating tsconfig.json for ${domain}: ${error?.message || error}`,
    };
  }
}

// json config file builder
export async function packageJsonFileBuilder(
  domain: string,
  srcPath: string,
  destPath: string
): Promise<PromiseResultType> {
  try {
    // Sanitize domain to create a valid project name
    console.log("Domain received for package.json processing: ", domain);
    const jsonContent = JSON.parse(await fs.readFile(srcPath, "utf-8"));
    // replace name field
    jsonContent.name = domain;
    jsonContent.scripts.build = "astro build";
    jsonContent.scripts.deploy = "node ./cloudflare/deploy.js";
    jsonContent.scripts.remove = "node ./cloudflare/remove.js";

    await fs.writeFile(destPath, JSON.stringify(jsonContent, null, 2), "utf-8");
    console.log(`package.json created successfully ...`);
    return {
      success: true,
      message: `package.json created successfully for ${domain}`,
    };
  } catch (error: any) {
    console.error(`Error processing package.json for domain: ${domain}`, error);
    return {
      success: false,
      message: `Error processing package.json for domain: ${domain}: ${error?.message || error}`,
    };
  }
}

// astro config file builder
export async function astroConfigFileBuilder({
  csvData,
  srcPath,
  destPath,
}: {
  csvData: CsvRowDataType;
  srcPath: string;
  destPath: string;
}): Promise<PromiseResultType> {
  try {
    // parse address
    const { address, service_name } = csvData;
    const { city }: CsvAddressType = JSON.parse(address);

    const serviceNameText = service_name.replaceAll(" ", "-").toLowerCase();

    // read astro config file
    const astroConfigFileContent = await fs.readFile(srcPath, "utf-8");

    // Extract the config object from astroConfigFileContent
    const configMatch = astroConfigFileContent.match(
      /defineConfig\s*\(\s*({[\s\S]*})\s*\)\s*;/
    );

    if (configMatch) {
      const astroConfigObject = configMatch[1].toString().trim();

      const newConfig = astroConfigObject.replace(
        /{/,
        `{
      
        vite: {
          build: {
            rollupOptions: {
              output: {
                assetFileNames: (assetInfo) => {
                  const service = "electronics"; // hardcoded service
                  const city = "dhaka"; // hardcoded city

                  const name = assetInfo.name
                    ?.replace(/\.[^/.]+$/, "") // remove extension
                    .replace(/\s+/g, "-") // replace spaces with hyphens
                    .toLowerCase(); // lowercase

                  return \`_astro/\${name}-\${serviceNameText}-\${city}.[hash][extname]\`;
                },
              },
            },
          },
        },`
      );

      const updatedFileContent = astroConfigFileContent.replace(configMatch[1], newConfig);
      await fs.writeFile(destPath, updatedFileContent, "utf-8");
      return {
        success: true,
        message: `astro.config.mjs created successfully for ${csvData.domain}`,
      };
    } else {
      console.log("No config object found.");
      return {
        success: false,
        message: `No config object found in astro config for ${csvData.domain}`,
      };
    }
  } catch (error: any) {
    return {
      success: false,
      message: `Error creating astro config for ${csvData.domain}: ${error?.message || error}`,
    };
  }
}
