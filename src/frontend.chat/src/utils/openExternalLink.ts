export const openExternalLink = (link: string): () => void => () :void => {
  window.open(link, "_blank");
}