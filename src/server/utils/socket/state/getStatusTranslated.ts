

import { getCapitalizedFirstLetter } from '~/utils/getCapitalizedFirstLetter'
import { EMessageStatus } from './types'

const messageTranslator = {
  [EMessageStatus.Info]: 'Информация',
  [EMessageStatus.Warn]: 'Выясняем / Руки не дошли',
  [EMessageStatus.Danger]: 'В работе',
  [EMessageStatus.Success]: 'На тестировании',
  [EMessageStatus.Done]: 'Готово',
}

export const statusCfg: { [key in EMessageStatus]: string } = {
  [EMessageStatus.Danger]: '🔥',
  [EMessageStatus.Success]: '✅',
  [EMessageStatus.Warn]: '⚠️',
  [EMessageStatus.Dead]: '💀',
  [EMessageStatus.Done]: '☑️',
  [EMessageStatus.Info]: 'ℹ️',
}

export const getStatusTranslated = (status: EMessageStatus) => `${statusCfg[status] || '❓'} ${messageTranslator[status] || getCapitalizedFirstLetter(status)}`
