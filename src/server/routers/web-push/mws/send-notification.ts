import { THelp } from '~/utils/express-validation/interfaces'
import { mutateObject } from '~/utils/object-ops/mutateObject'
import { getIsExistsAndNumber } from '~/utils/string-ops'
import webpush from 'web-push'
import { state as savedSubscription } from '~/routers/web-push/utils'
import { Request, Response } from 'express'

// NOTE: Маршрут для сохранения подписки клиента
export const sendNotificationRules: THelp = {
  params: {
    body: {
      recipients: {
        type: 'object (array)',
        descr: 'Subscribers (usernames)',
        required: true,
        validate: (val) => {
          const result: {
            ok: boolean;
            reason?: string;
          } = { ok: true }

          switch (true) {
            case !Array.isArray(val):
              result.ok = false
              result.reason = 'Incorrect format; Expected string[]'
              break
            // case val?.length === 0:
            //   result.ok = false
            //   result.reason = 'Incorrect format: Usernames list len > 0, check it'
            //   break
            case val.length > 0 && !val.every((v: unknown) => typeof v === 'string'):
              result.ok = false
              result.reason = 'Incorrect format; Each element should be string, check it'
              break
            default:
              break
          }

          return result
        },
      },
      notifData: {
        type: 'object',
        descr: 'Notification data',
        required: true,
        validate: (val) => {
          const result: {
            ok: boolean;
            reason?: string;
          } = { ok: true }

          if (!val?.title || !val?.descr || !val?.relativeUrl) {
            result.ok = false
            result.reason = 'Incorrect format; Expected { title, descr, relativeUrl }'
          }

          return result
        },
      },
      clientData: {
        type: 'object',
        descr: 'Client data; Понадобилось для упрощенной проверки, является ли отправитель подписчиком; Отправка будет всем подвыбранным подписчикам кроме него',
        required: true,
        validate: (val) => {
          const result: {
            ok: boolean;
            reason?: string;
          } = { ok: true }

          if (!val?.subscription || !val?.nickname) {
            result.ok = false
            result.reason = 'Incorrect format; Expected { subscription: PushSubscription; nickname: string }'
          }

          return result
        },
      },
    },
    query: {
      _addData: {
        type: 'object',
        descr: 'Data for response mutation (for success case only)',
        required: false,
        validate: (val) => {
          const result: {
            ok: boolean;
            reason?: string;
          } = { ok: true }

          switch (true) {
            case !val || typeof val !== 'string':
              result.ok = false
              result.reason = 'req.query._addData shoud not be empty string'
              break
            // TODO: Others...
            default:
              try {
                const decoded = decodeURIComponent(val)
                const json = JSON.parse(decoded)

                switch (true) {
                  case typeof json !== 'object':
                    throw new Error('Incorrect format (Not object)')
                  case Object.keys(json).length === 0:
                    throw new Error('Incorrect format (Empty object)')
                  default:
                    // NOTE: Nothing...
                    break
                }
              } catch (err) {
                result.ok = false
                result.reason = `ERR: ${(err as Error).message || 'No err.message'}; req.query._addData shoud not be correctly encoded json; Use decodeURIComponent for this`
              }
              break
          }
          return result
        },
      },
      _setStatus: {
        type: 'number (stringified)',
        descr: 'Return target response status',
        required: false,
        validate: (val) => {
          const result: {
            ok: boolean;
            reason?: string;
          } = { ok: true }
          const possibleValues = ['404', '500']

          if (!possibleValues.includes(val)) {
            result.ok = false
            result.reason = `Incorrect value: Received ${String(val)}; Expected values: ${possibleValues.join(', ')}`
          }
          if (!getIsExistsAndNumber(val)) {
            result.ok = false
            result.reason = `Статус ответа может быть числом; Возможые значения: ${possibleValues.join(', ')}`
          }

          return result
        }
      },
      _responseDelay: {
        type: 'number',
        descr: 'Return response with status 500',
        required: false,
        validate: (val) => {
          const result: {
            ok: boolean;
            reason?: string;
          } = { ok: true }

          if (Number.isNaN(Number(val))) {
            result.ok = false
            result.reason = `Incorrect value: Received ${String(val)}; Expected: number`
          }

          return result
        }
      },
    },
  },
}

