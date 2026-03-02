type LogLevel = "info" | "warn" | "error";

interface LogEntry {
  level: LogLevel;
  message: string;
  timestamp: string;
  data?: Record<string, unknown>;
}

/**
 * Structured logger — replacement for console.log throughout the codebase.
 * Outputs JSON-structured log entries for easier parsing in production.
 *
 * Sentry integration (when ready):
 * 1. npm install @sentry/nextjs
 * 2. Run `npx @sentry/wizard@latest -i nextjs`
 * 3. In the error() method below, add: Sentry.captureException(data?.error ?? message)
 * 4. In the warn() method, optionally add: Sentry.captureMessage(message, "warning")
 * 5. Configure sentry.client.config.ts and sentry.server.config.ts
 */
export const logger = {
  /**
   * Log an informational message.
   * @param message - The log message
   * @param data - Optional structured data to include
   */
  info(message: string, data?: Record<string, unknown>): void {
    const entry = buildEntry("info", message, data);
    process.stdout.write(JSON.stringify(entry) + "\n");
  },

  /**
   * Log a warning message.
   * @param message - The log message
   * @param data - Optional structured data to include
   */
  warn(message: string, data?: Record<string, unknown>): void {
    const entry = buildEntry("warn", message, data);
    process.stdout.write(JSON.stringify(entry) + "\n");
  },

  /**
   * Log an error message.
   * @param message - The log message
   * @param data - Optional structured data to include (never raw stack traces)
   */
  error(message: string, data?: Record<string, unknown>): void {
    const entry = buildEntry("error", message, data);
    process.stderr.write(JSON.stringify(entry) + "\n");
  },
};

function buildEntry(
  level: LogLevel,
  message: string,
  data?: Record<string, unknown>
): LogEntry {
  const entry: LogEntry = {
    level,
    message,
    timestamp: new Date().toISOString(),
  };
  if (data !== undefined) {
    entry.data = data;
  }
  return entry;
}
