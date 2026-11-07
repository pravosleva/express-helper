import { THelp } from '~/utils/express-validation/interfaces'
import { mutateObject } from '~/utils/object-ops/mutateObject'
// import { getIsExistsAndNumber } from '~/utils/string-ops'
// import webpush from 'web-push'
import { state as savedSubscription } from '~/routers/web-push/utils'
import { Request, Response } from 'express'

// -- NOTE: Moved
// const publicVapidKey = process.env.EH_WEB_PUSH_VAPID_PUBLIC_KEY || '';
// const privateVapidKey = process.env.EH_WEB_PUSH_VAPID_PRIVATE_KEY || '';
// const EH_WEB_PUSH_DEVELOPER_EMAIL = process.env.EH_WEB_PUSH_DEVELOPER_EMAIL;

// webpush.setVapidDetails(
//   `mailto:${EH_WEB_PUSH_DEVELOPER_EMAIL}`,
//   publicVapidKey,
//   privateVapidKey
// )
// --

// NOTE: Маршрут для сохранения подписки клиента
export const checkSubscribtionRules: THelp = {
  params: {
    body: {
      clientData: {
        type: 'object',
        descr: 'Client data',
        required: true,
        validate: (val) => {
          const result: {
            ok: boolean;
            reason?: string;
          } = { ok: true }

          if (!val?.subscription) {
            result.ok = false
            result.reason = 'Incorrect format; Expected { subscription: PushSubscription }'
          }

          return result
        },
      },
    },
  },
}

export const checkSubscribtion = (req: Request, res: Response) => {
  try {
    const targetResponse = {
      status: 'Success',
    }

    // -- NOTE: В продакшене сохраняйте в БД
    // savedSubscription.add(req.body.clientData.subscription)
    const isExists = savedSubscription.has(req.body.clientData.subscription)
    // --

    mutateObject({
      target: targetResponse,
      source: {
        ok: isExists,
        message: !isExists ? `Not found, subscribed ${savedSubscription.size}` : `Subscriber exists, subscribed ${savedSubscription.size}`
      },
    })

    res.status(isExists ? 200 : 404).send(targetResponse)
  } catch (err) {
    res.status(500).send({
      status: 'Fail',
      requestId: '00000000-0000-0000-abcd-000000000010',
      message: (err as Error)?.message || 'No err message',
    })
  }
}