export const sendNotification = (req: Request, res: Response) => {
  try {
    const { query: { _addData, _setStatus, _responseDelay }, body } = req;
    const targetResponse = {
      status: 'Success',
    }

    if (_setStatus === '500')
      throw new Error(`Frontend wants to have ${_setStatus}`)

    if (!!_addData && typeof _addData === 'string') {
      // NOTE: Alredy validated
      const json = JSON.parse(decodeURIComponent(_addData))

      // -- NOTE: Mutate result if necessary
      if (!!json && typeof json === 'object' && Object.keys(json).length > 0)
        mutateObject({ target: targetResponse, source: json })
      // --

      switch (true) {
        case !!_responseDelay: {
          const delay = Number(_responseDelay)
          return setTimeout(() => {
            res.status(!!_setStatus ? Number(_setStatus) : 200).send(targetResponse)
          }, delay)
        }
        default:
          // v1
          return res.status(!!_setStatus ? Number(_setStatus) : 200).send(targetResponse)
      }
    }

    // -- NOTE: В продакшене сохраняйте в БД
    // savedSubscription.add(req.body.subscription)
    const payload = JSON.stringify({
      title: body.notifData.title,
      body: body.notifData.descr,
      url: body.notifData.relativeUrl,
    })

    if (savedSubscription.size > 0) {
      let subscriptions = savedSubscription.subscriptions
      if (body.recipients.length > 0) {
        // 1. Создаем набор имен в нижнем регистре для быстрого поиска
        const recipientsSet = new Set(body.recipients.map((name: string) => name.toLowerCase()))
        // 2. Фильтруем, приводя никнейм к нижнему регистру
        // const subscriptions = savedSubscription.subscriptions.filter((v) => body.recipients.includes(v.nickname))
        subscriptions = savedSubscription.subscriptions.filter((v) =>
          recipientsSet.has(v.nickname.toLowerCase())
        )
      }

      // Создаем массив промисов для всех отправок
      // Явно указываем возвращаемый тип для TypeScript
      const promises = subscriptions.map(async (sub): Promise<{ status: 'fulfilled' | 'rejected' }> => {
        try {
          switch (true) {
            case body.recipients.length === 1 && body.recipients[0].toLowerCase() === body.clientData.nickname.toLowerCase():
              // NOTE: Если это единственный получатель, он же отправитель
              await webpush.sendNotification(sub.subscription, payload)
              return { status: 'fulfilled' } // Важно вернуть это здесь!

            default: {
              // NOTE: Если это один из получателей, он же отправитель (тогда ему не отправляем)
              if (sub.nickname !== body.clientData.nickname) {
                await webpush.sendNotification(sub.subscription, payload)
                return { status: 'fulfilled' }
              }
              return { status: 'rejected' } // Важно вернуть это здесь!
            }
          }
        } catch (err: any) {
          if (err.statusCode === 410 || err.statusCode === 404) {
            savedSubscription.delete(sub.subscription);
          }
          return { status: 'rejected' }
        }
      });

      // Ждем выполнения всех отправок
      // Promise.allSettled(promises).then((results) => {
      //   const fulfilled = results.filter(r => r.status === 'fulfilled').length;
      //   const rejected = results.filter(r => r.status === 'rejected').length;

      //   // Отправляем ответ клиенту ОДИН раз
      //   res.status(200).json({
      //     message: 'Рассылка завершена',
      //     stats: { success: fulfilled, failed: rejected }
      //   });
      // });

      // Promise.all теперь гарантированно выполнится до конца
      Promise.all(promises)
        .then((results) => {
          const fulfilled = results.filter(r => r.status === 'fulfilled').length;
          const rejected = results.filter(r => r.status === 'rejected').length;

          mutateObject({
            target: targetResponse,
            source: {
              message: 'Рассылка завершена',
              success: fulfilled,
              failed: rejected,
            },
          })

          res.status(!!_setStatus ? Number(_setStatus) : 200).send(targetResponse)
        })

    } else {
      res.status(400).json({ error: 'Нет активных подписок' });
    }
    // --
  } catch (err) {
    res.status(500).send({
      status: 'Fail',
      requestId: '00000000-0000-0000-abcd-000000000010',
      message: (err as Error)?.message || 'No err message',
    })
  }
}
