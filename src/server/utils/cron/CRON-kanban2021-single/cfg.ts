import { TCfg } from './interfaces'

// const isDev = process.env.NODE_ENV === 'development'
const tgBotApiUrl = process.env.PRAVOSLEVA_BOT_2021_NOTIFY_BASE_URL || ''
const isDev = process.env.NODE_ENV === 'development'

export const cfg: TCfg = [
  {
    id: 1,
    _descr: 'Single notif',
    isEnabled: true,
    cronSetting: isDev ? '15 45 18 10,11,12 * *' : '15 1 10 20 * *', // NOTE: Every month 20th at 10:01:15

    // NOTE: See also https://stackoverflow.com/questions/70889523/node-cron-job-to-run-on-28th-and-29th-day-of-every-month
    req: {
      url: `${tgBotApiUrl}/kanban-2021/reminder/send`,
      body: {
        // chat_id: 432590698, // NOTE: Den Pol
        chat_id: -1001917842024, // NOTE: My home -> Piter (topic)
        message_thread_id: 154, // https://t.me/c/1917842024/154

        eventCode: 'single_reminder',
        about: () => '_Не забудьте_',
        targetMD: () => 'Счетчики в Питере 20-го числа'
      },
    },
  },
]
