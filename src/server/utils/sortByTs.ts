export function sortByTs(a, b) {
  if (a.ts < b.ts) return -1
  if (a.st > b.st) return 1
  return 0
}
