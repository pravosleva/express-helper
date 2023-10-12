import axios from 'axios'
import cron from 'node-cron'
import { cfg } from './cfg'

const _checkingSet = new Set()
const _parrotIds = []
for (const parrot of cfg) {
  _checkingSet.add(parrot.id)
  _parrotIds.push(parrot.id)
}
if (_checkingSet.size !== _parrotIds.length)
  throw new Error(`⛔ #3 Проверьте cfg виртуальных попугаев parrots.tasklist (их ${_parrotIds.length}) на предмет уникальности их id (уникальных ${_checkingSet.size}). Не можем запустить в таком виде`)

const parrots = new Map()
for (const parrot of cfg) {
  if (parrot.isEnabled) {
    parrots.set(parrot.id, {
      promise: async (): Promise<void> => {
        const {
          req,
          id,
        } = parrot

        const opts: any = {
          resultId: id,
          chat_id: req.body.chat_id,
          ts: new Date().getTime(),
          eventCode: req.body.eventCode,
          about: typeof req.body.about === 'function'
            ? req.body.about()
            : typeof req.body.about === 'string'
              ? req.body.about || '[about: empty]'
              : '[about: incorrect format]',
          targetMD: typeof req.body.targetMD === 'function'
            ? req.body.targetMD()
            : typeof req.body.targetMD === 'string'
              ? req.body.targetMD || '[targetMD: empty]'
              : '[targetMD: incorrect format]',
        }
        if (!!req.body.message_thread_id) opts.message_thread_id = req.body.message_thread_id
        return await axios
          .post(req.url, opts)
          .then((res) => res.data)
          .catch((err) => err)
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
