import axios from 'axios'
import cron from 'node-cron'
import { roomsMapInstance, EMessageStatus, TMessage } from '~/utils/socket/state'
import { testTextByAllWords } from '~/utils/string-ops/testTextByAllWords'
import { sortArrayByKeys } from '~/utils/sort/sortArrayByKeys'
import { getStatusTranslated, statusCfg } from '~/utils/socket/state/getStatusTranslated'
import plural from 'plural-ru'
import { Designer } from '~/utils/Designer'

const designer = new Designer()

// const isDev = process.env.NODE_ENV === 'development'
const tgBotApiUrl = process.env.PRAVOSLEVA_BOT_2021_NOTIFY_BASE_URL || ''

// NOTE: Parrots reference
type TCfg = {
  id: number;
  _descr: string;
  isEnabled: boolean;
  cronSetting: string;
  targetRooms: string[];
  targetHashtags: string[];
  targetStatuses: EMessageStatus[];
  validateBeforeRequest: ({}: {
    msgs: TMessage[];
  }) => boolean;
  req: {
    url: string;
    body: {
      chat_id: number;
      eventCode: string;
      // resultId: number;
      about: ({}: {
        msgs: TMessage[];
        targetHashtags: string[];
        targetStatuses: EMessageStatus[];
        targetRooms: string[];
      }) => string;
      targetMD: ({}: {
        msgs: TMessage[];
        targetHashtags: string[];
        targetStatuses: EMessageStatus[];
        targetRooms: string[];
      }) => string;
    };
  };
}[]
const cfg: TCfg = [
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
        eventCode: 'weekly_reminder',
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
              // ts, // Create ts
              links,
              // user, // tg username
              text,
              assignedTo,
            } = msg

            const msgList = [
              `\`${i + 1}. ${statusCfg[status]?.symbol || '❓'} ${text}\``,
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
        eventCode: 'daily_reminder',
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
              // ts, // Create ts
              links,
              // user, // tg username
              text,
              assignedTo,
            } = msg

            const msgList = [
              `\`${i + 1}. ${statusCfg[status]?.symbol || '❓'} ${text}\``,
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
        eventCode: 'daily_reminder',
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
              // ts, // Create ts
              links,
              // user, // tg username
              text,
              assignedTo,
            } = msg

            const msgList = [
              `\`${i + 1}. ${statusCfg[status]?.symbol || '❓'} ${text}\``,
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
  }
]

const _checkingSet = new Set()
const _parrotIds = []
for (const parrot of cfg) {
  _checkingSet.add(parrot.id)
  _parrotIds.push(parrot.id)
}
if (_checkingSet.size !== _parrotIds.length)
  throw new Error(`⛔ Проверьте cfg виртуальных попугаев (их ${_parrotIds.length}) на предмет уникальности их id (уникальных ${_checkingSet.size}). Не можем запустить в таком виде`)

const parrots = new Map()
for(const parrot of cfg) {
  if (parrot.isEnabled) {
    parrots.set(parrot.id, {
      promise: async () => {
        const {
          targetRooms,
          targetHashtags,
          targetStatuses,
          req,
          validateBeforeRequest,
          id,
        } = parrot

        const _roomsData = {}
        const _targetMsgs: TMessage[] = []
      
        for (const room of targetRooms) {
          const roomData = roomsMapInstance.getRoomData(room)
      
          if (!!roomData) _roomsData[room] = roomData
        }
      
        for(const room in _roomsData) {
          const roomData = _roomsData[room]
    
          for (const msg of roomData) {
            switch (true) {
              case targetHashtags.length > 0:
                if (
                  !!msg.status &&
                  targetStatuses.includes(msg.status) &&
                  !!msg.text &&
                  testTextByAllWords({ text: msg.text, words: targetHashtags })
                ) _targetMsgs.push(msg)
                break
              default:
                if (
                  !!msg.status &&
                  targetStatuses.includes(msg.status) &&
                  !!msg.text
                ) _targetMsgs.push(msg)
                break
            }
          }
        }

        if (validateBeforeRequest({ msgs: _targetMsgs })) {
          return await axios
            .post(req.url, {
              resultId: id,
              chat_id: req.body.chat_id,
              ts: new Date().getTime(),
              eventCode: req.body.eventCode,
              about: typeof req.body.about === 'function'
                ? req.body.about({ msgs: _targetMsgs, targetHashtags, targetStatuses, targetRooms })
                : typeof req.body.about === 'string'
                  ? req.body.about || '[about: empty]'
                  : '[about: incorrect format]',
              targetMD: typeof req.body.targetMD === 'function'
                ? req.body.targetMD({ msgs: _targetMsgs, targetHashtags, targetStatuses, targetRooms })
                : typeof req.body.targetMD === 'string'
                  ? req.body.targetMD || '[targetMD: empty]'
                  : '[targetMD: incorrect format]',
            })
            .then((res) => res.data)
            .catch((err) => err)
        } else return undefined
      },
      cronSetting: parrot.cronSetting,
    })
  }
}

const baseFn = () => {
  const arr = Array.from(parrots, function (entry) {
    return { key: entry[0], value: entry[1] };
  });

  for(const sett of arr) {
    const { value : { promise, cronSetting } } = sett

    cron.schedule(cronSetting, promise, {
      scheduled: true,
      timezone: 'Europe/Moscow',
    })
  }
}

baseFn()
