export const getNormalizedNumber = (val: any): number | null => {
  const num = parseInt(val, 10)

  if (Number.isNaN(num)) return val
  else if (val >= 0) return val

  return null
}
