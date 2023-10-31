/* eslint-disable jest/no-disabled-tests */
import { partnerSettings } from '../../../server/routers/smartprice/utils/offline-tradein/partnerSettings.ts'

describe('partnerSettings', () => {
  test('case OK', () => {
    const tested = {
      x: 1,
    }
    const expected = {
      x: 1,
    }

    expect(tested).toEqual(expected)
  })

  test('getAnalysis OK', () => {
    const testedSettings = {
      t_offline_buyout_sms: false,
      partner_is_sberlike: false,
      t_require_iin: false,
    }
    const testedAnalysis = partnerSettings.getAnalysis({ namespace: 'mtsmain2023', testedSettings })
    const expectedAnalysis = {
      expected: {
        partner_is_sberlike: false,
        t_offline_buyout_sms: false,
        t_require_iin: false,
      },
      message: 'Есть с чем сравнить переданный объект',
      namespace: 'mtsmain2023',
      ok: true,
    }

    expect(testedAnalysis).toEqual(expectedAnalysis)
  })

  test('getAnalysis NOT OK', () => {
    const testedSettings = {
      t_offline_buyout_sms: false,
      partner_is_sberlike: true,
      t_require_iin: false,
    }
    const testedAnalysis = partnerSettings.getAnalysis({ namespace: 'mtsmain2023', testedSettings })
    const expectedAnalysis = {
      diffs: {
        partner_is_sberlike: true,
      },
      expected: {
        partner_is_sberlike: false,
        t_offline_buyout_sms: false,
        t_require_iin: false,
      },
      message: 'В результате сравнения переданного объекта нашлись несоответствия',
      namespace: 'mtsmain2023',
      ok: false,
    }

    expect(testedAnalysis).toEqual(expectedAnalysis)
  })
})
