import { useState, useEffect } from 'react'
import { useDebounce } from '~/common/hooks/useDebounce'

export interface IWindowDims {
  pageYOffset: number;
}

function isItMoreThan2Screens(): boolean {
  const { innerHeight, scrollY } = window
  return innerHeight * 2 - scrollY < 0
}

export const useScrollPosition = (): {
  scrollPosition: IWindowDims;
  isMoreThan2Screens: boolean;
} => {
  const [scrollPosition, setScrollPosition] = useState<IWindowDims>({
    pageYOffset: 0,
  })
  const [isMoreThan2Screens, setIsMoreThan2Screens] = useState<boolean>(false)

  const debouncedCurrentHeight = useDebounce(scrollPosition?.pageYOffset, 100)

  useEffect(() => {
    function handleScroll() {
      console.log('--eff:useScrollPosition:handleScroll', window.scrollY)
      setScrollPosition({ pageYOffset: !!window ? window.scrollY : 0 })
    }

    // return EventBus.on('scroll', handleScroll);
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  useEffect(() => {
    setIsMoreThan2Screens(isItMoreThan2Screens())
  }, [debouncedCurrentHeight, setIsMoreThan2Screens])

  return { scrollPosition, isMoreThan2Screens }
}