import { createClient } from '@supabase/supabase-js';
import { logger } from '../utils/logger';
import { PaycomI9Upload } from '../automations/paycom/PaycomI9Upload';
import { AutomationTask } from '../automations/base/BaseAutomation';

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

/**
 * Process a single RPA task
 */
async function processTask(task: AutomationTask): Promise<void> {
  logger.info('Processing task', {
    taskId: task.id,
    taskType: task.task_type
  });

  try {
    let automation;

    // Route to appropriate automation based on task type
    switch (task.task_type) {
      case 'paycom_i9_upload':
        automation = new PaycomI9Upload(task);
        break;

      // Add more automation types here
      // case 'paycom_timecard':
      //   automation = new PaycomTimecard(task);
      //   break;

      default:
        throw new Error(`Unknown task type: ${task.task_type}`);
    }

    // Execute the automation
    const result = await automation.run();

    logger.info('Task completed', {
      taskId: task.id,
      success: result.success,
      message: result.message
    });
  } catch (error: any) {
    logger.error('Task processing failed', {
      taskId: task.id,
      error: error.message,
      stack: error.stack
    });

    // Update task status to failed
    await supabase
      .from('rpa_tasks')
      .update({
        status: 'failed',
        error_message: error.message,
        error_stack: error.stack,
        completed_at: new Date().toISOString()
      })
      .eq('id', task.id);
  }
}

/**
 * Poll for pending tasks and process them
 */
async function pollTasks(): Promise<void> {
  try {
    // Get pending tasks
    const { data: tasks, error } = await supabase
      .from('rpa_tasks')
      .select('*')
      .eq('status', 'pending')
      .order('priority', { ascending: false })
      .order('created_at', { ascending: true })
      .limit(1);

    if (error) {
      logger.error('Failed to fetch tasks', { error });
      return;
    }

    if (!tasks || tasks.length === 0) {
      logger.debug('No pending tasks found');
      return;
    }

    const task = tasks[0];

    // Mark task as queued
    await supabase
      .from('rpa_tasks')
      .update({ status: 'queued' })
      .eq('id', task.id);

    // Process the task
    await processTask(task);
  } catch (error: any) {
    logger.error('Error polling tasks', { error: error.message });
  }
}

/**
 * Start the worker
 */
export async function startWorker(): Promise<void> {
  logger.info('Starting RPA worker');

  const pollInterval = parseInt(process.env.POLL_INTERVAL || '5000');

  // Poll for tasks at regular intervals
  setInterval(async () => {
    await pollTasks();
  }, pollInterval);

  // Process immediately on start
  await pollTasks();

  logger.info('RPA worker started', { pollInterval });
}

// Start worker if this file is run directly
if (require.main === module) {
  startWorker().catch(error => {
    logger.error('Worker failed to start', { error });
    process.exit(1);
  });
}
