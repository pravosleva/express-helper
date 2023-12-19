import { getTargetFirst } from '../../../../server/utils/family-tree/v2023/getTargetFirst'
// import { testTextByAnyWord } from '~/utils/string-ops'
import { testTextByAnyWord } from '../../../../server/utils/string-ops/testTextByAnyWord'

const nodes = [
  {
    id: 'leonty-egorievich-dereventsov[elena-f-f-f-f].[__-__-1___]',
    gender: 'male',
    parents: [],
    siblings: [],
    spouses: [
      {
        id: '_-_-dereventsova[elena-f-f-f-m].[__-__-1___]',
        type: 'married',
      },
    ],
    children: [
      {
        id: 'ivan-leonty-dereventsov[elena-f-f-f].[__-__-1___]',
        type: 'blood',
      },
    ],
  },
  {
    id: '_-_-dereventsova[elena-f-f-f-m].[__-__-1___]',
    gender: 'female',
    parents: [],
    siblings: [],
    spouses: [
      {
        id: 'leonty-egorievich-dereventsov[elena-f-f-f-f].[__-__-1___]',
        type: 'married',
      },
    ],
    children: [
      {
        id: 'ivan-leonty-dereventsov[elena-f-f-f].[__-__-1___]',
        type: 'blood',
      },
    ],
  },

  {
    id: 'ivan-leonty-dereventsov[elena-f-f-f].[__-__-1___]',
    gender: 'male',
    parents: [
      {
        id: 'leonty-egorievich-dereventsov[elena-f-f-f-f].[__-__-1___]',
        type: 'blood',
      },
      {
        id: '_-_-dereventsova[elena-f-f-f-m].[__-__-1___]',
        type: 'blood',
      },
    ],
    siblings: [],
    spouses: [
      {
        id: '_-_-dereventsova[elena-f-f-m].[__-__-1___]',
        type: 'married',
      },
    ],
    children: [
      {
        id: 'nikolay-ivan-dereventsov.[__-__-1909][__-__-1978]',
        type: 'blood',
      },
      {
        id: 'vasily-ivan-dereventsov[elena-f-fs].[__-__-19__][__-__-1984]',
        type: 'blood',
      },
    ],
  },
]

describe('family-tree/utils/v2023', () => {
  test('getTargetFirst: target:dereventsov', () => {
    const tested = getTargetFirst({
      target: 'unique2',
      nodes,
      validate: ({ id }) => testTextByAnyWord({ words: ['dereventsov'], text: id }),
    })

    expect(tested).toHaveLength(nodes.length)
    expect(tested[0]).toEqual({
      id: 'leonty-egorievich-dereventsov[elena-f-f-f-f].[__-__-1___]',
      gender: 'male',
      parents: [],
      siblings: [],
      spouses: [
        {
          id: '_-_-dereventsova[elena-f-f-f-m].[__-__-1___]',
          type: 'married',
        },
      ],
      children: [
        {
          id: 'ivan-leonty-dereventsov[elena-f-f-f].[__-__-1___]',
          type: 'blood',
        },
      ],
    })
    expect(tested[1]).toEqual({
      id: '_-_-dereventsova[elena-f-f-f-m].[__-__-1___]',
      gender: 'female',
      parents: [],
      siblings: [],
      spouses: [
        {
          id: 'leonty-egorievich-dereventsov[elena-f-f-f-f].[__-__-1___]',
          type: 'married',
        },
      ],
      children: [
        {
          id: 'ivan-leonty-dereventsov[elena-f-f-f].[__-__-1___]',
          type: 'blood',
        },
      ],
    })
    expect(tested[2]).toEqual({
      id: 'ivan-leonty-dereventsov[elena-f-f-f].[__-__-1___]',
      gender: 'male',
      parents: [
        {
          id: 'leonty-egorievich-dereventsov[elena-f-f-f-f].[__-__-1___]',
          type: 'blood',
        },
        {
          id: '_-_-dereventsova[elena-f-f-f-m].[__-__-1___]',
          type: 'blood',
        },
      ],
      siblings: [],
      spouses: [
        {
          id: '_-_-dereventsova[elena-f-f-m].[__-__-1___]',
          type: 'married',
        },
      ],
      children: [
        {
          id: 'nikolay-ivan-dereventsov.[__-__-1909][__-__-1978]',
          type: 'blood',
        },
        {
          id: 'vasily-ivan-dereventsov[elena-f-fs].[__-__-19__][__-__-1984]',
          type: 'blood',
        },
      ],
    })
  })
})
