function dynamicSort(property) {
  let sortOrder = 1;
  if (property[0] === "-") {
    sortOrder = -1;
    property = property.substr(1);
  }
  return function (a,b) {
    // NOTE: next line works with strings and numbers, 
    // and you may want to customize it to your needs
    const result = // a[property] !== b[property] ?
      (a[property] < b[property]) ? -1 : (a[property] > b[property]) ? 1 : 0
    return result * sortOrder;
  }
}

class Logic {
  constructor(messages, REACT_APP_CHAT_UPLOADS_URL = '/chat/storage/uploads') {
    this.messages = messages;
    this.REACT_APP_CHAT_UPLOADS_URL = REACT_APP_CHAT_UPLOADS_URL
  }

  getFiltered({
    filters,
    searchText,
    additionalTsToShow,
    assignmentExecutorsFilters,
  }) {
    const result = []

    switch (true) {
      case !!searchText:
        const words = searchText?.toLowerCase().split(' ').filter((str) => !!str)

        if (filters.length > 0) {
          // V1:
          // return this.messages.filter(({ status, text, ts }) => filters.includes(status) && (!!words ? new RegExp(words.join("|")).test(text) : true) || additionalTsToShow.includes(ts))
          // V2: For Next one btn
          this.messages.forEach((msg, i, arr) => {
            const { status, text, ts, assignedTo } = msg
            const condition = (
              !!status && filters.includes(status)
              && (!!words ? new RegExp(words.join("|"), 'gi').test(text.toLowerCase()) : true)
              && (assignmentExecutorsFilters.length > 0 ? !!assignedTo && Array.isArray(assignedTo) && assignmentExecutorsFilters.includes(assignedTo[0]) : true)
              ) || additionalTsToShow.includes(ts)

            if (condition) {
              const modifiedMsg = { ...msg }
              const isLast = i === arr.length - 1

              if (!isLast) {
                const nextMsg = this.messages[i + 1]

                // NOTE: NEXT ASSIGNMENT CONDITION [tested]
                const isNextHidden = !!nextMsg.status && !(filters.includes(nextMsg.status)
                  && (!!words ? new RegExp(words.join("|"), 'gi').test(nextMsg.text.toLowerCase()) : true) || additionalTsToShow.includes(nextMsg.ts)
                  && (assignmentExecutorsFilters.length > 0 && !!nextMsg.assignedTo && Array.isArray(nextMsg.assignedTo) && assignmentExecutorsFilters.includes(nextMsg.assignedTo[0]))
                )

                modifiedMsg._next = { ts: this.messages[i + 1].ts, isHidden: isNextHidden }
              }

              result.push(modifiedMsg)
            }
          })

          return result
        } else {
          // @ts-ignore
          // V1:
          // return this.messages.filter(({ text }) => new RegExp(words.join("|")).test(text.toLowerCase()))
          this.messages.forEach((msg, i, arr) => {
            const { text, ts, assignedTo } = msg
            const getCondition = (testedText) => {
              return !!words
              && new RegExp(words.join("|")).test(testedText.toLowerCase())
              && (assignmentExecutorsFilters.length > 0 ? !!assignedTo && Array.isArray(assignedTo) && assignmentExecutorsFilters.includes(assignedTo[0]) : true)
            }
            const condition = getCondition(text) || additionalTsToShow.includes(ts)

            if (condition) {
              const modifiedMsg = { ...msg }
              const isLast = i === arr.length - 1

              if (!isLast) {
                const nextMsg = this.messages[i + 1]

                // NOTE: NEXT ASSIGNMENT CONDITION [tested]
                const isNextHidden = !(
                  (!!words
                    ? (
                      new RegExp(words.join("|")).test(nextMsg.text.toLowerCase())
                      && (assignmentExecutorsFilters.length > 0 ? !!nextMsg.assignedTo && Array.isArray(nextMsg.assignedTo) && assignmentExecutorsFilters.includes(nextMsg.assignedTo[0]) : true)
                    )
                    : false) || additionalTsToShow.includes(nextMsg.ts))

                modifiedMsg._next = { ts: this.messages[i + 1].ts, isHidden: isNextHidden }
              }

              result.push(modifiedMsg)
            }
          })

          return result
        }
      // V1:
      // case filters.length > 0: return this.messages.filter(({ status }) => filters.length > 0 ? filters.includes(status) : true)
      // V2:
      case filters.length > 0:
        this.messages.forEach((msg, i, arr) => {
          const { status, ts, assignedTo } = msg
          const condition = (
            !!status && filters.includes(status)
            && (assignmentExecutorsFilters.length > 0 ? !!assignedTo && Array.isArray(assignedTo) && assignmentExecutorsFilters.includes(assignedTo[0]) : true)
          ) || additionalTsToShow.includes(ts)

          if (condition) {
            const modifiedMsg = { ...msg }
            const isLast = i === arr.length - 1

            if (!isLast) {
              const nextMsg = this.messages[i + 1]

              // NOTE: NEXT ASSIGNMENT CONDITION [tested]
              const isNextHidden = !additionalTsToShow.includes(nextMsg.ts)
              && !!nextMsg.status && !filters.includes(nextMsg.status)
              && !(assignmentExecutorsFilters.length > 0 && !!nextMsg.assignedTo && Array.isArray(nextMsg.assignedTo) && !assignmentExecutorsFilters.includes(nextMsg.assignedTo[0]))

              modifiedMsg._next = { ts: this.messages[i + 1].ts, isHidden: isNextHidden }
            }

            result.push(modifiedMsg)
          }
        })

        return result
      case assignmentExecutorsFilters.length > 0:
        this.messages.forEach((msg, i, arr) => {
          const { ts, assignedTo } = msg
          const condition = (
            (assignmentExecutorsFilters.length > 0 ? !!assignedTo && Array.isArray(assignedTo) && assignmentExecutorsFilters.includes(assignedTo[0]) : true)
          )|| additionalTsToShow.includes(ts)

          if (condition) {
            const modifiedMsg = { ...msg }
            const isLast = i === arr.length - 1

            if (!isLast) {
              const nextMsg = this.messages[i + 1]

              // NOTE: NEXT ASSIGNMENT CONDITION [tested]
              const isNextHidden = !additionalTsToShow.includes(nextMsg.ts) && !!nextMsg.status && !filters.includes(nextMsg.status) && !(assignmentExecutorsFilters.length > 0 && !!nextMsg.assignedTo && Array.isArray(nextMsg.assignedTo) && assignmentExecutorsFilters.includes(nextMsg.assignedTo[0]))

              modifiedMsg._next = { ts: this.messages[i + 1].ts, isHidden: isNextHidden }
            }

            result.push(modifiedMsg)
          }
        })
        return result
      default: return this.messages
    }
  }
  getCountByFilter(filter) {
    switch (true) {
      case !!filter: return this.messages.filter(({ status }) => status === filter).length

      default: return this.messages.length
    }
  }
  getCountByFilters(filters, filtersAssignedTo) {
    switch (true) {
      case filters.length > 0 && !filtersAssignedTo?.length: return this.messages.filter(({ status }) => !!status && filters.includes(status)).length
      case filters.length > 0 && !!filtersAssignedTo?.length: return this.messages.filter(({ status, assignedTo }) => !!status && filters.includes(status) && (!!assignedTo && filtersAssignedTo?.includes(assignedTo[0]))).length
      default: return this.messages.length
    }
  }
  getAllImagesMessages() {
    return this.messages.filter(({ file }) => !!file)
  }
  getAllImagesLightboxFormat() {
    const result = []

    this.messages.forEach(({ file, text }) => {
      if (!!file) {
        const { fileName, filePath } = file

        if (!!fileName) result.push({ src: `${this.REACT_APP_CHAT_UPLOADS_URL}/${filePath || fileName}`, alt: text })
      }
    })

    return result.reverse()
  }
  getAssignmentCounterExecutor(name) {
    let res = 0

    for(const message of this.messages) {
      if (!!message.assignedTo && message.assignedTo[0] === name) res += 1
    }

    return res
  }
  getTags() {
    const abSort = (a, b) => a.localeCompare(b)
    const latinAndCyrillicAndNumsRe = /[^a-zA-Za-åa-ö-w-я 0-9]/gi
    const res = this.messages.reduce((acc, cur) => {
      if (!cur.text) return acc
      const words = cur.text.replace(/\n/g, ' ').split(' ').filter((w) => latinAndCyrillicAndNumsRe.test(w))
      for (const word of words) if (word[0] === '#') acc.push(word)
      return acc
    }, [])
    return [...new Set(res)].sort(abSort)
  }
  getStatusKanban(statuses) {
    const res = {
      columns: []
    }
    const countersMapping = {}

    for (const status of statuses) {
      const cards = []
      countersMapping[status] = 0
      
      for (const message of this.messages) {
        if (message.status === status) {
          countersMapping[status] += 1
          cards.push({
            id: message.ts,
            title: message.user,
            description: message.text,
            ...message,
          })
        }
      }

      const getTitle = (status) => {
        const mapping = {
          danger: '🔥 В работе',
          success: '✅ На тестировании',
          warning: '⚠️ Выясняем / Руки не дошли',
          done: '☑️ Завершенные',
          info: 'ℹ️ Идея / Информация',
          dead: '💀 Мертвые',
        }
        return mapping[status] || status
      }

      res.columns.push({
        id: status,
        title: `${getTitle(status)} (${countersMapping[status]})`,
        cards: cards.sort(dynamicSort('position')),
      })
    }

    return res;
  }
}
