import { useEffect, useState } from 'react'

type TProps = {
  text: string
  limit: number
}

export const useTextCounter = ({ text, limit }: TProps): [left: number, isLimitReached: boolean] => {
  const [left, setLeft] = useState<number>(0)
  const [isLimitReached, setIsLimitReached] = useState<boolean>(false)

  useEffect(() => {
    const textLen = text.length
    const diff = limit - textLen

    setIsLimitReached(diff <= 0)
    setLeft(diff)
  }, [text, limit])

  return [left, isLimitReached]
}
