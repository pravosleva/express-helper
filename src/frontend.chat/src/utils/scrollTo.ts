// const isDev = process.env.NODE_ENV === 'development'

export const scrollToRef = (ref: any, headerPx: number = 0, additionalPx: number = 0, noAnimation?: boolean) => {
  if (!!ref?.current && !!window) {
    // ref.current.scrollIntoView()
    window.scrollTo({ left: 0, behavior: noAnimation ? 'auto' : 'smooth', top: ref.current.offsetTop - headerPx - additionalPx })
  }
}
export const scrollTo = (ref: any, noAnimation?: boolean) => {
  scrollToRef(ref, 37, 8, noAnimation)
}
export const scrollTop = () => {
  window.scrollTo({ top: 0, behavior: 'smooth' })
}

export const scrollIntoView = (ts: number, cb?: { success?: (ts: number) => void, fail: (ts: number) => void }): void => {
  try {
    const targetElm = document.getElementById(String(ts)) // reference to scroll target
      
    if (!!targetElm) {
      targetElm.scrollIntoView({ block: 'start', inline: 'nearest', behavior: 'auto' })
      // if (isDev && !!cb?.success) cb.success(ts)
      if (!!cb?.success) cb.success(ts)
    } else if (!!cb?.fail) cb.fail(ts)
  } catch (err) {
    console.log(err)
  }
}

/* USAGE:
() => {
  scrollIntoView(
    ts,
    {
      fail: (ts) => {
        toast({
          position: 'bottom',
          title: `Сообщения ${ts} нет в отфильтрованных`,
          description: 'Либо сделать догрузку списка, либо сбросить фильтры',
          status: 'warning',
          duration: 5000,
        })
      },
      success: (ts) => {
        toast({
          position: 'bottom',
          title: `Msg ${ts} In viewport`,
          status: 'success',
          duration: 3000,
        })
      },
    }
  )
}
*/
