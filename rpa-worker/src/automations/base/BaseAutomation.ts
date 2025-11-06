import { Browser, Page, chromium } from 'playwright';
import { logger } from '../../utils/logger';
import { captureScreenshot } from '../../utils/screenshots';
import { createClient, SupabaseClient } from '@supabase/supabase-js';

export interface AutomationResult {
  success: boolean;
  message: string;
  data?: any;
  screenshots?: string[];
  error?: string;
}

export interface AutomationTask {
  id: string;
  task_type: string;
  input_data: any;
  tenant_id: string;
}

export abstract class BaseAutomation {
  protected browser: Browser | null = null;
  protected page: Page | null = null;
  protected supabase: SupabaseClient;
  protected task: AutomationTask;
  protected screenshots: string[] = [];

  constructor(task: AutomationTask) {
    this.task = task;
    this.supabase = createClient(
      process.env.SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );
  }

  /**
   * Initialize browser and page
   */
  protected async initBrowser(headless: boolean = true): Promise<void> {
    logger.info(`Initializing browser for task ${this.task.id}`, {
      taskId: this.task.id,
      headless
    });

    this.browser = await chromium.launch({
      headless,
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
        '--disable-gpu'
      ]
    });

    this.page = await this.browser.newPage({
      viewport: { width: 1920, height: 1080 },
      userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
    });

    // Enable request/response logging
    this.page.on('console', msg => {
      logger.debug(`Browser console: ${msg.text()}`);
    });

    this.page.on('pageerror', error => {
      logger.error(`Browser error: ${error.message}`);
    });
  }

  /**
   * Take screenshot and upload to Supabase Storage
   */
  protected async takeScreenshot(name: string): Promise<string | null> {
    if (!this.page) {
      logger.warn('Cannot take screenshot: page not initialized');
      return null;
    }

    try {
      const screenshotPath = await captureScreenshot(
        this.page,
        this.task.id,
        name
      );

      // Upload to Supabase Storage
      const fileName = `${this.task.id}/${name}.png`;
      const { data, error } = await this.supabase.storage
        .from('rpa-screenshots')
        .upload(fileName, screenshotPath, {
          contentType: 'image/png',
          upsert: true
        });

      if (error) {
        logger.error('Failed to upload screenshot', { error });
        return null;
      }

      const { data: urlData } = this.supabase.storage
        .from('rpa-screenshots')
        .getPublicUrl(fileName);

      this.screenshots.push(urlData.publicUrl);
      return urlData.publicUrl;
    } catch (error) {
      logger.error('Screenshot capture failed', { error });
      return null;
    }
  }

  /**
   * Update task status in database
   */
  protected async updateTaskStatus(
    status: string,
    data?: Partial<AutomationTask>
  ): Promise<void> {
    try {
      await this.supabase
        .from('rpa_tasks')
        .update({
          status,
          ...data,
          updated_at: new Date().toISOString()
        })
        .eq('id', this.task.id);

      logger.info(`Task status updated to ${status}`, {
        taskId: this.task.id,
        status
      });
    } catch (error) {
      logger.error('Failed to update task status', { error });
    }
  }

  /**
   * Log audit event
   */
  protected async logAuditEvent(
    eventType: string,
    message: string,
    data?: any
  ): Promise<void> {
    try {
      await this.supabase.from('rpa_audit_log').insert({
        tenant_id: this.task.tenant_id,
        task_id: this.task.id,
        event_type: eventType,
        event_message: message,
        event_data: data
      });
    } catch (error) {
      logger.error('Failed to log audit event', { error });
    }
  }

  /**
   * Cleanup browser resources
   */
  protected async cleanup(): Promise<void> {
    try {
      if (this.page) {
        await this.page.close();
        this.page = null;
      }
      if (this.browser) {
        await this.browser.close();
        this.browser = null;
      }
      logger.info(`Browser cleanup completed for task ${this.task.id}`);
    } catch (error) {
      logger.error('Browser cleanup failed', { error });
    }
  }

  /**
   * Main execution method - must be implemented by subclasses
   */
  abstract execute(): Promise<AutomationResult>;

  /**
   * Run the automation with error handling
   */
  async run(): Promise<AutomationResult> {
    try {
      await this.updateTaskStatus('running', {
        started_at: new Date().toISOString()
      });

      await this.logAuditEvent('task_started', 'Automation task started');

      const result = await this.execute();

      await this.updateTaskStatus(
        result.success ? 'completed' : 'failed',
        {
          completed_at: new Date().toISOString(),
          output_data: result.data,
          error_message: result.error,
          screenshot_urls: this.screenshots
        }
      );

      await this.logAuditEvent(
        result.success ? 'task_completed' : 'task_failed',
        result.message,
        result.data
      );

      return result;
    } catch (error: any) {
      logger.error('Automation execution failed', {
        taskId: this.task.id,
        error: error.message,
        stack: error.stack
      });

      await this.takeScreenshot('error');

      await this.updateTaskStatus('failed', {
        completed_at: new Date().toISOString(),
        error_message: error.message,
        error_stack: error.stack,
        screenshot_urls: this.screenshots
      });

      await this.logAuditEvent('task_error', 'Automation error occurred', {
        error: error.message,
        stack: error.stack
      });

      return {
        success: false,
        message: `Automation failed: ${error.message}`,
        error: error.message,
        screenshots: this.screenshots
      };
    } finally {
      await this.cleanup();
    }
  }
}
