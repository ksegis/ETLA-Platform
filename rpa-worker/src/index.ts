import dotenv from 'dotenv';
import { startWorker } from './queue/worker';
import { logger } from './utils/logger';
import { cleanupOldScreenshots } from './utils/screenshots';

// Load environment variables
dotenv.config();

// Validate required environment variables
const requiredEnvVars = [
  'SUPABASE_URL',
  'SUPABASE_SERVICE_ROLE_KEY',
  'ENCRYPTION_KEY'
];

for (const envVar of requiredEnvVars) {
  if (!process.env[envVar]) {
    logger.error(`Missing required environment variable: ${envVar}`);
    process.exit(1);
  }
}

// Handle graceful shutdown
process.on('SIGTERM', () => {
  logger.info('SIGTERM received, shutting down gracefully');
  process.exit(0);
});

process.on('SIGINT', () => {
  logger.info('SIGINT received, shutting down gracefully');
  process.exit(0);
});

// Handle uncaught exceptions
process.on('uncaughtException', (error) => {
  logger.error('Uncaught exception', { error: error.message, stack: error.stack });
  process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
  logger.error('Unhandled rejection', { reason, promise });
  process.exit(1);
});

// Clean up old screenshots on startup
cleanupOldScreenshots(7);

// Schedule daily cleanup
setInterval(() => {
  cleanupOldScreenshots(7);
}, 24 * 60 * 60 * 1000); // Run once per day

// Start the worker
startWorker().catch((error) => {
  logger.error('Failed to start worker', { error: error.message });
  process.exit(1);
});

logger.info('RPA Worker initialized');
