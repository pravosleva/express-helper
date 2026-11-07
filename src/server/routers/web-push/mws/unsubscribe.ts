import { THelp } from '~/utils/express-validation/interfaces'
import { mutateObject } from '~/utils/object-ops/mutateObject'
import { state as savedSubscription } from '~/routers/web-push/utils'
import { Request, Response } from 'express'

// NOTE: Маршрут для удаления подписки клиента
export const unsubscribeRules: THelp = {
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

          if (!val?.endpoint) {
            result.ok = false
            result.reason = 'Incorrect format; Expected { endpoint: PushSubscription[\'endpoint\'] }'
          }

          return result
        },
      },
    },
  },
}

export const unsubscribe = (req: Request, res: Response) => {
  try {
    const { body } = req;
    const targetResponse = {
      status: 'Success',
    }

    // -- NOTE: В продакшене удаляйте из БД
    const deleted = savedSubscription.delete(body.clientData.endpoint)
    // --

    mutateObject({
      target: targetResponse,
      source: {
        message: !!deleted
          ? `Подписка удалена из базы; Текущее количество подписчиков: ${savedSubscription.size}`
          : `Подписка уже отсутствовала в базе; Текущее количество подписчиков: ${savedSubscription.size}`
      },
    })

    // NOTE: Если токен не найден, возвращаем 200, так как цель достигнута
    res.status(!!deleted ? 201 : 200).send(targetResponse)
  } catch (err) {
    res.status(500).send({
      status: 'Fail',
      requestId: '00000000-0000-0000-abcd-000000000010',
      message: (err as Error)?.message || 'No err message',
    })
  }
}
