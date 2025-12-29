/**
 * Cron scheduler service
 * Manages scheduled tasks for the application
 * Currently handles:
 * - Appointment reminder SMS (daily at 9 AM)
 */

import * as cron from 'node-cron';
import { logger } from '../../utils/logger';
import { processAppointmentReminders } from '../notifications/appointmentReminderService';

// Store active cron jobs
const activeCronJobs: Map<string, cron.ScheduledTask> = new Map();

/**
 * Schedule appointment reminders to run daily at 9:00 AM AEST
 * Checks for appointments 24 hours ahead and sends SMS reminders
 */
function scheduleAppointmentReminders() {
  // Run every day at 9:00 AM (cron format: minute hour day month weekday)
  // '0 9 * * *' = At 9:00 AM every day
  const schedule = '0 9 * * *';

  const task = cron.schedule(
    schedule,
    async () => {
      logger.info('Running scheduled appointment reminder job');
      try {
        const summary = await processAppointmentReminders();
        logger.info(
          {
            total: summary.totalProcessed,
            sent: summary.sent,
            failed: summary.failed,
          },
          'Completed scheduled appointment reminder job'
        );
      } catch (error) {
        logger.error(
          { err: error },
          'Error in scheduled appointment reminder job'
        );
      }
    },
    {
      timezone: 'Australia/Melbourne', // AEST/AEDT
    }
  );

  activeCronJobs.set('appointmentReminders', task);
  logger.info(
    { schedule, timezone: 'Australia/Melbourne' },
    'Scheduled appointment reminder job created'
  );
}

/**
 * Initialize all scheduled jobs
 * Call this once when the server starts
 */
export function initializeScheduledJobs() {
  logger.info('Initializing scheduled jobs...');

  // Register all scheduled tasks
  scheduleAppointmentReminders();

  logger.info(
    { jobCount: activeCronJobs.size },
    'Scheduled jobs initialized and running'
  );
}

/**
 * Start all scheduled jobs (kept for backward compatibility)
 * Jobs now auto-start when scheduled
 */
export function startAllJobs() {
  logger.info('All scheduled jobs are already running');
}

/**
 * Stop all scheduled jobs
 * Call this during graceful shutdown
 */
export function stopAllJobs() {
  logger.info('Stopping all scheduled jobs...');

  let stoppedCount = 0;
  activeCronJobs.forEach((task, name) => {
    task.stop();
    stoppedCount++;
    logger.info({ jobName: name }, 'Scheduled job stopped');
  });

  logger.info({ stoppedCount }, 'All scheduled jobs stopped');
}

/**
 * Get status of all scheduled jobs
 * Useful for debugging and monitoring
 */
export function getJobStatus(): Record<string, boolean> {
  const status: Record<string, boolean> = {};

  activeCronJobs.forEach((task, name) => {
    // Note: node-cron doesn't expose running status directly
    // We can only track if it's been started/stopped by us
    status[name] = true; // If it's in the map, it's registered
  });

  return status;
}

/**
 * Manually trigger a specific job (for testing/debugging)
 */
export async function triggerJob(jobName: string): Promise<void> {
  logger.info({ jobName }, 'Manually triggering scheduled job');

  switch (jobName) {
    case 'appointmentReminders':
      await processAppointmentReminders();
      break;
    default:
      throw new Error(`Unknown job name: ${jobName}`);
  }
}
