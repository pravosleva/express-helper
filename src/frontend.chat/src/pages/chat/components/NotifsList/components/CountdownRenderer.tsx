import { Tag } from "@chakra-ui/react"
import { zeroPad } from 'react-countdown'

export const CountdownRenderer = ({ days, hours, minutes, seconds, completed }: any) => {
  if (completed) return <Tag rounded='2xl' colorScheme='red'>Time is up!</Tag>
  const getColorByDays = (days: number) => days <= 2 ? 'red' : 'gray'
  const color = getColorByDays(days)

  return <Tag rounded='2xl' colorScheme={color}>{!!days ? `${days}d ` : ''}{zeroPad(hours)}:{zeroPad(minutes)}:{zeroPad(seconds)}</Tag>
}
