export interface ILogger {
  error(message: string, meta?: unknown): void;
  warn(message: string, meta?: unknown): void;
  info(message: string, meta?: unknown): void;
  log(message: string, meta?: unknown): void;
}
