import { getRequestContext } from '@vercel/request-context';

interface LogContext {
  tenantId?: string;
  userId?: string;
  action?: string;
  [key: string]: any; // Allow other arbitrary properties
}

const log = (level: string, message: string, context?: LogContext) => {
  const requestContext = getRequestContext();
  const fullContext = {
    timestamp: new Date().toISOString(),
    level,
    message,
    ...requestContext,
    ...context,
  };
  console.log(JSON.stringify(fullContext));
};

export const logger = {
  info: (message: string, context?: LogContext) => log('info', message, context),
  warn: (message: string, context?: LogContext) => log('warn', message, context),
  error: (message: string, context?: LogContext) => log('error', message, context),
  debug: (message: string, context?: LogContext) => log('debug', message, context),
};

