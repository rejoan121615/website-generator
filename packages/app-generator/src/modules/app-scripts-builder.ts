import fs from "fs-extra";
import path from "path";
import { CsvRowDataType, CsvAddressType, EventResType } from '@repo/shared-types'

// ts config file builder
export async function tsConfigFileBuilder(
  domain: string,
  turboRepoRoot: string
): Promise<EventResType> {
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

    return {
      SUCCESS: true,
      MESSAGE: `tsconfig.json created successfully for ${domain}`,
    };
  } catch (error: any) {
    return {
      SUCCESS: false,
      MESSAGE: `Error creating tsconfig.json for ${domain}: ${error?.message || error}`,
    };
  }
}

// json config file builder
export async function packageJsonFileBuilder(
  domain: string,
  srcPath: string,
  destPath: string
): Promise<EventResType> {
  try {
    // Sanitize domain to create a valid project name
    const jsonContent = JSON.parse(await fs.readFile(srcPath, "utf-8"));
    // replace name field
    jsonContent.name = domain;
    jsonContent.scripts.build = "node ./scripts/build.js";
    jsonContent.scripts.deploy = "node ./cloudflare/deploy.js";
    jsonContent.scripts.remove = "node ./cloudflare/remove.js";

    // add package 
    jsonContent.dependencies["@repo/scripts"] = "workspace:*";
    jsonContent.dependencies["@repo/cf"] = "workspace:*";
    jsonContent.dependencies["sharp"] = "^0.34.4";

    await fs.writeFile(destPath, JSON.stringify(jsonContent, null, 2), "utf-8");
    return {
      SUCCESS: true,
      MESSAGE: `package.json created successfully for ${domain}`,
    };
  } catch (error: any) {
    console.error(`Error processing package.json for domain: ${domain}`, error);
    return {
      SUCCESS: false,
      MESSAGE: `Error processing package.json for domain: ${domain}: ${error?.message || error}`,
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
}): Promise<EventResType> {
  try {
    // parse address
    const { address, service_name,  } = csvData;
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

                  const name = assetInfo.name
                    ?.replace(/\.[^/.]+$/, "") // remove extension
                    .replace(/\s+/g, "-") // replace spaces with hyphens
                    .toLowerCase(); // lowercase

                  return \`_astro/\${name}-${serviceNameText}-${city}.[hash][extname]\`;
                },
              },
            },
          },
        },`
      );

      const updatedFileContent = astroConfigFileContent.replace(configMatch[1], newConfig);
      await fs.writeFile(destPath, updatedFileContent, "utf-8");
      return {
        SUCCESS: true,
        MESSAGE: `astro.config.mjs created successfully for ${csvData.domain}`,
      };
    } else {
      return {
        SUCCESS: false,
        MESSAGE: `No config object found in astro config for ${csvData.domain}`,
      };
    }
  } catch (error: any) {
    return {
      SUCCESS: false,
      MESSAGE: `Error creating astro config for ${csvData.domain}: ${error?.message || error}`,
    };
  }
}
