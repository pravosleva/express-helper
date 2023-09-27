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

// NOTE: Link example
// http://pravosleva.ru/express-helper/chat/#/chat?room=audit.lidiya005

const daysRangeHalf = 7

export const cfg: TCfg = [
  {
    id: 1,
    _descr: `${daysRangeHalf} days perspective: isLooped & isCompleted & Will be ready soon (or ready in ${daysRangeHalf} days)`,
    isEnabled: true,
    // cronSetting: '0 11 * * Mon', // Every Mon at 11:00
    cronSetting: '10 1 10 * * *', // Every day at 10:01:10
    // cronSetting: '10 0 11 * * *', // Every day at 11:00:10
    // cronSetting: '44 13 * * Thu',
    // cronSetting: isDev ? '*/10 * * * * *' : '10 1 10 * * *', // NOTE: Every 10 secs for isDev
    validateBeforeRequest: ({ tasks }) => tasks.length > 0,
    _specialMsgValidator(task) {
      // NOTE: Интересуют только те задачи, до uncheck которых осталось менее 30 дней
      const {
        isCompleted,
        isLooped,
        checkTs,
        uncheckTs,
        fixedDiff,
      } = task

      if (!uncheckTs || !fixedDiff) return false

      // const targetDate = new Date(task.uncheckTs + task.fixedDiff)
      const timeEnd = checkTs + (checkTs - uncheckTs)

      const diff = getTimeDiff({
        startDate: new Date(),
        finishDate: new Date(timeEnd)
      })
      
      const isCorrect = !!checkTs && isCompleted && isLooped && diff.d <= daysRangeHalf

      // if (isCorrect) {
      //   console.log(task)
      //   console.log(diff)
      //   /* NOTE: Example
      //   {
      //     ts: 1639316052419,
      //     title: 'New test',
      //     isCompleted: true,
      //     isLooped: true,
      //     editTs: 1683791624193,
      //     fixedDiff: 327588748,
      //     uncheckTs: 1683464035445,
      //     checkTs: 1683791624193
      //   }
      //   { d: 0, h: 0, min: 0, sec: 5, ms: 890, message: '00:05' }
      //   */
      // }

      return isCorrect
    },
    targetRooms: ['magaz'],
    targetHashtags: [],
    req: {
      url: `${tgBotApiUrl}/kanban-2021/reminder/send`,
      body: {
        // NOTE: Den Pol
        // chat_id: 432590698,

        // NOTE: My home -> Reminder (topic)
        chat_id: -1001917842024,
        message_thread_id: 5,

        eventCode: 'magaz_tasklist_reminder_daily',
        about: ({
          tasks,
          targetHashtags,
          targetRooms,
        }) => {
          return `В ближайшей перспективе (${daysRangeHalf} дней) ${plural(tasks.length, 'потребует', 'потребуют')} решения ${plural(tasks.length, '%d задача', '%d задач', '%d задач')}${targetHashtags.length > 0 ? `\n*${targetHashtags.join(' ')}*` : ''}`
        },
        targetMD: ({
          tasks,
          targetHashtags,
          targetRooms,
        }) => {
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
            } = task

            // const targetDate = new Date(uncheckTs + fixedDiff)
            const timeEnd: number = checkTs + (checkTs - uncheckTs)
            const diff = getTimeDiff({
              startDate: new Date(),
              finishDate: new Date(timeEnd),
            })

            const msgList = [
              `\`${i + 1}. ${title}\``,
            ]

            // -- NOTE: Custom msg
            const specialMsgs: string[] = []
            specialMsgs.push(
              diff.isNegative
              ? `✅ Ready ${getTimeAgo(timeEnd)}`
              : `⏱️ Left: ${diff.message}`
            )
            specialMsgs.push(`💬 [${room}](http://pravosleva.ru/express-helper/chat/#/chat?room=${room})`)
            
            if (specialMsgs.length > 0) msgList.push(specialMsgs.join(' / '))
            // --

            return msgList.join('\n')
          }).join('\n\n')
        },
      },
    },
  },
]
