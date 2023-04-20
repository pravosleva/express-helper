

import { getCapitalizedFirstLetter } from '~/utils/getCapitalizedFirstLetter'
import { EMessageStatus } from './types'

const messageTranslator = {
  [EMessageStatus.Info]: 'Информация',
  [EMessageStatus.Warn]: 'Выясняем / Руки не дошли',
  [EMessageStatus.Danger]: 'В работе',
  [EMessageStatus.Success]: 'На тестировании',
  [EMessageStatus.Done]: 'Готово',
}

export const getStatusTranslated = (status: EMessageStatus) => messageTranslator[status] || getCapitalizedFirstLetter(status)
