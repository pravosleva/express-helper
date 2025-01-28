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
        targetMD: () => 'Счетчики в Питере 20-го числа. ЕИРЦ Санкт-Петербурга (ЕИРЦ ПЭС), ЕЛС 71100168967'
      },
    },
  },
  {
    id: 2,
    _descr: 'Single notif',
    isEnabled: true,
    cronSetting: isDev ? '15 45 18 10,11,12 * *' : '15 1 10 15 * *', // NOTE: Every month 15th at 10:01:15

    // NOTE: See also https://stackoverflow.com/questions/70889523/node-cron-job-to-run-on-28th-and-29th-day-of-every-month
    req: {
      url: `${tgBotApiUrl}/kanban-2021/reminder/send`,
      body: {
        // chat_id: 432590698, // NOTE: Den Pol
        chat_id: -1001917842024, // NOTE: My home -> Fryazino, Mira, 19 (topic)
        message_thread_id: 152, // https://t.me/c/1917842024/152

        eventCode: 'single_reminder',
        about: () => '_Не забудьте_',
        targetMD: () => 'Счетчики во Фрязино, Мира, 19 (c 15 по 26 числа). Приложение Мосэнергосбыт, Лицевой счет: 29614-328-09',
      },
    },
  },
  {
    id: 3,
    _descr: 'Single notif',
    isEnabled: true,
    cronSetting: '02 30 21 * * *', // Every day at 21:30:02
    req: {
      url: `${tgBotApiUrl}/kanban-2021/reminder/send`,
      body: {
        // chat_id: 432590698, // NOTE: Den
        chat_id: -1001917842024, // NOTE: My home -> Healthy habits (topic)
        message_thread_id: 1547, // https://t.me/c/1917842024/1547

        eventCode: 'single_reminder',
        about: () => '_А Вы не забыли?_',
        targetMD: () => 'Сделать упражнение для ног 👣'
      },
    },
  },
  {
    id: 4,
    _descr: 'Single notif',
    isEnabled: true,
    cronSetting: '10 15 21 * * *', // Every day at 21:15:10
    req: {
      url: `${tgBotApiUrl}/kanban-2021/reminder/send`,
      body: {
        // chat_id: 432590698, // NOTE: Den
        chat_id: -1001917842024, // NOTE: My home -> Healthy habits (topic)
        message_thread_id: 1547, // https://t.me/c/1917842024/1547

        eventCode: 'single_reminder',
        about: () => '_А Вы не забыли?_',
        targetMD: () => 'Сделать упражнение для глаз 👁️'
      },
    },
  },
  {
    id: 5,
    _descr: 'Single notif',
    isEnabled: true,
    cronSetting: isDev ? '15 45 18 10,11,12 * *' : '15 1 11 20 * *', // NOTE: Every month 20ty at 11:01:15
    req: {
      url: `${tgBotApiUrl}/kanban-2021/reminder/send`,
      body: {
        chat_id: -1001917842024, // NOTE: My home -> Rjev, Kosarova, 64 (topic)
        message_thread_id: 1021, // https://t.me/c/1917842024/1021
        eventCode: 'single_reminder',
        about: () => '_Не забудьте_',
        targetMD: () => 'Счетчики в г. Ржев, Косарова, 64 (c 20 по 25 числа).\nПриложения:\n1) АтомЭнергоСбыт (электричество);2) БРИС ЖКХ (туда приходит квитанция)',
      },
    },
  },
  {
    id: 6,
    _descr: 'Single notif',
    isEnabled: true,
    cronSetting: isDev ? '15 45 18 10,11,12 * *' : '15 1 11 1 * *', // NOTE: Every month 1 at 11:01:15
    req: {
      url: `${tgBotApiUrl}/kanban-2021/reminder/send`,
      body: {
        chat_id: -1001917842024, // NOTE: My home -> Fryazino, Mira, 19 (topic)
        message_thread_id: 152, // https://t.me/c/1917842024/152
        eventCode: 'single_reminder',
        about: () => '_Не забудьте_',
        targetMD: () => [
          'Квартплата (квитанция обычно приходит c 30 по 1 числа)',
          'Фрязино, Мира, 19-328',
          'Сдвинули напоминалку на 1 число, а то приходили до момета, когда в сбербанке счета сформированы',
        ].join('\n'),
      },
    },
  },
  {
    id: 7,
    _descr: 'Single notif',
    isEnabled: true,
    cronSetting: isDev ? '15 45 18 10,11,12 * *' : '15 2 11 1 * *', // NOTE: Every month 1 at 11:02:15
    req: {
      url: `${tgBotApiUrl}/kanban-2021/reminder/send`,
      body: {
        chat_id: -1001917842024, // NOTE: My home -> Fryazino, Des, 3 (topic)
        message_thread_id: 150, // https://t.me/c/1917842024/150
        eventCode: 'single_reminder',
        about: () => '_Не забудьте_',
        targetMD: () => [
          'Квартплата (квитанция обычно приходит c 30 по 1 числа)',
          'Фрязино, Десантников, 3-112',
          'Сдвинули напоминалку на 1 число, а то приходили до момета, когда в сбербанке счета сформированы',
        ].join('\n'),
      },
    },
  },
  {
    id: 8,
    _descr: 'Single notif',
    isEnabled: true,
    cronSetting: '01 40 14 * * *', // Every day at 14:40:01
    req: {
      url: `${tgBotApiUrl}/kanban-2021/reminder/send`,
      body: {
        chat_id: 432590698, // NOTE: Den
        eventCode: 'single_reminder',
        about: () => '_Reminder_',
        targetMD: () => '[Daily Meeting](https://telemost.yandex.ru/j/0580104877) 15:00'
      },
    },
  },
  // NOTE: See also doc https://stackoverflow.com/questions/31260837/how-to-run-a-cron-job-on-every-monday-wednesday-and-friday
  {
    id: 9,
    _descr: 'Single notif',
    isEnabled: true,
    cronSetting: '01 40 15 * * friday', // Every friday at 15:40:01
    req: {
      url: `${tgBotApiUrl}/kanban-2021/reminder/send`,
      body: {
        chat_id: 432590698, // NOTE: Den
        eventCode: 'single_reminder',
        about: () => '_Reminder_',
        targetMD: () => 'Weekly Meeting [Mains Lab - General] 16:00'
      },
    },
  },
]
