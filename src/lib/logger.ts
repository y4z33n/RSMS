const LOG_LEVELS = {
  DEBUG: 'DEBUG',
  INFO: 'INFO',
  WARN: 'WARN',
  ERROR: 'ERROR'
} as const;

type LogLevel = typeof LOG_LEVELS[keyof typeof LOG_LEVELS];

function formatLog(level: LogLevel, component: string, message: string, data?: any) {
  const timestamp = new Date().toISOString();
  const logData = data ? `\nData: ${JSON.stringify(data, null, 2)}` : '';
  return `[${timestamp}] [${level}] [${component}] ${message}${logData}`;
}

export const logger = {
  debug: (component: string, message: string, data?: any) => {
    console.debug(formatLog(LOG_LEVELS.DEBUG, component, message, data));
  },
  info: (component: string, message: string, data?: any) => {
    console.info(formatLog(LOG_LEVELS.INFO, component, message, data));
  },
  warn: (component: string, message: string, data?: any) => {
    console.warn(formatLog(LOG_LEVELS.WARN, component, message, data));
  },
  error: (component: string, message: string, error?: any) => {
    console.error(formatLog(LOG_LEVELS.ERROR, component, message, error));
  }
}; 