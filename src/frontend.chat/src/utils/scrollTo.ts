const scrollToRef = (ref: any, headerPx: number = 0, additionalPx: number = 0, noAnimation?: boolean) => {
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