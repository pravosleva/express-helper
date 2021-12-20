import stc from 'string-to-color'
import invert from 'invert-color'

type TProps = {
  name: string,
  size: number,
  mr?: string,
  ml?: string,
  fontSize?: number,
}

export const UserAva = ({ name, size, mr, ml, fontSize }: TProps) => {
  const shortNick = name.split(' ').filter((w: string, i: number) => i < 2).map((word: string) => word[0].toUpperCase()).join('')
  const personalColor = stc(name)

  return (
    <span
      className='opponent-ava-wrapper'
      style={{
        marginRight: mr || 0,
        marginLeft: ml || 0,
        // order: isMyMessage ? 2 : 1,
      }}
    >
      <span
        className='ava'
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
  )
}