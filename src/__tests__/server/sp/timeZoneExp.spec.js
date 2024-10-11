/* eslint-disable jest/no-disabled-tests */
// import { partnerSettings } from '../../../server/routers/smartprice/utils/offline-tradein/partnerSettings.ts'

describe('timeZoneExp', () => {
  test('Europe/Moscow', () => {
    const ts = 1716750960475 // new Date().getTime()
    const timeZone = 'Europe/Moscow'
    const uiDate = new Date(ts).toLocaleString('ru-RU', { timeZone })
    // NOTE: See also https://stackoverflow.com/a/54453990

    const tested = {
      ts,
      uiDate,
    }
    const expected = {
      ts: 1716750960475,
      uiDate: '2024-5-26 22:16:00', // NOTE: node@12.17.0
      // uiDate: '26.05.2024, 22:16:00', // NOTE: node@18.14.0
    }

    expect(tested).toEqual(expected)
  })
})
