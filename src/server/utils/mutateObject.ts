export const mutateObject = ({ target, source }: {
  target: any;
  source: { [key: string]: any };
}) => {
  if (typeof source === 'object') {
    for (const key in source) {
      switch (true) {
        case Array.isArray(source[key]):
          if (!!target[key] && Array.isArray(target[key])) target[key] = [...new Set([...target[key], ...source[key]])]
          else target[key] = source[key]
          break
        case typeof source[key] === 'object' && !!source[key]:
          if (!!target[key]) mutateObject({ target: target[key], source: source[key] })
          else target[key] = source[key]
          break
        case typeof source[key] === 'object' && !source[key]:
          target[key] = source[key]
          break
        case typeof source[key] === 'string':
        case typeof source[key] === 'boolean':
        case typeof source[key] === 'number':
          target[key] = source[key]
          break
        default:
          break
      }
    }
  }
  return target
}
