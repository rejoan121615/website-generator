import fs from "fs-extra";
import path from "path";
import type { CsvRowDataType } from "../types/DataType.js";
import { PageOptionsTYPE } from "../types/AstroHandler.js";

// ts config file builder
export async function tsConfigFileBuilder(
  domain: string,
  turboRepoRoot: string
) {
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
}

// json config file builder
export async function packageJsonFileBuilder(
  domain: string,
  srcPath: string,
  destPath: string
) {
  try {
    // Sanitize domain to create a valid project name
    const jsonContent = JSON.parse(await fs.readFile(srcPath, "utf-8"));
    // replace name field
    jsonContent.name = domain;
    jsonContent.scripts.build = "astro build";
    jsonContent.scripts.deploy = "node ./cloudflare/deploy.js";
    jsonContent.scripts.remove = "node ./cloudflare/remove.js";
    await fs.writeFile(destPath, JSON.stringify(jsonContent, null, 2), "utf-8");
    console.log(`package.json created successfully ...`);
  } catch (error) {
    console.error(`Error processing package.json for domain: ${domain}`, error);
    process.exit(1);
  }

}

// astro config file builder
export async function astroConfigFileBuilder(
  domain: string,
  turboRepoRoot: string
) {
  // create package.json file
  const packageJsonFilePath = path.join(
    turboRepoRoot,
    "apps",
    domain,
    "astro.config.mjs"
  );
  fs.createFileSync(packageJsonFilePath);
  fs.writeFileSync(
    packageJsonFilePath,
    `// @ts-check
import { defineConfig } from 'astro/config';

// https://astro.build/config
export default defineConfig({
    outDir: 'dist'
});`
  );

  console.log(`astro.config.mjs created successfully ...`);
}
