import fs from "fs-extra";
import path from "path";
import type { CsvRowDataType } from "../types/DataType.js";
import { PageOptionsTYPE } from "../types/AstroHandler.js";

export function astroProjectBuilder(
  turboRepoRoot: string,
  data: CsvRowDataType
) {
  const { domain } = data;

  tsConfigFileBuilder(domain, turboRepoRoot);
  packageJsonFileBuilder(domain, turboRepoRoot);
  astroConfigFileBuilder(domain, turboRepoRoot);
  srcDataHandler(data, turboRepoRoot);
}

// ts config file builder
function tsConfigFileBuilder(domain: string, turboRepoRoot: string) {
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
function packageJsonFileBuilder(domain: string, turboRepoRoot: string) {
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
function astroConfigFileBuilder(domain: string, turboRepoRoot: string) {
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

// src folder handler
async function srcDataHandler(data: CsvRowDataType, turboRepoRoot: string) {
  const { domain, service_niche, main_city, phone } = data;

  // read component file from baseFrontend package and build new component file
  const componentFilePath = path.join(
    turboRepoRoot,
    "packages",
    "baseFrontend",
    "src",
    "components",
    "Content.astro"
  );

  const componentDestPath = path.join(
    turboRepoRoot,
    "apps",
    data.domain,
    "src",
    "components",
    "Content.astro"
  );

  // Ensure the destination directory exists
  await fs.ensureDir(path.dirname(componentDestPath));
  // Create the file if it doesn't exist
  await fs.ensureFile(componentDestPath);

  fs.copyFileSync(componentFilePath, componentDestPath);

  // read page file , give props and build new page file
  const pageFilePath = path.join(
    turboRepoRoot,
    "packages",
    "baseFrontend",
    "src",
    "pages",
    "index.astro"
  );
  const pageDestPath = path.join(
    turboRepoRoot,
    "apps",
    data.domain,
    "src",
    "pages",
    "index.astro"
  );

  let pageContent = await fs.readFile(pageFilePath, "utf-8");
  await fs.createFile(pageDestPath);

  const newPageContent = await pageInterceptor(pageContent, {
    imports: [
      `import BaseLayout from '@repo/basefrontend/layout'`,
      `import Content from '@repo/basefrontend/content'`,
    ],
    components: [
      {
        name: "Content",
        props: {
          domain: domain,
          service_niche: service_niche,
          main_city: main_city,
          phone: phone,
        },
      },
    ],
  });

  await fs.writeFile(pageDestPath, newPageContent);
  console.log(" Astro app created successfully ... ");
}

// Example usage in your generator script
async function pageInterceptor(
  pageContent: string,
  pageData: PageOptionsTYPE
): Promise<string> {
  const { components, imports } = pageData;

  // update imports
  const importSectionRegex = /^---\s*([\s\S]*?)^---/m;
  const newImportSection = `---\n${imports.join("\n")}\n---`;
  pageContent = pageContent.replace(importSectionRegex, newImportSection);

  // update page content components
  const componentSectionRegex =
    /<!-- --- GENERATE --- -->([\s\S]*?)<!-- --- GENERATE --- -->/m;
  const newComponentSection = components
    .map((component) => {
      const propsString = Object.entries(component.props)
        .map(([key, value]) => `${key}={\"${value}\"}`)
        .join(" ");
      return `<${component.name} ${propsString} />`;
    })
    .join("\n");
  pageContent = pageContent.replace(componentSectionRegex, newComponentSection);

  return pageContent;
}
