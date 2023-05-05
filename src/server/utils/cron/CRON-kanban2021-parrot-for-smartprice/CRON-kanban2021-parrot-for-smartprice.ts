import axios from 'axios'
import cron from 'node-cron'
import { roomsMapInstance, TMessage } from '~/utils/socket/state'
import { testTextByAllWords } from '~/utils/string-ops/testTextByAllWords'
import { cfg } from './cfg'

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
