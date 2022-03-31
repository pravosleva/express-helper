module.exports = (chanceA, chanceB, chanceC, items) => {
  const totalWeight = chanceA + chanceB + chanceC
  // generate random number in range from 1 to `totalWeight`
  const tmp = 1 + Math.random() * totalWeight
  // console.log(tmp, (chanceA + chanceB + chanceC))
  if (tmp > 0 && tmp <= chanceA) {
    return items[0]
  }
  if (chanceA < tmp && tmp <= chanceA + chanceB) {
    return items[1]
  }
  if (chanceA + chanceB < tmp && tmp <= chanceA + chanceB + chanceC) {
    return items[2]
  }
  return items[0]
}
