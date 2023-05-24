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

function getLastDaysStartDate(days) {
  const now = new Date();

  return new Date(now.getFullYear(), now.getMonth(), now.getDate() - days).getTime();
}
const isInTimeInterval = ({ startDate, targetDate, obj, fieldName }) =>
  !!obj[fieldName] && obj[fieldName] >= startDate && obj[fieldName] <= targetDate

class Logic {
  constructor({
    messages,
    REACT_APP_CHAT_UPLOADS_URL = '/chat/storage/uploads',
    traceableUsers
  }) {
    this.messages = messages;
    this.REACT_APP_CHAT_UPLOADS_URL = REACT_APP_CHAT_UPLOADS_URL
    this.traceableUsers = traceableUsers || []
  }

  get possibleStatuses() {
    return ['info', 'warning', 'danger', 'success', 'done', 'dead']
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

    // NTOE: V1
    // const latinAndCyrillicAndNumsRe = /[^a-zA-Za-åa-ö-w-я 0-9]/gi
    // const res = this.messages.reduce((acc, cur) => {
    //   if (!cur.text) return acc

    //   const words = cur.text.replace(/\n/g, ' ').split(' ').filter((w) => latinAndCyrillicAndNumsRe.test(w))
    //   for (const word of words) if (!!word && word[0] === '#') acc.push(word)
      
    //   return acc
    // }, [])
    // return [...new Set(res)].sort(abSort)

    // NOTE: V2
    const getTagList = ({
      originalMsgList,
    }) => {
      const uniqueTagsMap = originalMsgList.reduce((obj, msg) => {
        try {
          for (const tag of msg.match(/#[a-zA-Z0-9]+/g) || []) {
            if (!!tag && !obj[tag]) obj[tag] = true
          }
        } catch (err) {
          console.groupCollapsed(`- getTagList err levl 1 (msg: ${msg})`)
          console.warn(err)
          console.log(msg)
          console.log(typeof msg)
          console.groupEnd()
        }
    
        return obj
      }, {});
    
      return Object.keys(uniqueTagsMap)
    }
    const res = getTagList({
      originalMsgList: this.messages.map(({ text }) => text),
    })

    console.log(res)
    
    return res.sort(abSort)
  }
  _getItems({ statuses = this.possibleStatuses }) {
    const res = []
    for(const message of this.messages) {
      if (!!message.status && statuses.includes(message.status)) res.push(message)
    }
    return res
  }
  getCounters(statuses) {
    const lastWeekItems = this._getLastWeekItems()
    const lastMonthItems = this._getLastMonthItems()
    const last3MonthsItems = this._getLast3MonthsItems()
    return {
      total: this.getMessagesHasStatusCounter(statuses),
      totalCards: this.tasksTotalCounter,
      doneDetails: {
        lastWeek: {
          counter: this.doneLastWeek,
          items: lastWeekItems.done?.reverse() || [],
        },
        lastMonth: {
          counter: this.doneLastMonth,
          items: lastMonthItems.done?.reverse() || [],
        },
        last3Months: {
          counter: this.doneLast3Months,
          items: last3MonthsItems.done?.reverse() || [],
        }
      },
      danger: this.dangerCounter,
      dangerDetails: {
        items: this.dangerItems.sort(dynamicSort('editTs')).reverse()
      },
      successDetails: {
        items: this.successItems.sort(dynamicSort('editTs')).reverse()
      },
      success: this.successCounter,
      infoDetails: {
        items: this.infoItems.sort(dynamicSort('editTs')).reverse()
      },
      users: {
        jobless: this.usersJoblessCounter,
        statusCountersMap: this.getUserStatusCountersMap({
          statuses: this.possibleStatuses,
        }),
        statusMap: this.getUserStatusMap({
          statuses: this.possibleStatuses,
        }),
        joblessStatusMap: this.getUserJoblessStatusMap({
          statuses: ['danger', 'success']
        })
      },
    }
  }
  getMessagesHasStatusCounter(statuses = [
    // 'info',
    'warning',
    'danger',
    'success',
    'done',
    // 'dead'
  ]) {
    return this.messages.filter(({ status }) => !!status && statuses.includes(status)).length
  }
  getStatusKanban(statuses) {
    const res = {
      counters: this.getCounters(statuses),
      reactKanban: {
        columns: []
      }
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
          res.counters.total += 1
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

      res.reactKanban.columns.push({
        id: status,
        title: `${getTitle(status)} (${countersMapping[status]})`,
        cards: cards.sort(dynamicSort('position')),
      })
    }

    return res;
  }
  get tasksTotalCounter() {
    const statuses = this.possibleStatuses
    return this.messages.reduce((acc, { status }) => {
      if (statuses.includes(status)) acc += 1
      return acc
    }, 0)
  }
  _getTheStatusesLastDaysCounter(statuses, days) {
    const targetDate = Date.now()
    const startDate = getLastDaysStartDate(days)

    return this.messages.reduce((acc, obj) => {
      const { status, statusChangeTs } = obj
      if (
        statuses.includes(status)
        // && (!!statusChangeTs
        //   ? isInTimeInterval({ startDate, targetDate, obj, fieldName: 'statusChangeTs' })
        //   : isInTimeInterval({ startDate, targetDate, obj, fieldName: 'editTs' })
        && !!statusChangeTs && isInTimeInterval({ startDate, targetDate, obj, fieldName: 'statusChangeTs' })
      ) acc += 1
      return acc
    }, 0)
  }
  _getTheStatusesLastDaysItems(statuses, days) {
    const targetDate = Date.now()
    const startDate = getLastDaysStartDate(days)

    return this.messages.reduce((acc, obj) => {
      const { status, statusChangeTs } = obj
      if (
        statuses.includes(status)
        // && (!!statusChangeTs
        //   ? isInTimeInterval({ startDate, targetDate, obj, fieldName: 'statusChangeTs' })
        //   : isInTimeInterval({ startDate, targetDate, obj, fieldName: 'editTs' })
        && !!statusChangeTs && isInTimeInterval({ startDate, targetDate, obj, fieldName: 'statusChangeTs' })
      ) acc[status] = !!acc[status] ? [...acc[status], obj].sort(dynamicSort('editTs')) : [obj]
      return acc
    }, {})
  }

  get doneLastWeek() {
    return this._getTheStatusesLastDaysCounter(['done'], 7)
  }
  get doneLastMonth() {
    return this._getTheStatusesLastDaysCounter(['done'], 30)
  }
  get doneLast3Months() {
    return this._getTheStatusesLastDaysCounter(['done'], 90)
  }

  _getLastWeekItems(statuses = this.possibleStatuses) {
    return this._getTheStatusesLastDaysItems(statuses, 7)
  }
  _getLastMonthItems(statuses = this.possibleStatuses) {
    return this._getTheStatusesLastDaysItems(statuses, 30)
  }
  _getLast3MonthsItems(statuses = this.possibleStatuses) {
    return this._getTheStatusesLastDaysItems(statuses, 90)
  }

  getStatusCounter(statuses) {
    return this.messages.reduce((acc, { status }) => {
      if (statuses.includes(status)) acc += 1
      return acc
    }, 0)
  }
  get dangerCounter() {
    return this.getStatusCounter(['danger'])
  }
  get dangerItems() {
    return this._getItems({ statuses: ['danger'] })
  }
  get successItems() {
    return this._getItems({ statuses: ['success'] })
  }
  get infoItems() {
    return this._getItems({ statuses: ['info'] })
  }
  get successCounter() {
    return this.getStatusCounter(['success'])
  }
  get users() {
    const users = new Set()
    for (let i = 0, max = this.messages.length; i < max; i++) {
      if (!!this.messages[i].user)
        users.add(this.messages[i].user)
    }
    return [...users]
  }
  get assignedUsers() {
    const users = new Set()
    for (let i = 0, max = this.messages.length; i < max; i++) {
      if (!!this.messages[i].assignedTo && Array.isArray(this.messages[i].assignedTo) && this.messages[i].assignedTo.length > 0) {
        const aUsers = this.messages[i].assignedTo
        aUsers.forEach((name) => {
          users.add(name)
        })
      }
    }
    return [...users]
  }
  getUserStatusCountersMap({ statuses = [] }) {
    // NOTE: Result { pravosleva: number }
    const resultMap = new Map()
    const users = this.traceableUsers.length > 0 ? this.traceableUsers : this.assignedUsers
    
    for (let i = 0, max = users.length; i < max; i++)
      resultMap.set(users[i], 0)

    this.messages.forEach(({ status, assignedTo }) => {
      const aUsers = assignedTo
      if (!!aUsers && Array.isArray(aUsers) && aUsers.length > 0) {
        aUsers.forEach((name) => {
          if (
            resultMap.has(name)
            && statuses.includes(status)
          ) resultMap.set(name, resultMap.get(name) + 1)
        })
      }
    })

    return Object.fromEntries(resultMap)
  }
  getUserStatusMap({ statuses = [] }) {
    // NOTE: Result { pravosleva: { [status]: number } }
    const resultMap = new Map()
    const users = this.traceableUsers.length > 0 ? this.traceableUsers : this.assignedUsers
    // console.log(users)
    const template = statuses.reduce((acc, status) => {
      acc[status] = 0
      return acc
    }, {})

    for (let i = 0, max = users.length; i < max; i++)
      resultMap.set(users[i], template)

    this.messages.forEach(({ status, assignedTo }) => {
      const aUsers = assignedTo
      if (!!aUsers && Array.isArray(aUsers) && aUsers.length > 0) {
        aUsers.forEach((name) => {
          if (
            resultMap.has(name)
            && statuses.includes(status)
          ) {
            const oldTemplate = resultMap.get(name)
            if (typeof oldTemplate !== 'undefined') resultMap.set(name, {
              ...oldTemplate,
              [status]: oldTemplate[status] + 1
            })
          }
        })
      }
    })

    return Object.fromEntries(resultMap)
  }
  get usersJoblessCounter() {
    const usersMapObj = this.getUserStatusCountersMap({
      statuses: ['danger', 'success']
    })
    const users = this.traceableUsers.length > 0 ? this.traceableUsers : [] // this.assignedUsers
    return Object.keys(usersMapObj).reduce((acc, user) => {
      if (!usersMapObj[user] && users.includes(user)) acc += 1
      return acc
    }, 0)
  }
  getUserJoblessStatusMap({ statuses = [] }) {
    // NOTE: Result { pravosleva: { [status]: number } }
    const resultMap = new Map()
    const users = this.traceableUsers.length > 0 ? this.traceableUsers : []

    if (users.length === 0) return {}

    const template = statuses.reduce((acc, status) => {
      acc[status] = 0
      return acc
    }, {})

    for (let i = 0, max = users.length; i < max; i++)
      resultMap.set(users[i], template)

    this.messages.forEach(({ status, assignedTo }) => {
      const aUsers = assignedTo
      if (!!aUsers && Array.isArray(aUsers) && aUsers.length > 0) {
        aUsers.forEach((name) => {
          if (
            resultMap.has(name)
            && statuses.includes(status)
          ) {
            const oldTemplate = resultMap.get(name)
            if (typeof oldTemplate !== 'undefined') resultMap.set(name, {
              ...oldTemplate,
              [status]: oldTemplate[status] + 1
            })
          }
        })
      }
    })

    function logMapElements(value, key, _map) {
      let shouldBeRemovedReasons = []
      statuses.forEach((status) => {
        if (!!value[status]) shouldBeRemovedReasons.push(true)
        else shouldBeRemovedReasons.push(false)
      })
      if (shouldBeRemovedReasons.some(v => !!v))
        resultMap.delete(key)
    }
    resultMap.forEach(logMapElements)

    return Object.fromEntries(resultMap)
  }
}
