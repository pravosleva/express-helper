import { Tag, Tooltip } from "@chakra-ui/react"
import { zeroPad } from 'react-countdown'
import { getTimeAgo } from '~/utils/getTimeAgo'
import { getDayMonth } from '~/utils/timeConverter'

const alarmConfig = {
  warning: 8,
  danger: 4,
}

export const CountdownRenderer = ({ days, hours, minutes, seconds, completed, total, props, ...rest }: any) => {
  // console.log(Object.keys(props))
  if (completed) return (
    <Tooltip label={`🏁 Time is up! ${getDayMonth(props.date)} 🏁`} aria-label='DEADLINE'>
      <Tag rounded='2xl' colorScheme='red' style={{ fontFamily: 'system-ui' }}>{getTimeAgo(props.date)}</Tag>
    </Tooltip>
  )
  const getColorByDays = (days: number) =>
    days <= alarmConfig.warning
    ? days <= alarmConfig.danger
      ? 'red'
      : 'yellow'
    : 'gray'
  const color = getColorByDays(days)

  return (
    <Tooltip label={`Deadline ${getDayMonth(props.date)}`} aria-label='DEADLINE'>
      <Tag rounded='2xl' colorScheme={color} style={{ fontFamily: 'system-ui' }}>{!!days ? `${days}d ` : ''}{zeroPad(hours)}:{zeroPad(minutes)}:{zeroPad(seconds)}</Tag>
    </Tooltip>
  )
}
