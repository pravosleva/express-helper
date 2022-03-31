import React, { useState, createContext, useContext, useEffect } from 'react'
import { Cookies } from 'react-cookie-consent'

type TMainContext = {
  isCookieAccepted: boolean
  onAcceptCookie: () => void
  onDeclineCookie: () => void
  toggler: (value: boolean) => void
}

export const MainContext = createContext<TMainContext>({
  isCookieAccepted: false,
  onAcceptCookie: () => {
    throw new Error('onAcceptCookie method should be implemented')
  },
  onDeclineCookie: () => {
    throw new Error('onDeclineCookie method should be implemented')
  },
  toggler: () => {
    throw new Error('toggler method should be implemented')
  },
})

export const MainContextProvider = ({ children }: any) => {
  const [isCookieAccepted, setIsCookieAccepted] = useState<boolean>(false)
  const removeCookie = () => {
    Cookies.remove('is-cookie-confirmed')
  }
  const setCookie = () => {
    Cookies.set('is-cookie-confirmed', '1', { expires: 1 })
  }
  const handleAcceptCookie = () => {
    setIsCookieAccepted(true)
    setCookie()
  }
  const handleDeclineCookie = () => {
    setIsCookieAccepted(false)
    removeCookie()
  }
  const toggler = () => {
    setIsCookieAccepted((state) => {
      switch (true) {
        case (!state === false):
          removeCookie()
          break
        default:
          setCookie()
          break
      }
      return !state
    })
  }
  useEffect(() => {
    const hasConfirmedAlready = Cookies.get('is-cookie-confirmed') === '1'

    if (hasConfirmedAlready) handleAcceptCookie()
  }, [])

  return (
    <>
      <MainContext.Provider
        value={{
          isCookieAccepted,
          onAcceptCookie: handleAcceptCookie,
          onDeclineCookie: handleDeclineCookie,
          toggler,
        }}
      >
        {children}
      </MainContext.Provider>
    </>
  )
}

export const useMainContext = () => useContext(MainContext)
