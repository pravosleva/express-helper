/* eslint-disable no-undef */
;(() => {
  window.addEventListener('load', () => {
    setTimeout(() => {
      const topBars = document.getElementsByClassName('topbar')
      const topBar = topBars[0]

      if (topBar) {
        topBar.style.boxShadow =
          '0px 2px 4px -1px rgba(0,0,0,0.2),0px 4px 5px 0px rgba(0,0,0,0.14),0px 1px 10px 0px rgba(0,0,0,0.12)'
      }

      const topbarElms = document.getElementsByClassName('topbar-wrapper')
      const wrapper = topbarElms[0]

      if (wrapper) {
        wrapper.style.height = '35px'
      }

      const imgs = wrapper.getElementsByTagName('img')
      const img = imgs[0]

      if (img) {
        img.setAttribute('src', 'https://smartprice.ru/static2/images/smartprice/logo.png')
        img.style.objectFit = 'contain'
        img.style.maxHeight = '28px'
      }
    }, 0)
  })
})()
