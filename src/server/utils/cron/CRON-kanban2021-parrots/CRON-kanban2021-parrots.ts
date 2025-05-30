import axios from 'axios'
import cron from 'node-cron'
import { roomsMapInstance, TMessage, commonNotifsMapInstance } from '~/utils/socket/state'
import { testTextByAnyWord } from '~/utils/string-ops'
import { cfg } from './cfg'
import { TRoomNotifs, NNotifs } from '~/routers/chat/mws/api/common-notifs'
// import { Counter } from '~/utils/Counter'

const tgBotApiUrl = process.env.PRAVOSLEVA_BOT_2021_NOTIFY_BASE_URL || ''

const _checkingSet = new Set()
const _parrotIds = []
for (const parrot of cfg) {
  _checkingSet.add(parrot.id)
  _parrotIds.push(parrot.id)
}
if (_checkingSet.size !== _parrotIds.length)
  throw new Error(`⛔ Проверьте cfg виртуальных попугаев (их ${_parrotIds.length}) на предмет уникальности их id (уникальных ${_checkingSet.size}). Не можем запустить в таком виде`)

// const processEventCounter = Counter(0)

const parrots = new Map()
for(const parrot of cfg) {
  if (parrot.isEnabled) {
    parrots.set(parrot.id, {
      promise: async () => {
        const {
          targetRooms,
          targetHashtags,
          ignoredHashTags,
          targetStatuses,
          req,
          validateBeforeRequest,
          id,
          _specialMsgValidator,
          _useSprintOnly,
          _descr,
        } = parrot

        const _roomsData = {}
        const _targetMsgs: TMessage[] = []

        switch (true) {
          case _useSprintOnly:
            // 1. NOTE: Для поиска используем только инстанс в котором хранятся "спринты"
            for (const room of targetRooms) {
              const roomNotifs: TRoomNotifs = commonNotifsMapInstance.get(room)
          
              if (!!roomNotifs) _roomsData[room] = roomNotifs
            }

            for(const room in _roomsData) {
              const roomNotifs: TRoomNotifs = _roomsData[room]

              for (const key in roomNotifs.data) {
                const notifItem: NNotifs.TNotifItem = roomNotifs.data[key]
                const { original, ...rest } = notifItem

                switch (true) {
                  case targetHashtags.length > 0:
                    // --
                    switch (true) {
                      case !!ignoredHashTags && ignoredHashTags.length > 0:
                        if (
                          !!original.status &&
                          targetStatuses.includes(original.status) &&
                          !!original.text &&
                          testTextByAnyWord({ text: original.text, words: targetHashtags }) &&
                          !testTextByAnyWord({ text: original.text, words: ignoredHashTags }) &&
                          (!!_specialMsgValidator ? _specialMsgValidator(original) : true)
                        ) _targetMsgs.push({ ...original, ...rest })
                        break
                      default:
                        if (
                          !!original.status &&
                          targetStatuses.includes(original.status) &&
                          !!original.text &&
                          testTextByAnyWord({ text: original.text, words: targetHashtags }) &&
                          (!!_specialMsgValidator ? _specialMsgValidator(original) : true)
                        ) _targetMsgs.push({ ...original, ...rest })
                        break
                    }
                    break
                  default:
                    switch (true) {
                      case !!ignoredHashTags && ignoredHashTags.length > 0:
                        if (
                          !!original.status &&
                          targetStatuses.includes(original.status) &&
                          !!original.text &&
                          !testTextByAnyWord({ text: original.text, words: ignoredHashTags }) &&
                          (!!_specialMsgValidator ? _specialMsgValidator(original) : true)
                        ) _targetMsgs.push({ ...original, ...rest })
                        break
                      default:
                        if (
                          !!original.status &&
                          targetStatuses.includes(original.status) &&
                          !!original.text &&
                          (!!_specialMsgValidator ? _specialMsgValidator(original) : true)
                        ) _targetMsgs.push({ ...original, ...rest })
                        break
                    }
                    break
                }
              }
            }

            break
          default:
            // 2. NOTE: Для поиска используем основное хранилище чатов (самый большой кусок кэша)
            for (const room of targetRooms) {
              const roomData = roomsMapInstance.getRoomData(room)
          
              if (!!roomData) _roomsData[room] = roomData
            }
          
            for(const room in _roomsData) {
              const roomData = _roomsData[room]
        
              for (const msg of roomData) {
                switch (true) {
                  case targetHashtags.length > 0 && targetStatuses.length > 0:
                    if (
                      !!msg.status &&
                      targetStatuses.includes(msg.status) &&
                      !!msg.text &&
                      testTextByAnyWord({ text: msg.text, words: targetHashtags }) &&
                      (!!_specialMsgValidator ? _specialMsgValidator(msg) : true)
                    ) _targetMsgs.push(msg)
                    break
                  default:
                    if (
                      !!msg.status &&
                      targetStatuses.includes(msg.status) &&
                      !!msg.text &&
                      (!!_specialMsgValidator ? _specialMsgValidator(msg) : true)
                    ) _targetMsgs.push(msg)
                    break
                }
              }
            }
            break
        }

        if (validateBeforeRequest({ msgs: _targetMsgs })) {
          // const eventCounterValue = processEventCounter.next().value || 0
          const eventCounterValue = new Date().getTime()
          const about = typeof req.body.about === 'function'
            ? req.body.about({ msgs: _targetMsgs, targetHashtags, targetStatuses, targetRooms, _descr, _eventCounter: eventCounterValue })
            : typeof req.body.about === 'string'
              ? req.body.about || 'about: empty'
              : `about: incorrect format (expected: function; received: ${typeof req.body.about})`
          const targetMD = typeof req.body.targetMD === 'function'
            ? req.body.targetMD({ msgs: _targetMsgs, targetHashtags, targetStatuses, targetRooms, _eventCounter: eventCounterValue })
            : [`targetMD: incorrect format (expected: function; received: ${typeof req.body.targetMD})`]
          const opts: any = {
            chat_id: req.body.chat_id,
            // resultId: id,
            // ts: new Date().getTime(),
            // eventCode: req.body.eventCode,
            // about: typeof req.body.about === 'function'
            //   ? req.body.about({ msgs: _targetMsgs, targetHashtags, targetStatuses, targetRooms, _descr })
            //   : typeof req.body.about === 'string'
            //     ? req.body.about || '[about: empty]'
            //     : '[about: incorrect format]',
            // targetMD: typeof req.body.targetMD === 'function'
            //   ? req.body.targetMD({ msgs: _targetMsgs, targetHashtags, targetStatuses, targetRooms })
            //   : typeof req.body.targetMD === 'string'
            //     ? req.body.targetMD || '[targetMD: empty]'
            //     : '[targetMD: incorrect format]',
            namespace: 'main',
            messages: [
              about,
              ...targetMD,
            ]
          }

          if (!!req.body.message_thread_id) opts.message_thread_id = req.body.message_thread_id
          return await axios
            .post(
              `${tgBotApiUrl}/single/stack`, // req.url,
              opts,
            )
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

  for (const sett of arr) {
    const { value : { promise, cronSetting } } = sett

    cron.schedule(cronSetting, promise, {
      scheduled: true,
      timezone: 'Europe/Moscow',
    })
  }
}

baseFn()
