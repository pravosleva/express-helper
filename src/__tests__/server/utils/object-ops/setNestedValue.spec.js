const { setNestedValue } = require('../../../../server/utils/object-ops/setNestedValue')

describe('setNestedValue', () => {
  test('case 1', () => {
    const myObject = {
      user: {
        name: 'Alice',
        address: {
          city: 'New York',
        },
      },
    }
    setNestedValue(myObject, 'user.address.city', 'San Francisco')

    expect(myObject).toEqual({
      user: {
        name: 'Alice',
        address: {
          city: 'San Francisco',
        },
      },
    })
  })

  test('case 2', () => {
    const myObject = {
      user: {
        name: 'Alice',
        address: {
          city: 'New York',
        },
      },
    }
    setNestedValue(myObject, 'user.address.city', null)

    expect(myObject).toEqual({
      user: {
        name: 'Alice',
        address: {
          city: null,
        },
      },
    })
  })

  // test.skip('capitalCase', () => {
  //   const tested = changeCase.capitalCase('enter-imei')
  //   const expected = 'Enter Imei'
  //   expect(tested).toEqual(expected)
  // })
})
