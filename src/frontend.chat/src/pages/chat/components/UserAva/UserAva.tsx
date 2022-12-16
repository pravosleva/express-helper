import stc from 'string-to-color'
import invert from 'invert-color'
import stylesBase from '~/App.module.scss'
import styles from '~/pages/chat/Chat.module.scss'
import { Placement as TPlacement, Tooltip } from '@chakra-ui/react'

type TProps = {
  name: string,
  size: number,
  mr?: string,
  ml?: string,
  fontSize?: number,
  onClick?: () => void,
  tooltipText?: string,
  tooltipPlacement?: TPlacement,
}

export const UserAva = ({ name, size, mr, ml, fontSize, onClick, tooltipText, tooltipPlacement }: TProps) => {
  const shortNick = name.split(' ').filter((w: string, i: number) => i < 2).map((word: string) => word[0].toUpperCase()).join('')
  const personalColor = stc(name)

  return (
    <Tooltip label={!!tooltipText ? tooltipText : name} aria-label='NAME' placement={!!tooltipPlacement ? tooltipPlacement : 'bottom'}>
      <span
        className={styles['opponent-ava-wrapper']}
        style={{
          marginRight: mr || 0,
          marginLeft: ml || 0,
          // order: isMyMessage ? 2 : 1,
          cursor: !!onClick ? 'pointer' : 'default',
          // border: '1px solid red',
        }}
        onClick={onClick || undefined}
      >
        <span
          className={stylesBase['ava']}
          style={{
            fontSize: !!fontSize ? `${fontSize}px` : '17px',
            borderRadius: '50%',
            width: `${size}px`,
            height: `${size}px`,
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            // backgroundColor: 'var(--chakra-colors-gray-500)',
            // color: '#FFF',
            backgroundColor: personalColor,
            color: invert(personalColor), // invert(personalColor, true),
          }}
        >
          <span>{shortNick}</span>
        </span>
      </span>
    </Tooltip>
  )
}