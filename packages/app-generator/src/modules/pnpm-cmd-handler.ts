import path from "path";
import { execa } from "execa";
import { TerminalOperationResultType } from "../types/DataType.js";

export async function pnpmCmdHandler({
  rootDir,
  domain,
}: {
  rootDir: string;
  domain: string;
}): Promise<TerminalOperationResultType> {
  const projectDir = path.join(rootDir, "apps", domain);

  try {
    const { stdio, stdout, stderr, exitCode } = await execa(
      "pnpm",
      ["install"],
      { cwd: projectDir, stdio: "inherit", timeout: 60000 }
    );    

    return {
      SUCCESS: true,
      MESSAGE: `pnpm commands executed successfully for domain: ${domain}`,
      stdout,
      stderr
    };
  } catch (error) {
    console.error("Error occurred while executing pnpm commands:", error);
    return {
      SUCCESS: false,
      MESSAGE: `pnpm commands failed for domain: ${domain}`,
    };
  }
}
