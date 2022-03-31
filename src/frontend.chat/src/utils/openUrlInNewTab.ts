export function openUrlInNewTab(url: string) {
  if (!url) throw new Error('URL could not be empty')

  const newLink = window.document.createElement('a')

  newLink.setAttribute('href', url)
  newLink.setAttribute('target', '_blank')
  newLink.click()
  newLink.remove()
}
