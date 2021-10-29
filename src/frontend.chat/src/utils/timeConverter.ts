//See also: https://github.com/pravosleva/pravosleva-blog-frontend-nextjs/blob/master/utils/timeConverter.js

// 18:15
const getHoursMinutesBySeconds = (date: string | number) => {
  // const dt = new Date(sec * 10 ** 3)
  const dt = new Date(date)
  const hr = dt.getHours() < 10 ? `0${dt.getHours()}` : dt.getHours()
  const min = dt.getMinutes() < 10 ? `0${dt.getMinutes()}` : dt.getMinutes()

  return `${hr}:${min}`
}

// 09.11.2020 в 18:15
export const getNormalizedDateTime = (date: string | number) => {
  // const dt = new Date(sec * 10 ** 3)
  const dt = new Date(date)
  const monthNames = ['01', '02', '03', '04', '05', '06', '07', '08', '09', '10', '11', '12']
  const dateIndex = dt.getDate() < 10 ? `0${dt.getDate()}` : dt.getDate()
  const monthIndex = dt.getMonth()
  const year = dt.getFullYear() // String(dt.getFullYear()).substring(2, 4)

  return `${dateIndex}.${monthNames[monthIndex]}.${year} в ${getHoursMinutesBySeconds(date)}`
}

// 09.11.2020
export const getNormalizedDate = (date: string | number) => {
  // const dt = new Date(sec * 10 ** 3)
  const dt = new Date(date)
  const monthNames = ['01', '02', '03', '04', '05', '06', '07', '08', '09', '10', '11', '12']
  const dateIndex = dt.getDate() < 10 ? `0${dt.getDate()}` : dt.getDate()
  const monthIndex = dt.getMonth()
  const year = dt.getFullYear() // String(dt.getFullYear()).substring(2, 4)

  return `${dateIndex}.${monthNames[monthIndex]}.${year}`
}

// 09.11.2020 18:15:45
export const getNormalizedDateTime2 = (date: string | number) => {
  // const dt = new Date(sec * 10 ** 3)
  const dt = new Date(date)
  const seconds = dt.getSeconds()

  return `${getNormalizedDate(date)} ${getHoursMinutesBySeconds(date)}:${seconds}`
}

// 09.11.2020 18:15
export const getNormalizedDateTime3 = (date: string | number) => {
  // const dt = new Date(sec * 10 ** 3)
  // const dt = new Date(date)

  return `${getNormalizedDate(date)} ${getHoursMinutesBySeconds(date)}`
}