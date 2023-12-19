import { getTargetFirst } from '../../../../server/utils/family-tree/v2023/getTargetFirst'
// import { testTextByAnyWord } from '~/utils/string-ops'
import { testTextByAnyWord } from '../../../../server/utils/string-ops/testTextByAnyWord'

const nodes = [
  {
    id: 'unique0',
    gender: 'male',
    parents: [],
    children: [],
    siblings: [],
    spouses: [],
  },
  {
    id: 'unique1',
    gender: 'male',
    parents: [],
    children: [],
    siblings: [],
    spouses: [],
  },
  {
    id: 'unique2',
    gender: 'male',
    parents: [],
    children: [],
    siblings: [],
    spouses: [],
  },
  {
    id: 'unique3',
    gender: 'male',
    parents: [],
    children: [],
    siblings: [],
    spouses: [],
  },
]

describe('family-tree/utils/v2023', () => {
  test('getTargetFirst: target index 2 of 0-3', () => {
    const tested = getTargetFirst({
      target: 'unique2',
      nodes,
      validate: ({ id }) => testTextByAnyWord({ words: ['unique2'], text: id }),
    })

    expect(tested).toHaveLength(4)
    expect(tested[0]).toEqual({
      children: [],
      gender: 'male',
      id: 'unique2',
      parents: [],
      siblings: [],
      spouses: [],
    })
    expect(tested[1]).toEqual({
      children: [],
      gender: 'male',
      id: 'unique0',
      parents: [],
      siblings: [],
      spouses: [],
    })
    expect(tested[2]).toEqual({
      children: [],
      gender: 'male',
      id: 'unique1',
      parents: [],
      siblings: [],
      spouses: [],
    })
    expect(tested[3]).toEqual({
      children: [],
      gender: 'male',
      id: 'unique3',
      parents: [],
      siblings: [],
      spouses: [],
    })
  })
  test('getTargetFirst: target index 1 of 0-3', () => {
    const tested = getTargetFirst({
      target: 'unique1',
      nodes,
      validate: ({ id }) => testTextByAnyWord({ words: ['unique1'], text: id }),
    })

    expect(tested).toHaveLength(4)
    expect(tested[0]).toEqual({
      children: [],
      gender: 'male',
      id: 'unique1',
      parents: [],
      siblings: [],
      spouses: [],
    })
    expect(tested[1]).toEqual({
      children: [],
      gender: 'male',
      id: 'unique0',
      parents: [],
      siblings: [],
      spouses: [],
    })
    expect(tested[2]).toEqual({
      children: [],
      gender: 'male',
      id: 'unique2',
      parents: [],
      siblings: [],
      spouses: [],
    })
    expect(tested[3]).toEqual({
      children: [],
      gender: 'male',
      id: 'unique3',
      parents: [],
      siblings: [],
      spouses: [],
    })
  })

  test('getTargetFirst: target index 0 of 0-3', () => {
    const tested = getTargetFirst({
      target: 'unique0',
      nodes,
      validate: ({ id }) => testTextByAnyWord({ words: ['unique0'], text: id }),
    })

    expect(tested).toHaveLength(4)
    expect(tested[0]).toEqual({
      children: [],
      gender: 'male',
      id: 'unique0',
      parents: [],
      siblings: [],
      spouses: [],
    })
    expect(tested[1]).toEqual({
      children: [],
      gender: 'male',
      id: 'unique1',
      parents: [],
      siblings: [],
      spouses: [],
    })
    expect(tested[2]).toEqual({
      children: [],
      gender: 'male',
      id: 'unique2',
      parents: [],
      siblings: [],
      spouses: [],
    })
    expect(tested[3]).toEqual({
      children: [],
      gender: 'male',
      id: 'unique3',
      parents: [],
      siblings: [],
      spouses: [],
    })
  })
})
