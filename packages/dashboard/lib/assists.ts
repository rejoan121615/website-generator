import path from "path";
import { fileURLToPath } from "url";
import { ServerEventResTYPE } from "@repo/shared-types";

export function ProjectRoot() : string {
  const __filename = fileURLToPath(import.meta.url);
  const __dirname = path.dirname(__filename);
  return path.resolve(
    __dirname,
    "../../../"
  );
}

// sse server response handler function
export function sendSSE(
  controller: ReadableStreamDefaultController,
  data: ServerEventResTYPE
) {
  const jsonData = JSON.stringify(data);

  const sseFormatted = `data: ${jsonData}\n\n`;

  controller.enqueue(sseFormatted);
}
