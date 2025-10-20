export type LogDataTYPE = {
  timestamp: string;
  message: string;
  type: "info" | "error" | "warning";
  context?: string;
}