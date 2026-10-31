import cron from 'node-cron';
import { mockDb } from '../utils/mockDbStore.js';

export function initializeRecurringScheduler() {
  // Run daily check at 08:00 AM (or every 5 minutes in development for demonstration)
  console.log('⏰ Initializing Automated Recurring Shopping List Cron Scheduler...');

  cron.schedule('0 8 * * *', () => {
    const todayStr = new Date().toISOString().split('T')[0];
    const todayDayOfMonth = new Date().getDate();

    console.log(`[CRON] Running daily recurring lists check for day ${todayDayOfMonth}...`);

    const eligibleLists = mockDb.recurringLists.filter(
      (list) => list.status === 'active' && list.scheduledDay === todayDayOfMonth
    );

    console.log(`[CRON] Found ${eligibleLists.length} recurring subscription list(s) ready for execution.`);
  });
}
