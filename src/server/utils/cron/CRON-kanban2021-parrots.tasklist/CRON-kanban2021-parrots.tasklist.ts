import axios from 'axios'
import cron from 'node-cron'
import { roomsTasklistMapInstance, TRoomTasklist, TRoomTask } from '~/utils/socket/state'
import { testTextByAllWords } from '~/utils/string-ops/testTextByAllWords'
import { cfg } from './cfg'
import { TEnhancedTask } from './interfaces'

const _checkingSet = new Set()
const _parrotIds = []
for (const parrot of cfg) {
  _checkingSet.add(parrot.id)
  _parrotIds.push(parrot.id)
}
if (_checkingSet.size !== _parrotIds.length)
  throw new Error(`⛔ Проверьте cfg виртуальных попугаев parrots.tasklist (их ${_parrotIds.length}) на предмет уникальности их id (уникальных ${_checkingSet.size}). Не можем запустить в таком виде`)

const parrots = new Map()
for (const parrot of cfg) {
  if (parrot.isEnabled) {
    parrots.set(parrot.id, {
      promise: async (): Promise<void> => {
        const {
          targetRooms,
          targetHashtags,
          req,
          validateBeforeRequest,
          id,
          _specialMsgValidator,
          ignoredHashTags,
        } = parrot

        const _roomsData: { [key: string]: TEnhancedTask[] } = {}
        const _targetMsgs: TEnhancedTask[] = []

        switch (true) {
          default:
            // NOTE: Для поиска используем специальное хранилище todo задач
            for (const room of targetRooms) {
              const roomData: TRoomTask[] = roomsTasklistMapInstance.get(room)
          
              if (!!roomData) _roomsData[room] = roomData.map((d) => ({ ...d, room }))
            }
          
            for(const room in _roomsData) {
              const roomData = _roomsData[room]
        
              for (const task of roomData) {
                const { title } = task

                switch (true) {
                  case targetHashtags.length > 0:
                    // --
                    switch (true) {
                      case !!ignoredHashTags && ignoredHashTags.length > 0:
                        if (
                          !!title &&
                          testTextByAllWords({ text: title, words: targetHashtags }) &&
                          !testTextByAllWords({ text: title, words: ignoredHashTags }) &&
                          (!!_specialMsgValidator ? _specialMsgValidator(task) : true)
                        ) _targetMsgs.push({ ...task, room })
                        break
                      default:
                        if (
                          !!title &&
                          testTextByAllWords({ text: title, words: targetHashtags }) &&
                          (!!_specialMsgValidator ? _specialMsgValidator(task) : true)
                        ) _targetMsgs.push({ ...task, room })
                        break
                    }
                    break
                    // --
                  default:
                    switch (true) {
                      case !!ignoredHashTags && ignoredHashTags.length > 0:
                        if (
                          !!title &&
                          !testTextByAllWords({ text: title, words: ignoredHashTags }) &&
                          (!!_specialMsgValidator ? _specialMsgValidator(task) : true)
                        ) _targetMsgs.push({ ...task, room })
                        break
                      default:
                        if (
                          !!title &&
                          (!!_specialMsgValidator ? _specialMsgValidator(task) : true)
                        ) _targetMsgs.push({ ...task, room })
                        break
                    }
                    break
                }
              }
            }
            break
        }

        if (validateBeforeRequest({ tasks: _targetMsgs })) {
          const opts: any = {
            resultId: id,
            chat_id: req.body.chat_id,
            ts: new Date().getTime(),
            eventCode: req.body.eventCode,
            about: typeof req.body.about === 'function'
              ? req.body.about({ tasks: _targetMsgs, targetHashtags, targetRooms })
              : typeof req.body.about === 'string'
                ? req.body.about || '[about: empty]'
                : '[about: incorrect format]',
            targetMD: typeof req.body.targetMD === 'function'
              ? req.body.targetMD({ tasks: _targetMsgs, targetHashtags, targetRooms })
              : typeof req.body.targetMD === 'string'
                ? req.body.targetMD || '[targetMD: empty]'
                : '[targetMD: incorrect format]',
          }
          if (!!req.body.message_thread_id) opts.message_thread_id = req.body.message_thread_id
          return await axios
            .post(req.url, opts)
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
