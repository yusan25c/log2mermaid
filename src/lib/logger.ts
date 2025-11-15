const isDevelopment = import.meta.env.DEV;

export const logger = {
  log: (...args: any[]) => isDevelopment && console.log(...args),
  error: (...args: any[]) => isDevelopment && console.error(...args),
  warn: (...args: any[]) => isDevelopment && console.warn(...args),
  info: (...args: any[]) => isDevelopment && console.info(...args),
};
