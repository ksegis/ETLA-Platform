import { Page } from 'playwright';
import * as fs from 'fs';
import * as path from 'path';
import { logger } from './logger';

const SCREENSHOTS_DIR = process.env.SCREENSHOTS_DIR || './screenshots';

/**
 * Ensure screenshots directory exists
 */
function ensureScreenshotsDir(): void {
  if (!fs.existsSync(SCREENSHOTS_DIR)) {
    fs.mkdirSync(SCREENSHOTS_DIR, { recursive: true });
  }
}

/**
 * Capture screenshot and save to file
 */
export async function captureScreenshot(
  page: Page,
  taskId: string,
  name: string
): Promise<string> {
  try {
    ensureScreenshotsDir();

    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const filename = `${taskId}_${name}_${timestamp}.png`;
    const filepath = path.join(SCREENSHOTS_DIR, filename);

    await page.screenshot({
      path: filepath,
      fullPage: true
    });

    logger.info('Screenshot captured', { taskId, name, filepath });

    return filepath;
  } catch (error: any) {
    logger.error('Failed to capture screenshot', {
      taskId,
      name,
      error: error.message
    });
    throw error;
  }
}

/**
 * Capture screenshot of a specific element
 */
export async function captureElementScreenshot(
  page: Page,
  selector: string,
  taskId: string,
  name: string
): Promise<string> {
  try {
    ensureScreenshotsDir();

    const element = await page.locator(selector);
    
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const filename = `${taskId}_${name}_element_${timestamp}.png`;
    const filepath = path.join(SCREENSHOTS_DIR, filename);

    await element.screenshot({
      path: filepath
    });

    logger.info('Element screenshot captured', { taskId, name, selector, filepath });

    return filepath;
  } catch (error: any) {
    logger.error('Failed to capture element screenshot', {
      taskId,
      name,
      selector,
      error: error.message
    });
    throw error;
  }
}

/**
 * Clean up old screenshots
 */
export function cleanupOldScreenshots(daysToKeep: number = 7): void {
  try {
    ensureScreenshotsDir();

    const files = fs.readdirSync(SCREENSHOTS_DIR);
    const now = Date.now();
    const maxAge = daysToKeep * 24 * 60 * 60 * 1000; // Convert days to milliseconds

    let deletedCount = 0;

    files.forEach(file => {
      const filepath = path.join(SCREENSHOTS_DIR, file);
      const stats = fs.statSync(filepath);
      const age = now - stats.mtimeMs;

      if (age > maxAge) {
        fs.unlinkSync(filepath);
        deletedCount++;
      }
    });

    logger.info('Old screenshots cleaned up', { deletedCount, daysToKeep });
  } catch (error: any) {
    logger.error('Failed to clean up screenshots', { error: error.message });
  }
}
