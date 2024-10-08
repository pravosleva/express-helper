import { Designer } from '~/utils/Designer'
import { TCfg } from './interfaces'
import { EMessageStatus, TMessage } from '~/utils/socket/state'
import { sortArrayByKeys } from '~/utils/sort/sortArrayByKeys'
import { getStatusTranslated, statusCfg } from '~/utils/socket/state/getStatusTranslated'
import plural from 'plural-ru'
import { getTimeAgo } from '~/utils/getTimeAgo'
import { NNotifs } from '~/routers/chat/mws/api/common-notifs'
import { getTimeDiff } from '~/utils/getTimeDiff'

const designer = new Designer()
// const isDev = process.env.NODE_ENV === 'development'
const tgBotApiUrl = process.env.PRAVOSLEVA_BOT_2021_NOTIFY_BASE_URL || ''

// NOTE: Link example
// https://pravosleva.pro/express-helper/chat/#/chat?room=audit.lidiya005

export const cfg: TCfg = [
  {
    id: 1,
    _descr: 'Еженедельная напоминалка по выполненным задачам SmartPrice (на тестировании)',
    isEnabled: false,
    // cronSetting: '0 11 * * Mon', // Every Mon at 11:00
    cronSetting: '5 10 * * *', // Every day at 10:05
    // cronSetting: '44 13 * * Thu',
    // cronSetting: isDev ? '*/10 * * * * Thu', // NOTE: Every 10 secs for isDev
    validateBeforeRequest: ({ msgs }) => msgs.length > 0,
    targetRooms: ['sp.pravosleva'],
    targetHashtags: ['#marketing', '#ringeo', '#mtsmain2024', '#ssr'],
    targetStatuses: [EMessageStatus.Success],
    req: {
      url: `${tgBotApiUrl}/kanban-2021/reminder/send`,
      body: {
        chat_id: 432590698, // NOTE: Den Pol
        eventCode: 'sp_reminder_weekly',
        about: ({
          msgs,
          targetHashtags,
          targetStatuses,
          targetRooms,
          _descr,
        }) => {
          const finalMsgs: string[] = []
          
          finalMsgs.push(_descr)
          if (targetHashtags.length > 0) finalMsgs.push(`*${targetHashtags.join(' ')}*`)

          return finalMsgs.join('\n')
        },
        targetMD: ({
          msgs,
          targetHashtags,
          targetStatuses,
        }) => {
          const sortedMsgs = designer.sortObjectsByTopAndBottomTemplates({
            arr: sortArrayByKeys({
              arr: msgs,
              keys: ['position'],
              order: 1,
            }),
            targetFieldName: 'status',
            topTemplate: [
              EMessageStatus.Success,
              EMessageStatus.Danger,
              EMessageStatus.Warn,
            ],
          })
          
          return sortedMsgs.map((msg, i) => {
            /* NOTE: _targetMsgs For example
            {
              text: 'test',
              ts: 1681386545058,
              rl: 2,
              user: 'pravosleva',
              status: 'success',
              position: 0
            }
            */
            const {
              status,
              position,
              // editTs,
              // ts, // NOTE: Create timestamp
              links,
              // user, // NOTE: TG username
              text,
              assignedTo,
            } = msg

            const msgList = [
              `${i + 1}. ${!!statusCfg[status]?.symbol ? `${statusCfg[status]?.symbol} ` : ''}${text}`,
            ]

            // -- NOTE: Custom msg
            const specialMsgs = []
            if (position >= 0)
              specialMsgs.push(`Приоритет ${position + 1}`)
            if (!!assignedTo && Array.isArray(assignedTo) && assignedTo.length > 0)
              specialMsgs.push(`👉 Отв. ${assignedTo.map((at) => `@${at}`).join(' ')}`)

            if (specialMsgs.length > 0) msgList.push(specialMsgs.join(' / '))
            // --

            if (!!links && Array.isArray(links))
              msgList.push(`${links.map(({ link, descr }) => `🔗 [${descr}](${link})`).join('\n')}`)

            return msgList.join('\n')
          }).join('\n\n')
        },
      },
    },
  },
  {
    id: 2,
    _descr: 'Ежедневная напоминалка по задачам SmartPrice (daily deploy after 21:00)',
    isEnabled: false,
    cronSetting: '5 0 21 * * Mon,Tue,Wed,Thu,Fri', // Every weekdays at 21:00:05
    validateBeforeRequest: ({ msgs }) => msgs.length > 0,
    targetRooms: ['sp.pravosleva'],
    targetHashtags: ['#ssr', '#eveningDailyReminder', '#ringeo', '#mtsmain2024'],
    targetStatuses: [EMessageStatus.Danger],
    req: {
      url: `${tgBotApiUrl}/kanban-2021/reminder/send`,
      body: {
        chat_id: 432590698, // NOTE: Den Pol
        eventCode: 'sp_reminder_daily',
        about: ({
          msgs,
          targetHashtags,
          targetStatuses,
          targetRooms,
          _descr,
        }) => {
          const finalMsgs: string[] = []

          finalMsgs.push(_descr)

          if (msgs.length > 0) {
            finalMsgs.push(`В ${plural(targetRooms.length, 'чат-комнате', 'чат-комнатах')} ${targetRooms.map((room) => `💬 [${room}](https://pravosleva.pro/express-helper/chat/#/chat?room=${room})`).join(' ')}`)
            finalMsgs.push(`есть ${plural(msgs.length, '%d задача', '%d задачи', '%d задач')} со ${plural(targetStatuses.length, 'статусом', 'статусами')}:`)
            finalMsgs.push(`*${[...targetStatuses.map(getStatusTranslated)].join(' ')}*`)
          } else {
            finalMsgs.push(`Impossible case? ${[...targetStatuses].join(' / ')}`)
          }

          if (targetHashtags.length > 0) {
            finalMsgs.push(`*${targetHashtags.join(' ')}*`)
          }

          return finalMsgs.join('\n')
        },
        targetMD: ({
          msgs,
          targetHashtags,
          targetStatuses,
        }) => {
          const sortedMsgs = designer.sortObjectsByTopAndBottomTemplates({
            arr: sortArrayByKeys({
              arr: msgs,
              keys: ['position'],
              order: 1,
            }),
            targetFieldName: 'status',
            topTemplate: [
              EMessageStatus.Success,
              EMessageStatus.Danger,
              EMessageStatus.Warn,
            ],
          })
          
          return sortedMsgs.map((msg, i) => {
            const {
              status,
              position,
              // editTs,
              // ts, // NOTE: Create timestamp
              links,
              // user, // NOTE: TG username
              text,
              assignedTo,
              statusChangeTs,
            } = msg

            const msgList = [
              `${i + 1}. ${!!statusCfg[status]?.symbol ? `${statusCfg[status]?.symbol} ` : ''}${text}`,
            ]

            // -- NOTE: Custom msg
            const specialMsgs = []
            if (position >= 0)
              specialMsgs.push(`Приоритет ${position + 1}`)
            if (!!assignedTo && Array.isArray(assignedTo) && assignedTo.length > 0)
              specialMsgs.push(`👉 Отв. ${assignedTo.map((at) => `@${at}`).join(' ')}`)
            if (!!statusChangeTs && typeof statusChangeTs === 'number')
              specialMsgs.push(`Status upd ${getTimeAgo(statusChangeTs)}`)

            if (specialMsgs.length > 0) msgList.push(specialMsgs.join(' / '))
            // --

            if (!!links && Array.isArray(links))
              msgList.push(`${links.map(({ link, descr }) => `🔗 [${descr}](${link})`).join('\n')}`)

            return msgList.join('\n')
          }).join('\n\n')
        },
      },
    },
  },
  {
    id: 3,
    _descr: 'Reminder for me (wsp)',
    isEnabled: true,
    cronSetting: '1 5 18 * * *', // Every day at 18:05:01
    validateBeforeRequest: ({ msgs }) => msgs.length > 0,
    targetRooms: ['magaz'],
    targetHashtags: [],
    targetStatuses: [
      EMessageStatus.Danger,
      EMessageStatus.Success,
      EMessageStatus.Warn,
    ],
    req: {
      url: `${tgBotApiUrl}/kanban-2021/reminder/send`,
      body: {
        chat_id: 432590698, // NOTE: Den Pol
        eventCode: 'magaz_reminder_daily',
        about: ({
          msgs,
          targetHashtags,
          // targetStatuses,
          targetRooms,
        }) => {
          // return `${msgs.length > 0 ? `В ${plural(targetRooms.length, 'чат-комнате', 'чат-комнатах')} ${targetRooms.map((room) => `[${room}](https://pravosleva.pro/express-helper/chat/#/chat?room=${room})`).join(' ')}\nесть ${plural(msgs.length, '%d задача', '%d задачи', '%d задач')} со ${plural(targetStatuses.length, 'статусом', 'статусами')}: *${[...targetStatuses.map(getStatusTranslated)].join('; ')}*` : `Impossible case? ${[...targetStatuses].join(' / ')}`}${targetHashtags.length > 0 ? `\n*${targetHashtags.join(' ')}*` : ''}`
          return `${
            msgs.length > 0
            ? `Current state of affairs in ${targetRooms.map((room) => `[${room}](https://pravosleva.pro/express-helper/chat/#/chat?room=${room})`).join(' ')}${targetHashtags.length > 0 ? `\n*${targetHashtags.join(' ')}*` : ''}`
            : ''}`
        },
        targetMD: ({
          msgs,
          // targetHashtags,
          // targetStatuses,
        }) => {
          const sortedMsgs = designer.sortObjectsByTopAndBottomTemplates({
            arr: sortArrayByKeys({
              arr: msgs,
              keys: ['position'],
              order: 1,
            }),
            targetFieldName: 'status',
            topTemplate: [
              EMessageStatus.Success,
              EMessageStatus.Danger,
              EMessageStatus.Warn,
            ],
          })
          
          return sortedMsgs.map((msg, i) => {
            const {
              status,
              position,
              // editTs,
              // ts, // NOTE: Create timestamp
              links,
              // user, // NOTE: TG username
              text,
              assignedTo,
            } = msg

            const msgList = [
              `${i + 1}. ${!!statusCfg[status]?.symbol ? `${statusCfg[status]?.symbol} ` : ''}${text}`,
            ]

            // -- NOTE: Custom msg
            const specialMsgs = []
            if (position >= 0)
              specialMsgs.push(`Приоритет ${position + 1}`)
            if (!!assignedTo && Array.isArray(assignedTo) && assignedTo.length > 0)
              specialMsgs.push(`👉 Отв. ${assignedTo.map((at) => `@${at}`).join(' ')}`)

            if (specialMsgs.length > 0) msgList.push(specialMsgs.join(' / '))
            // --

            if (!!links && Array.isArray(links))
              msgList.push(`${links.map(({ link, descr }) => `🔗 [${descr}](${link})`).join('\n')}`)

            return msgList.join('\n')
          }).join('\n\n')
        },
      },
    },
  },
  {
    id: 4,
    _descr: 'Статус вопросов быта',
    isEnabled: true,
    cronSetting: '1 1 18 * * Mon,Thu', // Every Mon,Thu at 18:01:01
    validateBeforeRequest: ({ msgs }) => msgs.length > 0,
    targetRooms: ['magaz'],
    targetHashtags: ['#life'],
    targetStatuses: [
      EMessageStatus.Info,
      EMessageStatus.Warn,
      EMessageStatus.Danger,
    ],
    req: {
      url: `${tgBotApiUrl}/kanban-2021/reminder/send`,
      body: {
        // NOTE: Den Pol
        // chat_id: 432590698,

        // NOTE: Красная Акула -> Notifs exp (topic)
        // chat_id: -1001551335399,
        // message_thread_id: 1099,

        // NOTE: My home -> Reminder (topic)
        chat_id: -1001917842024,
        message_thread_id: 5,
        eventCode: 'magaz_reminder_daily',
        about: ({
          msgs,
          targetHashtags,
          // targetStatuses,
          targetRooms,
          _descr,
        }) => {
          const finalMsgs: string[] = []

          if (msgs.length > 0) {
            finalMsgs.push(_descr)
            finalMsgs.push(`Current state of affairs in ${targetRooms.map((room) => `[${room}](https://pravosleva.pro/express-helper/chat/#/chat?room=${room})`).join(' ')}${targetHashtags.length > 0 ? `\n*${targetHashtags.join(' ')}*` : ''}`)
          }

          // return `${msgs.length > 0 ? `В ${plural(targetRooms.length, 'чат-комнате', 'чат-комнатах')}\n${targetRooms.map((room) => `💬 [${room}](https://pravosleva.pro/express-helper/chat/#/chat?room=${room})`).join('\n')}\nесть ${plural(msgs.length, '%d задача', '%d задачи', '%d задач')} со ${plural(targetStatuses.length, 'статусом', 'статусами')}:\n*${[...targetStatuses.map(getStatusTranslated)].join('\n')}*` : `Impossible case? ${[...targetStatuses].join(' / ')}`}${targetHashtags.length > 0 ? `\n*${targetHashtags.join(' ')}*` : ''}`
          return finalMsgs.join('\n')
        },
        targetMD: ({
          msgs,
          // targetHashtags,
          // targetStatuses,
        }) => {
          const sortedMsgs = designer.sortObjectsByTopAndBottomTemplates({
            arr: sortArrayByKeys({
              arr: msgs,
              keys: ['position'],
              order: 1,
            }),
            targetFieldName: 'status',
            topTemplate: [
              EMessageStatus.Success,
              EMessageStatus.Danger,
              EMessageStatus.Warn,
              EMessageStatus.Info,
            ],
          })
          
          return sortedMsgs.map((msg: TMessage, i) => {
            const {
              status,
              position,
              // editTs,
              // ts, // NOTE: Create timestamp
              links,
              // user, // NOTE: TG username
              text,
              assignedTo,
              statusChangeTs,
            } = msg

            const msgList = [
              `${i + 1}.${!!statusCfg[status]?.symbol ? ` ${statusCfg[status]?.symbol}` : ''} ${text}`,
            ]

            // -- NOTE: Custom msg
            const specialMsgs = []
            if (position >= 0)
              specialMsgs.push(`Приоритет ${position + 1}`)
            if (!!assignedTo && Array.isArray(assignedTo) && assignedTo.length > 0)
              specialMsgs.push(`👉 Отв. ${assignedTo.map((at) => `@${at}`).join(' ')}`)
            if (!!statusChangeTs && typeof statusChangeTs === 'number')
              specialMsgs.push(`Status upd ${getTimeAgo(statusChangeTs)}`)

            if (specialMsgs.length > 0) msgList.push(specialMsgs.join(' / '))
            // --
            if (!!links && Array.isArray(links))
              msgList.push(`${links.map(({ link, descr }) => `🔗 [${descr}](${link})`).join('\n')}`)

            return msgList.join('\n')
          }).join('\n\n')
        },
      },
    },
  },
  {
    id: 5,
    _descr: 'Спринт (magaz) Weekly reminder',
    isEnabled: true,
    cronSetting: '5 7 18 * * Mon', // Every Mon at 18:07:05
    _useSprintOnly: true,
    _specialMsgValidator: (msg: TMessage & Partial<NNotifs.TNotifItem>) => {
      let result = false
      const deadlineLimitInDays = 14
      // NOTE: Фильтровать только те задачи, дедлайн которых не более {deadlineLimitInDays} дней
      const { tsTarget } = msg

      if (!tsTarget) result = false
      else {
        const timeDiff = getTimeDiff({ startDate: new Date(), finishDate: new Date(tsTarget) })

        if (timeDiff.d <= deadlineLimitInDays) result = true
      }

      return result
    },
    validateBeforeRequest: ({ msgs }) => msgs.length > 0,
    targetRooms: ['magaz', 'sp.pravosleva'],
    targetHashtags: [], // ['#sprintWeeklyReminder', '#краснаяАкула'],
    targetStatuses: [EMessageStatus.Info, EMessageStatus.Warn, EMessageStatus.Danger],
    req: {
      url: `${tgBotApiUrl}/kanban-2021/reminder/send`,
      body: {
        // NOTE: Den Pol
        // chat_id: 432590698,

        // NOTE: Красная Акула -> Notifs exp (topic)
        // chat_id: -1001551335399,
        // message_thread_id: 1099,

        // NOTE: My home -> Reminder (topic)
        chat_id: -1001917842024,
        message_thread_id: 5,

        eventCode: 'magaz_sprint_reminder_weekly',
        about: ({
          msgs,
          targetHashtags,
          targetStatuses,
          targetRooms,
        }) => {
          return `*Спринты* (каждый понедельник): ${msgs.length > 0 ? `в ${plural(targetRooms.length, 'чат-комнате', 'чат-комнатах')}\n${targetRooms.map((room) => `💬 [${room}](https://pravosleva.pro/express-helper/chat/#/chat?room=${room})`).join('\n')}\nесть ${plural(msgs.length, '%d задача', '%d задачи', '%d задач')} со ${plural(targetStatuses.length, 'статусом', 'статусами')}:\n*${[...targetStatuses.map(getStatusTranslated)].join('\n')}*` : `Impossible case? ${[...targetStatuses].join(', ')}`}${targetHashtags.length > 0 ? `\n*${targetHashtags.join(' ')}*` : ''}`
        },
        targetMD: ({
          msgs,
          targetHashtags,
          targetStatuses,
          targetRooms,
        }) => {
          const sortedMsgs = designer.sortObjectsByTopAndBottomTemplates({
            arr: sortArrayByKeys({
              arr: msgs,
              // NOTE: В данном случае, мы имеем расширенный объект
              // @ts-ignore
              keys: ['tsTarget'],
              order: 1,
            }),
            targetFieldName: 'status',
            topTemplate: [
              EMessageStatus.Success,
              EMessageStatus.Danger,
              EMessageStatus.Warn,
              EMessageStatus.Info,
            ],
          })
          
          return sortedMsgs.map((msg: TMessage & Partial<NNotifs.TNotifItem>, i) => {
            const {
              status,
              position,
              // editTs,
              // ts, // NOTE: Create timestamp
              links,
              // user, // NOTE: TG username
              text,
              assignedTo,
              statusChangeTs,
              tsTarget,
            } = msg // NOTE: When _useSprintOnly enabled -> we have enhanced msg object

            // const msgList = [
            //   `${i + 1}. ${!!statusCfg[status]?.symbol ? `${statusCfg[status]?.symbol} See text below` : 'See text below'}\n\n\`\`\`\n${JSON.stringify(msg, null, 2)}\n\`\`\``,
            // ]
            const msgList = [
              `${i + 1}.${!!statusCfg[status]?.symbol ? ` ${statusCfg[status]?.symbol}` : ''} ${text}`,
            ]

            // -- NOTE: Custom msg
            const specialMsgs = []
            if (position >= 0)
              specialMsgs.push(`Приоритет ${position + 1}`)
            if (!!assignedTo && Array.isArray(assignedTo) && assignedTo.length > 0)
              specialMsgs.push(`👉 Отв. ${assignedTo.map((at) => `@${at}`).join(' ')}`)
            
            if (specialMsgs.length > 0) msgList.push(specialMsgs.join(' / '))
            // --

            if (!!statusChangeTs && typeof statusChangeTs === 'number')
              msgList.push(`Status upd ${getTimeAgo(statusChangeTs)}`)
            if (!!tsTarget && typeof tsTarget === 'number') {
              const timeDiff = getTimeDiff({ startDate: new Date(), finishDate: new Date(tsTarget) })
              if (timeDiff.isNegative) msgList.push(`🚨 Deadline failed ${getTimeAgo(tsTarget)}`)
              else msgList.push(`Until deadline ${timeDiff.message}`)
            }
            
            if (!!links && Array.isArray(links))
              msgList.push(`${links.map(({ link, descr }) => `🔗 [${descr}](${link})`).join('\n')}`)
            
            msgList.push(`${targetRooms.map((room) => `💬 [${room}](https://pravosleva.pro/express-helper/chat/#/chat?room=${room})`).join('\n')}`)

            return msgList.join('\n')
          }).join('\n\n')
        },
      },
    },
  },
  {
    id: 6,
    _descr: 'Monthly reminder',
    isEnabled: true,
    cronSetting: '5 2 18 20 * *', // Every month 20 at 18:02:05
    validateBeforeRequest: ({ msgs }) => msgs.length > 0,
    targetRooms: ['magaz'],
    targetHashtags: ['#monthlyReminder'],
    targetStatuses: [
      EMessageStatus.Info,
      EMessageStatus.Warn,
      EMessageStatus.Danger,
    ],
    req: {
      url: `${tgBotApiUrl}/kanban-2021/reminder/send`,
      body: {
        chat_id: 432590698, // NOTE: Den Pol
        eventCode: 'magaz_reminder_monthly',
        about: ({
          msgs,
          targetHashtags,
          targetStatuses,
          targetRooms,
        }) => {
          return `${msgs.length > 0 ? `В ${plural(targetRooms.length, 'чат-комнате', 'чат-комнатах')}\n${targetRooms.map((room) => `💬 [${room}](https://pravosleva.pro/express-helper/chat/#/chat?room=${room})`).join('\n')}\nесть ${plural(msgs.length, '%d задача', '%d задачи', '%d задач')} со ${plural(targetStatuses.length, 'статусом', 'статусами')}:\n*${[...targetStatuses.map(getStatusTranslated)].join('\n')}*` : `Impossible case? ${[...targetStatuses].join(' / ')}`}${targetHashtags.length > 0 ? `\n*${targetHashtags.join(' ')}*` : ''}`
        },
        targetMD: ({
          msgs,
          targetHashtags,
          targetStatuses,
        }) => {
          const sortedMsgs = designer.sortObjectsByTopAndBottomTemplates({
            arr: sortArrayByKeys({
              arr: msgs,
              keys: ['position'],
              order: 1,
            }),
            targetFieldName: 'status',
            topTemplate: [
              EMessageStatus.Info,
              EMessageStatus.Success,
              EMessageStatus.Danger,
              EMessageStatus.Warn,
            ],
          })
          
          return sortedMsgs.map((msg: TMessage, i) => {
            const {
              status,
              position,
              // editTs,
              // ts, // NOTE: Create timestamp
              links,
              // user, // NOTE: TG username
              text,
              assignedTo,
              // statusChangeTs,
            } = msg

            const msgList = [
              `${i + 1}.${!!statusCfg[status]?.symbol ? ` ${statusCfg[status]?.symbol}` : ''} ${text}`,
            ]

            // -- NOTE: Custom msg
            const specialMsgs = []
            if (position >= 0)
              specialMsgs.push(`Priority ${position + 1}`)
            if (!!assignedTo && Array.isArray(assignedTo) && assignedTo.length > 0)
              specialMsgs.push(`👉 Отв. ${assignedTo.map((at) => `@${at}`).join(' ')}`)

            if (specialMsgs.length > 0) msgList.push(specialMsgs.join(' / '))
            // --
            if (!!links && Array.isArray(links))
              msgList.push(`${links.map(({ link, descr }) => `🔗 [${descr}](${link})`).join('\n')}`)

            return msgList.join('\n')
          }).join('\n\n')
        },
      },
    },
  },
]
