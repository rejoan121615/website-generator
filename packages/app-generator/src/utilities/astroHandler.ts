import 'dotenv/config'
import fs from "fs-extra";
import path from "path";
import type { CsvRowDataType } from "../types/DataType.js";
import { PageOptionsTYPE } from "../types/AstroHandler.js";

export function astroProjectBuilder(outputDir: string, data: CsvRowDataType) {
  const { domain } = data;

  tsConfigFileBuilder(domain);
  packageJsonFileBuilder(domain);
  astroConfigFileBuilder(domain);
  srcDataHandler(data);

  // const pagePath = path.join(process.cwd(), 'src', 'pages', 'index.astro');
  // let pageContent = fs.readFileSync(pagePath, 'utf-8');

  // console.log('Original Page Content:', pageContent);
}

// ts config file builder
function tsConfigFileBuilder(domain: string) {
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
    process.cwd(),
    "apps",
    domain,
    "tsconfig.json"
  );
  fs.createFileSync(tsConFilePath);
  fs.writeFileSync(tsConFilePath, JSON.stringify(tsConfigFileContent, null, 2));

  console.log(`Successfully created tsconfig.json for domain: ${domain}`);
}


// [projectName, outputDir, repoOwner, repoName]

// json config file builder
function packageJsonFileBuilder(domain: string) {

  // Sanitize domain to create a valid project name
  let projectName = domain
    .toLowerCase()
    .replace(/[^a-z0-9-]/g, '-')        // Replace invalid chars with dash
    .replace(/^-+/, '')                  // Remove leading dashes
    .replace(/-+$/, '')                  // Remove trailing dashes
    .replace(/--+/g, '-');               // Replace multiple dashes with single dash

  const packageJsonFileContent = {
    name: domain,
    type: "module",
    version: "0.0.1",
    scripts: {
      build: "astro build",
      deploy: `npx cf-deploy ${process.env.CLOUDFLARE_API_TOKEN} ${process.env.CLOUDFLARE_ACCOUNT_ID} ${projectName} dist ${process.env.GITHUB_USERNAME} ${process.env.GITHUB_REPOSITORY} ${process.env.DEPLOYMENT_BRANCH}`,
    },
    dependencies: {
      "@repo/basefrontend": "*",
    },
    imports: {
      BaseLayout: "@repo/basefrontend/layout",
      Content: "@repo/basefrontend/content",
    },
    devDependencies: {
      "@repo/cloudflaredeploy": "*",
    },
  };

  // create package.json file
  const packageJsonFilePath = path.join(
    process.cwd(),
    "apps",
    domain,
    "package.json"
  );
  fs.createFileSync(packageJsonFilePath);
  fs.writeFileSync(
    packageJsonFilePath,
    JSON.stringify(packageJsonFileContent, null, 2)
  );

  console.log(`Successfully created package.json for domain: ${domain}`);
}

// astro config file builder
function astroConfigFileBuilder(domain: string) {
  // create package.json file
  const packageJsonFilePath = path.join(
    process.cwd(),
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

  console.log(`Successfully created astro.config.mjs for domain: ${domain}`);
}

// src folder handler
async function srcDataHandler(data: CsvRowDataType) {
  const { domain, service_niche, main_city, phone } = data;

  // read component file from baseFrontend package and build new component file
  const componentFilePath = path.join(
    process.cwd(),
    "packages",
    "baseFrontend",
    "src",
    "components",
    "Content.astro"
  );

  const componentDestPath = path.join(
    process.cwd(),
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
  console.log("Copied Content.astro to", componentDestPath);

  // read page file , give props and build new page file
  const pageFilePath = path.join(
    process.cwd(),
    "packages",
    "baseFrontend",
    "src",
    "pages",
    "index.astro"
  );
  const pageDestPath = path.join(
    process.cwd(),
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
  console.log("Created index.astro to", pageDestPath);
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
