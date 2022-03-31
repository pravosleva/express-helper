import { useEffect, useRef } from 'react'
import { useNotifsContext } from '~/common/hooks'
import { Cookies } from 'react-cookie-consent'

interface IProps {
  cookieName: string
}

function getReadableSnakeCase(name: string) {
  function capitalize(word: string) {
    return word.charAt(0).toUpperCase() + word.substring(1);
  }
  const words = name.match(/[A-Za-z][a-z]*/g) || [];

  return words.map(capitalize).join(" ");
}

export const useUrgentMsgFromCookies = ({ cookieName }: IProps) => {
  const { addNotification } = useNotifsContext()
  const counterRef = useRef<number>(0)

  useEffect(() => {
    const serviceMsg = Cookies.get(cookieName)

    if (!!serviceMsg && !!window) {
      if (!counterRef.current) {
        addNotification({
          title: getReadableSnakeCase(cookieName),
          message: serviceMsg,
          container: 'bottom-left',
          type: 'info',
          onRemoval: (id, removedBy) => {
            console.log(id, removedBy)
          },
        })
        counterRef.current += 1
      }
    }
  }, [addNotification, cookieName])

  return null
}
