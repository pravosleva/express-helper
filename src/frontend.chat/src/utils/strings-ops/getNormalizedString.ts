export const getNormalizedString = (s: string) => {
  return s.trim().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(new RegExp("\\\\", "g"), "\\\\").replace(/^\/+/, '')
}