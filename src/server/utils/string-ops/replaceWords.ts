type TCfg = {
  [key: string]: string;
}

export const replaceWords = ({ cfg, input }: {
  cfg: TCfg;
  input: string;
}): string => {
  // NOTE: input.replace(/cat|dog|goat/gi, function(matched){ return mapObj[matched]; })
  const re = new RegExp(Object.keys(cfg).join('|'), 'gi')

  return input.replace(
    re,
    (matched) => cfg[matched.toLowerCase()],
  )
}
