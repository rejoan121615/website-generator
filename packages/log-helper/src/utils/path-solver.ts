import path from "path";
import { fileURLToPath } from "url";

export function getRootDir(targetPath: string) {
  const __filename = fileURLToPath(import.meta.url);
  const __dirname = path.dirname(__filename);
  if (!targetPath) {
    return __dirname;
  } else {
    return path.resolve(__dirname, targetPath);
  }
}
