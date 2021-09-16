export function* Counter() {
  let count = 0
  while (true) yield count++
}


// USAGE:
// const counter = Counter()
// counter.next().value