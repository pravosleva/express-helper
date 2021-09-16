const tryAnything = async ({ cb }: { cb: () => void }) => {
  if (!cb) {
    // TODO: Планируется асинхронный запрос по АПИ
    await cb()
  }

  return Promise.resolve()
}
const myTimeoutPromise = (ms: number) => new Promise((res, rej) => {
  // something could be checked...
  setTimeout(res, ms)
});
export function createPollingByConditions (props) {
  const {
    cb,
    toBeOrNotToBe,
    interval,
    callbackAsResolve,
    callbackAsReject
  } = props

  // console.log ("createPollingByConditions ()", url, toBeOrNotToBe(), interval);
  if (toBeOrNotToBe()) {
    tryAnything({ cb })
      .then (
        result => {
          console.log ('createPollingByConditions () is done.')
          callbackAsResolve(result)
          return myTimeoutPromise(interval)
        },
        err => {
          callbackAsReject('createPollingByConditions () is failed: Trying to reconnect...')
          return (myTimeoutPromise (interval))
        }
      )
      .then (() => {
        // this was promised by _devay () which was called at the end of previous then ()
        createPollingByConditions(props)
      })
      .catch (err => {
        console.log(err)
        createPollingByConditions(props)
      })
  }
};