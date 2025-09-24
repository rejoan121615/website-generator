import fs from "fs-extra";
import path from "path";
import type { CsvRowDataType } from "../types/DataType.js";
import { PageOptionsTYPE } from "../types/AstroHandler.js";



// ts config file builder
export async function tsConfigFileBuilder(domain: string, turboRepoRoot: string) {
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
export async function packageJsonFileBuilder(domain: string, turboRepoRoot: string) {
  // Sanitize domain to create a valid project name
  const packageJsonFileContent = {
    name: domain,
    type: "module",
    version: "0.0.1",
    scripts: {
      build: "astro build",
      preview: "astro preview",
      deploy: "node ./cloudflare/deploy.js",
      remove: "node ./cloudflare/remove.js"
    },
    dependencies: {
      "@repo/basefrontend": "workspace:*",
      "@repo/cf": "workspace:*",
      astro: "^5.13.7",
    },
    imports: {
      BaseLayout: "@repo/basefrontend/layout",
      Content: "@repo/basefrontend/content",
    },
  };

  // create package.json file
  const packageJsonFilePath = path.join(
    turboRepoRoot,
    "apps",
    domain,
    "package.json"
  );
  fs.createFileSync(packageJsonFilePath);
  fs.writeFileSync(
    packageJsonFilePath,
    JSON.stringify(packageJsonFileContent, null, 2)
  );

  console.log(`package.json created successfully ...`);
}

// astro config file builder
export async function astroConfigFileBuilder(domain: string, turboRepoRoot: string) {
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
