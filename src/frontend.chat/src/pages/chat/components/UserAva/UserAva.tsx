import stc from 'string-to-color'
import invert from 'invert-color'

type TProps = {
  name: string,
  size: number,
  mr?: string,
}

export const UserAva = ({ name, size, mr }: TProps) => {
  const shortNick = name.split(' ').filter((w: string, i: number) => i < 2).map((word: string) => word[0].toUpperCase()).join('')
  const personalColor = stc(name)

  return (
    <span
      className='opponent-ava-wrapper'
      style={{
        marginRight: mr || 0,
        // order: isMyMessage ? 2 : 1,
      }}
    >
      <span
        className='ava'
        style={{
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
        {shortNick}
      </span>
    </span>
  )
}