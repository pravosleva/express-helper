import axios from 'axios'
import cron from 'node-cron'
import { roomsMapInstance, EMessageStatus, TMessage } from '~/utils/socket/state'
import { testTextByAllWords } from '~/utils/string-ops/testTextByAllWords'
import { sortArrayByKeys } from '~/utils/sort/sortArrayByKeys'
import { getStatusTranslated } from '~/utils/socket/state/getStatusTranslated'

// const isDev = process.env.NODE_ENV === 'development'
const tgBotApiUrl = process.env.PRAVOSLEVA_BOT_2021_NOTIFY_BASE_URL || ''

const charCfg: { [key in EMessageStatus]: string } = {
  [EMessageStatus.Danger]: '🔥',
  [EMessageStatus.Success]: '✅',
  [EMessageStatus.Warn]: '⚠️',
  [EMessageStatus.Dead]: '💀',
  [EMessageStatus.Done]: '☑️',
  [EMessageStatus.Info]: 'ℹ️',
}

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
    cronSetting: '0 11 * * Mon',
    // cronSetting: '0 16 * * *', // Every day at 16:00
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
          return `${msgs.length > 0 ? `Непонятен статус задач (${msgs.length} шт.)` : 'Нет задач с непонятным статусом (Impossible case?)'} *${targetHashtags.join(' ')}*`
        },
        targetMD: ({
          msgs,
          targetHashtags,
          targetStatuses,
        }) => {
          const sortedMsgs = sortArrayByKeys({
            arr: msgs,
            keys: ['position'],
            order: -1,
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

          return `\`\`\`\n${i + 1}. ${charCfg[status] || '❓'} ${text}\n\`\`\`\n${!!assignedTo && Array.isArray(assignedTo) && assignedTo.length > 0 ? `👉 Отв. ${assignedTo.map((at) => `@${at}`).join(' ')}\n` : ''}${position >= 0 ? `Приоритет ${position + 1}\n` : ''}${(!!links && Array.isArray(links)) ? `${links.map(({ link, descr }) => `🔗 [${descr}](${link})`).join('\n')}` : ''}`
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
          return `${msgs.length > 0 ? `В чат-комнатах \`${targetRooms.join(' ')}\` Есть задачи со статусом *${[...targetStatuses.map(getStatusTranslated)].join(', ')}* (${msgs.length})` : `Impossible case? ${[...targetStatuses].join(', ')}`} *${targetHashtags.join(' ')}*`
        },
        targetMD: ({
          msgs,
          targetHashtags,
          targetStatuses,
        }) => msgs.map((msg, i) => {
          const {
            status,
            position,
            links,
            text,
            assignedTo,
          } = msg

          return `\`\`\`\n${i + 1}. ${charCfg[status] || '❓'} ${text}\n\`\`\`\n${!!assignedTo && Array.isArray(assignedTo) && assignedTo.length > 0 ? `👉 Отв. ${assignedTo.map((at) => `@${at}`).join(' ')}\n` : ''}${position >= 0 ? `Приоритет ${position + 1}\n` : ''}${(!!links && Array.isArray(links)) ? `${links.map(({ link, descr }) => `🔗 [${descr}](${link})`).join('\n')}` : ''}`
        }).join('\n\n'),
      },
    },
  },
  {
    id: 3,
    _descr: 'Reminder for me (whats up)',
    isEnabled: true,
    cronSetting: '0 13 * * *', // Every day at 13:00
    validateBeforeRequest: ({ msgs }) => msgs.length > 0,
    targetRooms: ['sp.pravosleva'],
    targetHashtags: ['#ssr'],
    targetStatuses: [EMessageStatus.Danger, EMessageStatus.Success, EMessageStatus.Warn],
    req: {
      url: `${tgBotApiUrl}/kanban-2021/reminder/send`,
      body: {
        chat_id: 432590698, // NOTE: Den Pol
        eventCode: 'daily_reminder',
        about: ({
          msgs,
          targetHashtags,
          targetStatuses,
        }) => {
          return `${msgs.length > 0 ? `Есть задачи со статусом *${[...targetStatuses.map(getStatusTranslated)].join(', ')}* (${msgs.length})` : `Impossible case? ${[...targetStatuses].join(', ')}`} *${targetHashtags.join(' ')}*`
        },
        targetMD: ({
          msgs,
          targetHashtags,
          targetStatuses,
        }) => msgs.map((msg, i) => {
          const {
            status,
            position,
            links,
            text,
            assignedTo,
          } = msg

          return `\`\`\`\n${i + 1}. ${charCfg[status] || '❓'} ${text}\n\`\`\`\n${!!assignedTo && Array.isArray(assignedTo) && assignedTo.length > 0 ? `👉 Отв. ${assignedTo.map((at) => `@${at}`).join(' ')}\n` : ''}${position >= 0 ? `Приоритет ${position + 1}\n` : ''}${(!!links && Array.isArray(links)) ? `${links.map(({ link, descr }) => `🔗 [${descr}](${link})`).join('\n')}` : ''}`
        }).join('\n\n'),
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
