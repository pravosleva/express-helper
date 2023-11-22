/* eslint-disable jest/no-disabled-tests */
import { mutateObject } from '../../../server/utils/mutateObject.ts'

describe('mutateObject', () => {
  test('lvl 1', () => {
    const target = {
      id: 0,
      phone: {
        a: 1,
      },
    }
    const tested = mutateObject({ target, source: { phone: null } })
    const expected = {
      id: 0,
      phone: null,
    }

    expect(tested).toEqual(expected)
  })

  test('lvl 2', () => {
    const target = {
      id: 0,
      phone: {
        color: '',
      },
    }
    const tested = mutateObject({ target, source: { phone: { color: 'red' } } })
    const expected = {
      id: 0,
      phone: { color: 'red' },
    }

    expect(tested).toEqual(expected)
  })

  test('lvl 2 (replace one field)', () => {
    const target = {
      id: 0,
      phone: {
        color: 'red',
        memory: '',
      },
    }
    const tested = mutateObject({ target, source: { phone: { memory: '512 GB' } } })
    const expected = {
      id: 0,
      phone: {
        color: 'red',
        memory: '512 GB',
      },
    }

    expect(tested).toEqual(expected)
  })

  test('lvl 2 (replace to null)', () => {
    const target = {
      id: 0,
      phone: {
        color: 'red',
        memory: '',
      },
    }
    const tested = mutateObject({ target, source: { phone: { memory: null } } })
    const expected = {
      id: 0,
      phone: {
        color: 'red',
        memory: null,
      },
    }

    expect(tested).toEqual(expected)
  })

  test('lvl 3 (arrs concat)', () => {
    const target = {
      id: 0,
      phone: {
        color: 'red',
        memory: '',
        memory_choices: ['1 GB'],
      },
    }
    const tested = mutateObject({
      target,
      source: {
        phone: {
          memory_choices: ['128 GB', '512 GB'],
        },
      },
    })
    const expected = {
      id: 0,
      phone: {
        color: 'red',
        memory: '',
        memory_choices: ['1 GB', '128 GB', '512 GB'],
      },
    }

    expect(tested).toEqual(expected)
  })

  test('lvl 3 (arr replaced to null)', () => {
    const target = {
      id: 0,
      phone: {
        color: 'red',
        memory: '',
        memory_choices: ['1 GB'],
      },
    }
    const tested = mutateObject({
      target,
      source: {
        phone: {
          memory_choices: null,
        },
      },
    })
    const expected = {
      id: 0,
      phone: {
        color: 'red',
        memory: '',
        memory_choices: null,
      },
    }

    expect(tested).toEqual(expected)
  })

  test('lvl 1 + lvl 2 + lvl 3 (arrs concat)', () => {
    const target = {
      id: 0,
      phone: {
        color: 'red',
        memory: '',
        memory_choices: ['1 GB'],
      },
    }
    const tested = mutateObject({
      target,
      source: {
        id: 1,
        phone: {
          memory: '512 GB',
          memory_choices: ['128 GB', '512 GB'],
        },
      },
    })
    const expected = {
      id: 1,
      phone: {
        color: 'red',
        memory: '512 GB',
        memory_choices: ['1 GB', '128 GB', '512 GB'],
      },
    }

    expect(tested).toEqual(expected)
  })
})
