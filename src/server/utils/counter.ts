export function* Counter(initValue: number = 0) {
  let count = initValue
  while (true) yield count++
}


// USAGE:
// const counter = Counter()
// counter.next().value