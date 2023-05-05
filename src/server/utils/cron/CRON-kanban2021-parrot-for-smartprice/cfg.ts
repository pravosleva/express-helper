import { Designer } from '~/utils/Designer'
import { TCfg } from './interfaces'
import { EMessageStatus, TMessage } from '~/utils/socket/state'
import { sortArrayByKeys } from '~/utils/sort/sortArrayByKeys'
import { getStatusTranslated, statusCfg } from '~/utils/socket/state/getStatusTranslated'
import plural from 'plural-ru'
import { getTimeAgo } from '~/utils/getTimeAgo'

const designer = new Designer()
// const isDev = process.env.NODE_ENV === 'development'
const tgBotApiUrl = process.env.PRAVOSLEVA_BOT_2021_NOTIFY_BASE_URL || ''

export const cfg: TCfg = [
  {
    id: 1,
    _descr: 'Напоминалка для Алексея',
    isEnabled: true,
    // cronSetting: '0 11 * * Mon', // Every Mon at 11:00
    cronSetting: '5 11 * * *', // Every day at 11:05
    // cronSetting: '44 13 * * Thu',
    // cronSetting: isDev ? '*/10 * * * * Thu', // NOTE: Every 10 secs for isDev
    validateBeforeRequest: ({ msgs }) => msgs.length > 0,
    targetRooms: ['sp.pravosleva'],
    targetHashtags: ['#marketing'],
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
        }) => {
          return `${msgs.length > 0 ? `Непонятен статус ${plural(msgs.length, 'задачи', 'задач')}` : 'Нет задач с непонятным статусом (Impossible case?)'} *${targetHashtags.join(' ')}*`
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
              `\`${i + 1}. ${!!statusCfg[status]?.symbol ? `${statusCfg[status]?.symbol} ` : ''}${text}\``,
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
    _descr: 'Reminder for me (daily deploy after 21:00)',
    isEnabled: true,
    cronSetting: '0 21 * * *', // Every day at 21:00
    validateBeforeRequest: ({ msgs }) => msgs.length > 0,
    targetRooms: ['sp.pravosleva'],
    targetHashtags: ['#ssr'],
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
        }) => {
          return `${msgs.length > 0 ? `В ${plural(targetRooms.length, 'чат-комнате', 'чат-комнатах')} \`${targetRooms.join(' ')}\` есть ${plural(msgs.length, '%d задача', '%d задачи', '%d задач')} со ${plural(targetStatuses.length, 'статусом', 'статусами')} *${[...targetStatuses.map(getStatusTranslated)].join(', ')}*` : `Impossible case? ${[...targetStatuses].join(', ')}`} *${targetHashtags.join(' ')}*`
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
              `\`${i + 1}. ${!!statusCfg[status]?.symbol ? `${statusCfg[status]?.symbol} ` : ''}${text}\``,
            ]

            // -- NOTE: Custom msg
            const specialMsgs = []
            if (position >= 0)
              specialMsgs.push(`Приоритет ${position + 1}`)
            if (!!assignedTo && Array.isArray(assignedTo) && assignedTo.length > 0)
              specialMsgs.push(`👉 Отв. ${assignedTo.map((at) => `@${at}`).join(' ')}`)
            if (!!statusChangeTs && typeof statusChangeTs === 'number')
              specialMsgs.push(`Статус изменен ${getTimeAgo(statusChangeTs)}`)

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
    _descr: 'Reminder for me (whats up)',
    isEnabled: true,
    cronSetting: '5 13 * * *', // Every day at 13:05
    validateBeforeRequest: ({ msgs }) => msgs.length > 0,
    targetRooms: ['sp.pravosleva'],
    targetHashtags: [],
    targetStatuses: [
      // EMessageStatus.Danger,
      EMessageStatus.Success,
      EMessageStatus.Warn,
    ],
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
        }) => {
          return `${msgs.length > 0 ? `В ${plural(targetRooms.length, 'чат-комнате', 'чат-комнатах')} \`${targetRooms.join(' ')}\` есть ${plural(msgs.length, '%d задача', '%d задачи', '%d задач')} со ${plural(targetStatuses.length, 'статусом', 'статусами')} *${[...targetStatuses.map(getStatusTranslated)].join(', ')}*` : `Impossible case? ${[...targetStatuses].join(', ')}`} *${targetHashtags.join(' ')}*`
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
            } = msg

            const msgList = [
              `\`${i + 1}. ${!!statusCfg[status]?.symbol ? `${statusCfg[status]?.symbol} ` : ''}${text}\``,
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
    cronSetting: '0 17 * * *', // Every day at 17:00
    validateBeforeRequest: ({ msgs }) => msgs.length > 0,
    targetRooms: ['magaz'],
    targetHashtags: [], // ['#dom'],
    targetStatuses: [EMessageStatus.Danger],
    req: {
      url: `${tgBotApiUrl}/kanban-2021/reminder/send`,
      body: {
        chat_id: 432590698, // NOTE: Den Pol
        eventCode: 'magaz_reminder_daily',
        about: ({
          msgs,
          targetHashtags,
          targetStatuses,
          targetRooms,
        }) => {
          return `${msgs.length > 0 ? `В ${plural(targetRooms.length, 'чат-комнате', 'чат-комнатах')} \`${targetRooms.join(' ')}\` есть ${plural(msgs.length, '%d задача', '%d задачи', '%d задач')} со ${plural(targetStatuses.length, 'статусом', 'статусами')} *${[...targetStatuses.map(getStatusTranslated)].join(', ')}*` : `Impossible case? ${[...targetStatuses].join(', ')}`} *${targetHashtags.join(' ')}*`
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
              `\`${i + 1}. ${!!statusCfg[status]?.symbol ? `${statusCfg[status]?.symbol} ` : ''}${text}\``,
            ]

            // -- NOTE: Custom msg
            const specialMsgs = []
            if (position >= 0)
              specialMsgs.push(`Приоритет ${position + 1}`)
            if (!!assignedTo && Array.isArray(assignedTo) && assignedTo.length > 0)
              specialMsgs.push(`👉 Отв. ${assignedTo.map((at) => `@${at}`).join(' ')}`)
            if (!!statusChangeTs && typeof statusChangeTs === 'number')
              specialMsgs.push(`Статус изменен ${getTimeAgo(statusChangeTs)}`)

            if (specialMsgs.length > 0) msgList.push(specialMsgs.join(' / '))
            // --
            if (!!links && Array.isArray(links))
              msgList.push(`${links.map(({ link, descr }) => `🔗 [${descr}](${link})`).join('\n')}`)

            return msgList.join('\n')
          }).join('\n\n')
        },
      },
    },
  }
]
