const { hasProtocol, hasWWW } = require('./validator')

test('Has protocol fn test', () => {
  expect(hasProtocol('uremont.com')).toBe(false)
  expect(hasProtocol('http://uremont.com')).toBe(true)
  expect(hasProtocol('https://uremont.com')).toBe(true)
})

test('Has www fn test', () => {
  expect(hasWWW('www.uremont.com')).toBe(true)
  expect(hasWWW('http://uremont.com')).toBe(false)
  expect(hasWWW('http://www.uremont.com')).toBe(true)
  expect(hasWWW('uremont.com')).toBe(false)
})
