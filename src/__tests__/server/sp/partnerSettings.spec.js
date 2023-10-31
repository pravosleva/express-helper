/* eslint-disable jest/no-disabled-tests */
import { partnerSettings } from '../../../server/routers/smartprice/utils/offline-tradein/partnerSettings.ts'

describe('partnerSettings', () => {
  test('tst case OK', () => {
    const tested = {
      x: 1,
    }
    const expected = {
      x: 1,
    }

    expect(tested).toEqual(expected)
  })

  test('OK (!exists): Unknown case (is valid by default)', () => {
    const testedSettings = {
      // t_offline_buyout_sms: true,
      partner_is_sberlike: false,
      t_require_iin: false,
    }
    const testedAnalysis = partnerSettings.getAnalysis({ namespace: '???', testedSettings })
    const expectedAnalysis = {
      message: 'Нет причин не доверять',
      namespace: '???',
      ok: true,
    }

    expect(testedAnalysis).toEqual(expectedAnalysis)
  })

  test('OK (exists): Add unnecessary prop:false', () => {
    const testedSettings = {
      _unnecessary: false,
      partner_is_sberlike: false,
      t_require_iin: false,
    }
    const testedAnalysis = partnerSettings.getAnalysis({ namespace: 'mtsmain2023', testedSettings })
    const expectedAnalysis = {
      expected: {
        partner_is_sberlike: false,
        t_require_iin: false,
      },
      message: 'Есть с чем сравнить переданный объект',
      namespace: 'mtsmain2023',
      ok: true,
    }

    expect(testedAnalysis).toEqual(expectedAnalysis)
  })

  test('OK (exists): Add unnecessary prop:true', () => {
    const testedSettings = {
      _unnecessary: true,
      partner_is_sberlike: false,
      t_require_iin: false,
    }
    const testedAnalysis = partnerSettings.getAnalysis({ namespace: 'mtsmain2023', testedSettings })
    const expectedAnalysis = {
      expected: {
        partner_is_sberlike: false,
        t_require_iin: false,
      },
      message: 'Есть с чем сравнить переданный объект',
      namespace: 'mtsmain2023',
      ok: true,
    }

    expect(testedAnalysis).toEqual(expectedAnalysis)
  })

  test('OK (exists): getAnalysis #1', () => {
    const testedSettings = {
      // t_offline_buyout_sms: true,
      partner_is_sberlike: false,
      t_require_iin: false,
    }
    const testedAnalysis = partnerSettings.getAnalysis({ namespace: 'mtsmain2023', testedSettings })
    const expectedAnalysis = {
      expected: {
        partner_is_sberlike: false,
        t_require_iin: false,
      },
      message: 'Есть с чем сравнить переданный объект',
      namespace: 'mtsmain2023',
      ok: true,
    }

    expect(testedAnalysis).toEqual(expectedAnalysis)
  })

  test('!OK (exists): getAnalysis #2', () => {
    const testedSettings = {
      // t_offline_buyout_sms: true,
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
        t_require_iin: false,
      },
      message: 'В результате сравнения переданного объекта нашлись несоответствия',
      namespace: 'mtsmain2023',
      ok: false,
    }

    expect(testedAnalysis).toEqual(expectedAnalysis)
  })

  test('!OK (exists): getAnalysis #3 (no prop:false)', () => {
    const testedSettings = {
      // t_offline_buyout_sms: false,
      // partner_is_sberlike: false,
      t_require_iin: false,
    }
    const testedAnalysis = partnerSettings.getAnalysis({ namespace: 'mtsmain2023', testedSettings })
    const expectedAnalysis = {
      diffs: {
        partner_is_sberlike: '⚡ undefined (undefined)',
      },
      expected: {
        partner_is_sberlike: false,
        t_require_iin: false,
      },
      message: 'В результате сравнения переданного объекта нашлись несоответствия',
      namespace: 'mtsmain2023',
      ok: false,
    }

    expect(testedAnalysis).toEqual(expectedAnalysis)
  })

  test('!OK (exists): getAnalysis #3 (no prop:true)', () => {
    const testedSettings = {
      disabled: false,
    }
    const testedAnalysis = partnerSettings.getAnalysis({ namespace: 'tstSample', testedSettings })
    const expectedAnalysis = {
      diffs: {
        enabled: '⚡ undefined (undefined)',
      },
      expected: {
        enabled: true,
        disabled: false,
      },
      message: 'В результате сравнения переданного объекта нашлись несоответствия',
      namespace: 'tstSample',
      ok: false,
    }

    expect(testedAnalysis).toEqual(expectedAnalysis)
  })
})
