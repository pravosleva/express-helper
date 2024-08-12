import axios from 'axios'
import cron from 'node-cron'
import path from 'path'
import fs from 'fs'
import slugify from 'slugify'
import { getTimeAgo } from '~/utils/getTimeAgo'
import { getTimeDiff } from '~/utils/getTimeDiff'

const isDev = process.env.NODE_ENV === 'development'
const tgBotApiUrl = process.env.PRAVOSLEVA_BOT_2021_NOTIFY_BASE_URL || ''

const rootDir = path.join(__dirname, '../../../../')
// const storagePath = path.join(rootDir, '/server-dist/routers/car-service/uremont-data')
const storagePath = path.join(rootDir, '/storage/uremont-data')

const delay = (ms = 200) => new Promise((res) => {
  setTimeout(res, ms)
})

const isModelsDataValid = (models: any[]) => Array.isArray(models) &&  models.every((model) => !!model.id && !!model.name)

type TState = {
  success: {
    counter: number;
  },
  error: {
    counter: number;
    // messages: string[],
    responses: any[];
  },
  ts: {
    start: number;
    end: number;
  },
}

const state: TState = {
  success: {
    counter: 0,
  },
  error: {
    counter: 0,
    // messages: [],
    responses: [],
  },
  ts: {
    start: new Date().getTime(),
    end: new Date().getTime(),
  },
}

const cleanupState = () => {
  state.error.responses = []
  state.error.counter = 0
  state.success.counter = 0
}

const baseFn = async () => {
  cleanupState()

  state.ts.start = new Date().getTime()
  const markListRes = await axios.post('https://api-frontend.uservice.io/car/mark/get-list/',  {
    type_id: 1,
    lang: 'ru',
  })
    .then((r) => r.data)

  try {
    for (let i = 0, max = markListRes.marks.length; i < max; i++) {
      const item = markListRes.marks[i]
      const { id, name } = item
      const modelsRes = await axios.post('https://api-frontend.uservice.io/car/model/get-list/', {
        mark_id: id,
        lang: 'ru',
      })
        .then((r) => r.data)
        .catch((err) => {
          console.log(err)
          return {
            id,
            name,
            res: err?.data || 'No data',
          }
        })
  
      if (modelsRes.success === 1 && isModelsDataValid(modelsRes?.models)) {
        state.success.counter += 1
        fs.writeFile(path.join(storagePath, `/${slugify(name.toLowerCase())}.json`), JSON.stringify(modelsRes, null, 2), err => {
          switch (true) {
            case !!err:
              console.log(`ERR: ${name} (${i + 1} of ${max})`)
              console.error(err);
              break
            default:
              // file written successfully
              // console.log(`OK: ${name} (${i + 1} of ${max})`)
              break
          }
        })
      } else {
        state.error.counter += 1
        // state.error.messages.push(`name: ${name}, id: ${id}`)
        state.error.responses.push({
          id,
          name,
          res: modelsRes,
        })
      }

      await delay(2000)

      const isLast = i + 1 === max
      if (isLast) {
        state.ts.end = new Date().getTime()
        const timeDiff = getTimeDiff({
          startDate: new Date(state.ts.start),
          finishDate: new Date(state.ts.end),
        })
        axios
          .post(`${tgBotApiUrl}/kanban-2021/reminder/send`, {
            resultId: state.ts.end,
            chat_id: 432590698, // NOTE: Den Pol
            ts: new Date().getTime(),
            eventCode: 'aux_service',
            about: `\`/express-helper\`\n✅ #uremont models sync (${state.success.counter} of ${max}) is ok!\n${timeDiff.details} (started ${getTimeAgo(state.ts.start)})`,
            targetMD: `\`\`\`json\n${JSON.stringify(
              state,
              null,
              2
            )}\`\`\``,
          })
          .then((res) => res.data)
          .catch((err) => err)
        }
    }
  } catch (err) {
    console.log('ERR 5')
    console.log(err)

    state.ts.end = new Date().getTime()
    const timeDiff = getTimeDiff({
      startDate: new Date(state.ts.start),
      finishDate: new Date(state.ts.end),
    })
    axios
      .post(`${tgBotApiUrl}/kanban-2021/reminder/send`, {
        resultId: state.ts.end,
        chat_id: 432590698, // NOTE: Den Pol
        ts: new Date().getTime(),
        eventCode: 'aux_service',
        about: `\`/express-helper\`\n⛔ #uremont models sync errored\n${timeDiff.details} (started ${getTimeAgo(state.ts.start)})`,
        targetMD: `\`\`\`json\n${JSON.stringify(
          state,
          null,
          2
        )}\`\`\``,
      })
      .then((res) => res.data)
      .catch((err) => {
        axios
          .post(`${tgBotApiUrl}/kanban-2021/reminder/send`, {
            resultId: state.ts.end,
            chat_id: 432590698, // NOTE: Den Pol
            ts: new Date().getTime(),
            eventCode: 'aux_service',
            about: `\`/express-helper\`\n⛔ #uremont models sync errored + Report ERR\n${timeDiff.details} (started ${getTimeAgo(state.ts.start)})`,
            targetMD: err.message || 'No err.message',
          })
      })
  }
}

cron.schedule(
  isDev ? '01 45 04 * * *' : '01 29 10 * * Mon', // Every Mon at 10:29:01
  baseFn,
  {
    scheduled: true,
    timezone: 'Europe/Moscow',
  }
)
