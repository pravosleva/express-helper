export const getTagList = ({
  originalMsgList,
}: {
  originalMsgList: string[];
}): string[] => {
  const uniqueTagsMap = originalMsgList.reduce((obj, msg) => {
    for (const tag of msg.match(/#[a-zA-Z0-9]+/g) || [])
      if (!obj[tag]) obj[tag] = true

    return obj
  }, {});

  return Object.keys(uniqueTagsMap)
}
