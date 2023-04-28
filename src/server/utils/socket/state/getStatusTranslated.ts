

import { getCapitalizedFirstLetter } from '~/utils/getCapitalizedFirstLetter'
import { EMessageStatus } from './types'

const messageTranslator = {
  [EMessageStatus.Info]: 'Информация',
  [EMessageStatus.Warn]: 'Выясняем / Руки не дошли',
  [EMessageStatus.Danger]: 'В работе',
  [EMessageStatus.Success]: 'На тестировании',
  [EMessageStatus.Done]: 'Готово',
}

export const statusCfg: { [key in EMessageStatus]: { symbol: string; descr?: string; } } = {
  [EMessageStatus.Danger]: {
    symbol: '🔥',
  },
  [EMessageStatus.Success]: {
    symbol: '✅',
    descr: '(надо бы протестировать и закрыть)',
  },
  [EMessageStatus.Warn]: {
    symbol: '⚠️',
    descr: '(надо бы дать пояснения)',
  },
  [EMessageStatus.Dead]: {
    symbol: '💀',
  },
  [EMessageStatus.Done]: {
    symbol: '☑️',
  },
  [EMessageStatus.Info]: {
    symbol: 'ℹ️',
  },
}

export const getStatusTranslated = (status: EMessageStatus) => `${statusCfg[status]?.symbol || '❓'} ${messageTranslator[status] || getCapitalizedFirstLetter(status)}${!!statusCfg[status]?.descr ? ` ${statusCfg[status]?.descr}` : ''}`
