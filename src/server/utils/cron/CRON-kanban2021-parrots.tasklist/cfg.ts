import { TCfg } from './interfaces'
// import { EMessageStatus, TMessage, TRoomTask } from '~/utils/socket/state'
import { sortArrayByKeys } from '~/utils/sort/sortArrayByKeys'
// import { getStatusTranslated, statusCfg } from '~/utils/socket/state/getStatusTranslated'
import plural from 'plural-ru'
import { getTimeAgo } from '~/utils/getTimeAgo'
// import { NNotifs } from '~/routers/chat/mws/api/common-notifs'
import { getTimeDiff } from '~/utils/getTimeDiff'
// import { TEnhancedTask } from './interfaces'

// const isDev = process.env.NODE_ENV === 'development'
const tgBotApiUrl = process.env.PRAVOSLEVA_BOT_2021_NOTIFY_BASE_URL || ''

// NOTE: Chat link example: http://gosuslugi.pravosleva.pro/express-helper/chat/#/chat?room=audit.lidiya005

const daysRangeHalf = 7

export const cfg: TCfg = [
  {
    id: 1,
    _descr: `${daysRangeHalf} days perspective: !isCompleted || (isLooped & isCompleted & Will be ready soon (or ready in ${daysRangeHalf} days))`,
    isEnabled: true,
    // cronSetting: '0 11 * * Mon', // Every Mon at 11:00
    cronSetting: '10 1 10 * * *', // Every day at 10:01:10
    // cronSetting: '10 0 11 * * *', // Every day at 11:00:10
    // cronSetting: '44 13 * * Thu',
    // cronSetting: isDev ? '*/10 * * * * *' : '10 1 10 * * *', // NOTE: Every 10 secs for isDev
    validateBeforeRequest: ({ tasks }) => tasks.length > 0,
    _specialMsgValidator(task) {
      // NOTE: Интересуют только те задачи, до uncheck которых осталось менее daysRangeHalf дней
      const {
        isCompleted,
        isLooped,
        checkTs,
        uncheckTs,
        fixedDiff,
      } = task

      if (!uncheckTs || !fixedDiff) return false

      const isFirstLoopRunning = isLooped && !(!!checkTs && !!uncheckTs)
      if (!isCompleted && isFirstLoopRunning) return false

      // const targetDate = new Date(task.uncheckTs + task.fixedDiff)
      const timeEnd = checkTs + (checkTs - uncheckTs)
      const diff = getTimeDiff({
        startDate: new Date(),
        finishDate: new Date(timeEnd)
      })
      const isCorrect = !!checkTs && isCompleted && isLooped && diff.d <= daysRangeHalf
      // /* NOTE: Task example
      // { ts: 1639316052419,
      //   title: 'New test',
      //   isCompleted: true,
      //   isLooped: true,
      //   editTs: 1683791624193,
      //   fixedDiff: 327588748,
      //   uncheckTs: 1683464035445,
      //   checkTs: 1683791624193, } */
      return isCorrect
    },
    targetRooms: ['magaz'],
    targetHashtags: [],
    ignoredHashTags: ['#кот'],
    req: {
      url: `${tgBotApiUrl}/kanban-2021/reminder/send`,
      body: {
        // chat_id: 432590698, // NOTE: Den Pol
        chat_id: -1001917842024, // NOTE: My home -> Reminder (topic) https://t.me/c/1917842024/5
        message_thread_id: 5,

        eventCode: 'tasklist_reminder_daily',
        about: ({ tasks, targetHashtags, /* targetRooms, */ }) => {
          return `_В ближайшей перспективе (${plural(daysRangeHalf, '%d день', '%d дня', '%d дней')}) ${plural(tasks.length, 'потребует', 'потребуют')} решения ${plural(tasks.length, '%d задача', '%d задачи', '%d задач')}_${targetHashtags.length > 0 ? `\n*${targetHashtags.join(' ')}*` : ''}`
        },
        targetMD: ({ tasks, /* targetHashtags, targetRooms, */ }) => {
          const sortedMsgs = sortArrayByKeys({
            arr: tasks,
            keys: ['uncheckTs'],
            order: 1,
          })
          
          return sortedMsgs.map((task, i) => {
            const {
              title,
              uncheckTs,
              checkTs,
              // fixedDiff,
              room,
              // isCompleted,
              // isLooped,
            } = task

            // const targetDate = new Date(uncheckTs + fixedDiff)
            const timeEnd: number = checkTs + (checkTs - uncheckTs)
            const diff = getTimeDiff({
              startDate: new Date(),
              finishDate: new Date(timeEnd),
            })
            const msgList = [
              `${i + 1}. ${title}`,
            ]
            // -- NOTE: Custom msg
            const specialMsgs: string[] = []
            switch (true) {
              default:
                specialMsgs.push(
                  diff.isNegative
                  ? `⚠️ Ready ${getTimeAgo(timeEnd)}`
                  : `⏱️ ${diff.message} left`
                )
                break
            }
            specialMsgs.push(`[🏷️ ${room}](http://gosuslugi.pravosleva.pro/express-helper/chat/#/chat?room=${room}&open-tasklist=1)`)
            if (specialMsgs.length > 0) msgList.push(specialMsgs.join(' / '))
            // --

            return `${msgList.join('\n')}`
          }).join('\n\n')
        },
      },
    },
  },
  {
    id: 2,
    _descr: 'Все незавершенные таски',
    isEnabled: true,
    cronSetting: '30 1 10 * * *', // Every day at 10:01:30
    validateBeforeRequest: ({ tasks }) => tasks.length > 0,
    _specialMsgValidator: (task) => {
      const { isLooped, checkTs, uncheckTs, isCompleted } = task
      const isFirstLoopRunning = isLooped && !(!!checkTs && !!uncheckTs)
      return !isCompleted && !isFirstLoopRunning
    },
    targetRooms: ['magaz'],
    targetHashtags: [],
    ignoredHashTags: ['#кот'],
    req: {
      url: `${tgBotApiUrl}/kanban-2021/reminder/send`,
      body: {
        chat_id: -1001917842024, // NOTE: My home -> Reminder (topic)
        message_thread_id: 5,

        eventCode: 'tasklist_reminder_daily',
        about: ({ tasks, targetHashtags, /* targetRooms, */ }) => {
          return `_🔥 ${plural(tasks.length, '%d задача', '%d задачи', '%d задач')} в работе_${targetHashtags.length > 0 ? `\n*${targetHashtags.join(' ')}*` : ''}`
        },
        targetMD: ({ tasks, /* targetHashtags, targetRooms, */ }) => {
          const sortedMsgs = sortArrayByKeys({
            arr: tasks,
            keys: ['editTs'],
            order: 1,
          })
          return sortedMsgs.map((task, i) => {
            const {
              title,
              // uncheckTs,
              // checkTs,
              // fixedDiff,
              room,
              // isCompleted,
              // isLooped,
            } = task
            const msgList = [
              `${i + 1}. ${title}`,
            ]

            // -- NOTE: Custom msg
            const specialMsgs: string[] = []
            specialMsgs.push(`[🔖 ${room}](http://gosuslugi.pravosleva.pro/express-helper/chat/#/chat?room=${room}&open-tasklist=1)`)
            if (specialMsgs.length > 0) msgList.push(specialMsgs.join(' / '))
            // --

            return `${msgList.join('\n')}`
          }).join('\n\n')
        },
      },
    },
  },
  {
    id: 3,
    _descr: 'Все незавершенные таски (Тишка)',
    isEnabled: true,
    cronSetting: '01 05 19 * * *', // Every day at 19:05:01
    validateBeforeRequest: ({ tasks }) => tasks.length > 0,
    _specialMsgValidator: (task) => {
      const { isLooped, checkTs, uncheckTs, isCompleted } = task
      const isFirstLoopRunning = isLooped && !(!!checkTs && !!uncheckTs)
      return !isCompleted && !isFirstLoopRunning
    },
    targetRooms: ['magaz'],
    targetHashtags: ['#кот'],
    req: {
      url: `${tgBotApiUrl}/kanban-2021/reminder/send`,
      body: {
        chat_id: -1001917842024, // NOTE: My home
        message_thread_id: 324, // NOTE: -> Тишка (topic) https://t.me/c/1917842024/324

        eventCode: 'tasklist_reminder_daily',
        about: ({ tasks, targetHashtags, /* targetRooms, */ }) => {
          return `_🔥 ${plural(tasks.length, '%d задача', '%d задачи', '%d задач')} в работе_${targetHashtags.length > 0 ? `\n*${targetHashtags.join(' ')}*` : ''}`
        },
        targetMD: ({ tasks, /* targetHashtags, targetRooms, */ }) => {
          const sortedMsgs = sortArrayByKeys({
            arr: tasks,
            keys: ['editTs'],
            order: 1,
          })
          return sortedMsgs.map((task, i) => {
            const {
              title,
              // uncheckTs,
              // checkTs,
              // fixedDiff,
              room,
              // isCompleted,
              // isLooped,
            } = task
            const msgList = [
              `${i + 1}. ${title}`,
            ]

            // -- NOTE: Custom msg
            const specialMsgs: string[] = []
            specialMsgs.push(`[🧾 ${room}](http://gosuslugi.pravosleva.pro/express-helper/chat/#/chat?room=${room}&open-tasklist=1)`)
            if (specialMsgs.length > 0) msgList.push(specialMsgs.join(' / '))
            // --

            return `${msgList.join('\n')}`
          }).join('\n\n')
        },
      },
    },
  },
  {
    id: 4,
    _descr: `Тишка: ${daysRangeHalf} days perspective: !isCompleted || (isLooped & isCompleted & Will be ready soon (or ready in ${daysRangeHalf} days))`,
    isEnabled: true,
    cronSetting: '10 05 19 * * *', // Every day at 19:05:10
    validateBeforeRequest: ({ tasks }) => tasks.length > 0,
    _specialMsgValidator(task) {
      // NOTE: Интересуют только те задачи, до uncheck которых осталось менее daysRangeHalf дней
      const {
        isCompleted,
        isLooped,
        checkTs,
        uncheckTs,
        fixedDiff,
      } = task

      if (!uncheckTs || !fixedDiff) return false

      const isFirstLoopRunning = isLooped && !(!!checkTs && !!uncheckTs)
      if (!isCompleted && isFirstLoopRunning) return false

      // const targetDate = new Date(task.uncheckTs + task.fixedDiff)
      const timeEnd = checkTs + (checkTs - uncheckTs)
      const diff = getTimeDiff({
        startDate: new Date(),
        finishDate: new Date(timeEnd)
      })
      const isCorrect = !!checkTs && isCompleted && isLooped && diff.d <= daysRangeHalf
      // /* NOTE: Task example
      // { ts: 1639316052419,
      //   title: 'New test',
      //   isCompleted: true,
      //   isLooped: true,
      //   editTs: 1683791624193,
      //   fixedDiff: 327588748,
      //   uncheckTs: 1683464035445,
      //   checkTs: 1683791624193, } */
      return isCorrect
    },
    targetRooms: ['magaz'],
    targetHashtags: ['#кот'],
    ignoredHashTags: [],
    req: {
      url: `${tgBotApiUrl}/kanban-2021/reminder/send`,
      body: {
        // chat_id: 432590698, // NOTE: Den Pol
        chat_id: -1001917842024, // NOTE: My home
        message_thread_id: 324, // NOTE: -> Тишка (topic) https://t.me/c/1917842024/324

        eventCode: 'tasklist_reminder_daily',
        about: ({ tasks, targetHashtags, /* targetRooms, */ }) => {
          return `_В ближайшей перспективе (${plural(daysRangeHalf, '%d день', '%d дня', '%d дней')}) ${plural(tasks.length, 'потребует', 'потребуют')} решения ${plural(tasks.length, '%d задача', '%d задачи', '%d задач')}_${targetHashtags.length > 0 ? `\n*${targetHashtags.join(' ')}*` : ''}`
        },
        targetMD: ({ tasks, /* targetHashtags, targetRooms, */ }) => {
          const sortedMsgs = sortArrayByKeys({
            arr: tasks,
            keys: ['uncheckTs'],
            order: 1,
          })
          
          return sortedMsgs.map((task, i) => {
            const {
              title,
              uncheckTs,
              checkTs,
              // fixedDiff,
              room,
              // isCompleted,
              // isLooped,
            } = task

            // const targetDate = new Date(uncheckTs + fixedDiff)
            const timeEnd: number = checkTs + (checkTs - uncheckTs)
            const diff = getTimeDiff({
              startDate: new Date(),
              finishDate: new Date(timeEnd),
            })
            const msgList = [
              `${i + 1}. ${title}`,
            ]
            // -- NOTE: Custom msg
            const specialMsgs: string[] = []
            switch (true) {
              default:
                specialMsgs.push(
                  diff.isNegative
                  ? `⚠️ Ready ${getTimeAgo(timeEnd)}`
                  : `⏱️ ${diff.message} left`
                )
                break
            }
            specialMsgs.push(`[📑 ${room}](http://gosuslugi.pravosleva.pro/express-helper/chat/#/chat?room=${room}&open-tasklist=1)`)
            if (specialMsgs.length > 0) msgList.push(specialMsgs.join(' / '))
            // --

            return `${msgList.join('\n')}`
          }).join('\n\n')
        },
      },
    },
  },
]
