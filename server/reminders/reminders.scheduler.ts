import { remindersService } from './reminders.service.js';
import { REMINDER_CHECK_INTERVAL_MS } from './reminders.constants.js';

class RemindersScheduler {
  private timer: NodeJS.Timeout | null = null;

  start() {
    console.log(`⏱ [RemindersScheduler] Starting background task scheduler (interval: 10 minutes)...`);

    // Initial check on boot after 5 seconds
    setTimeout(() => {
      this.runCheck();
    }, 5000);

    // Periodic schedule
    this.timer = setInterval(() => {
      this.runCheck();
    }, REMINDER_CHECK_INTERVAL_MS);
  }

  stop() {
    if (this.timer) {
      clearInterval(this.timer);
      this.timer = null;
      console.log(`⏹ [RemindersScheduler] Background scheduler stopped.`);
    }
  }

  async runCheck() {
    try {
      await remindersService.checkAndSendReminders();
    } catch (err: any) {
      console.error(`❌ [RemindersScheduler] Error during scheduled reminder execution:`, err.message || err);
    }
  }
}

export const remindersScheduler = new RemindersScheduler();
