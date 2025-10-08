import { exec } from 'child_process';
import { promisify } from 'util';

export async function pnpmCmdHandler({ rootDir, domain }: { rootDir: string; domain: string }) {

    const execAsync = promisify(exec);

  try {

    console.log("Running pnpm install...", rootDir, domain);

    // await execAsync("pnpm install", { cwd: process.cwd() });
    // await execAsync("pnpm build", { cwd: process.cwd() });
  } catch (error) {
    console.error("Error occurred while executing pnpm commands:", error);
  }
}