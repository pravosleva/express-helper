//See also: https://github.com/pravosleva/pravosleva-blog-frontend-nextjs/blob/master/utils/timeConverter.js

// 09.11.2020 в 18:15
const getHoursMinutesBySeconds = (date: string | number) => {
  // const dt = new Date(sec * 10 ** 3)
  const dt = new Date(date)
  const hr = dt.getHours() < 10 ? `0${dt.getHours()}` : dt.getHours()
  const min = dt.getMinutes() < 10 ? `0${dt.getMinutes()}` : dt.getMinutes()

  return `${hr}:${min}`
}
export const getNormalizedDateTime = (date: string | number) => {
  // const dt = new Date(sec * 10 ** 3)
  const dt = new Date(date)
  const monthNames = ['01', '02', '03', '04', '05', '06', '07', '08', '09', '10', '11', '12']
  const dateIndex = dt.getDate() < 10 ? `0${dt.getDate()}` : dt.getDate()
  const monthIndex = dt.getMonth()
  const year = dt.getFullYear() // String(dt.getFullYear()).substring(2, 4)

  return `${dateIndex}.${monthNames[monthIndex]}.${year} в ${getHoursMinutesBySeconds(date)}`
}

export const getNormalizedDate = (date: string) => {
  // const dt = new Date(sec * 10 ** 3)
  const dt = new Date(date)
  const monthNames = ['01', '02', '03', '04', '05', '06', '07', '08', '09', '10', '11', '12']
  const dateIndex = dt.getDate() < 10 ? `0${dt.getDate()}` : dt.getDate()
  const monthIndex = dt.getMonth()
  const year = dt.getFullYear() // String(dt.getFullYear()).substring(2, 4)

  return `${dateIndex}.${monthNames[monthIndex]}.${year}`
}
