import React, { createContext, useContext } from 'react'
import ReactNotification, { store, ReactNotificationOptions } from 'react-notifications-component'
import { useWindowSize } from '~/common/hooks'

type TNotifsContext = {
  addNotification: (opts: ReactNotificationOptions) => void
}

export const NotifsContext = createContext<TNotifsContext>({
  addNotification: () => {
    throw new Error('addNotification method should be implemented')
  },
})

export const NotifsContextProvider = ({ children }: any) => {
  const { isMobile } = useWindowSize()
  const addNotification = (props: ReactNotificationOptions) => {
    store.addNotification(props)
  }

  return (
    <>
      <ReactNotification isMobile={isMobile} />
      <NotifsContext.Provider
        value={{ addNotification }}
      >
        {children}
      </NotifsContext.Provider>
    </>
  )
}

export const useNotifsContext = () => useContext(NotifsContext)
