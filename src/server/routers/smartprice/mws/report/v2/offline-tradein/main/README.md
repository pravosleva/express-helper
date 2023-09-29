## Usage example

```js
const requiredFields = ['eventCode', 'about', 'errMessage', 'whatHaveWeDone', 'jsonStringified']
const couldBeEmpty = ['errMessage', 'whatHaveWeDone', 'jsonStringified']
const errs = []
for (let key of requiredFields)
  if (!ps[key] && !couldBeEmpty.includes(key)) errs.push(`Missing param: \`${key}\``)

if (errs.length > 0) throw new Error(errs.join('; '))

const rowValues = [
  ps.eventCode,
  this.uniqueSessionKey,
  ps.about,
  ps.errMessage || '',
  ps.whatHaveWeDone || '',
  ps.jsonStringified || '',
]
Wget({
  __maxRetries: 3,
  timeout: 12000,
  url: `${window.location.protocol}//pravosleva.pro/express-helper/sp/report/v2/offline-tradein/main/send`,
  type: 'json',
  method: 'POST',
  contentType: 'application/json; charset=utf-8',
  data: JSON.stringify({ rowValues }),
  success: (res) => {
    if (!!ps.cb) ps.cb(!!res.id ? `#${res.id}` : undefined)
  },
  error: (res) => {
    if (!!ps.cb) ps.cb(res?.message)
  },
})
```
