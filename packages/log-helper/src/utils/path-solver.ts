import path from "path";

export function getRootDir(targetPath: string) {
  if (!targetPath) {
    return __dirname;
  } else {
    return path.resolve(__dirname, targetPath);
  }
}
