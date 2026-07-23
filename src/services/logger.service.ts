export class Logger {
  private enabled: boolean;

  constructor(enabled = true) {
    // Try to get the logger enabled state from the electron preload API
    try {
      // Access the electron API using type assertion to avoid TypeScript errors
      const electronAPI = (window as any).electron;
      if (electronAPI && typeof electronAPI.getLoggerEnabled === 'function') {
        this.enabled = electronAPI.getLoggerEnabled();
      } else {
        this.enabled = enabled;
      }
    } catch (e) {
      // Fallback to the provided value if there's an error
      this.enabled = enabled;
    }
  }

  log(...args: unknown[]) {
    if (!this.enabled) return;
    console.log(...args);
  }

  debug(...args: unknown[]) {
    if (!this.enabled) return;
    console.debug(...args);
  }

  info(...args: unknown[]) {
    if (!this.enabled) return;
    console.info(...args);
  }

  warn(...args: unknown[]) {
    if (!this.enabled) return;
    console.warn(...args);
  }

  error(...args: unknown[]) {
    if (!this.enabled) return;
    console.error(...args);
  }
}
