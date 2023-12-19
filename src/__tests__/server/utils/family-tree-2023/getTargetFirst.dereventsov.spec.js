import { getTargetFirst } from '../../../../server/utils/family-tree/v2023/getTargetFirst'
// import { testTextByAnyWord } from '~/utils/string-ops'
import { testTextByAnyWord } from '../../../../server/utils/string-ops/testTextByAnyWord'

const nodes = [
  {
    id: 'leonty-egorovich-dereventsov[elena-f-f-f-f].[__-__-1820]',
    gender: 'male',
    parents: [],
    siblings: [],
    spouses: [
      {
        id: '_-_-dereventsova[elena-f-f-f-m].[__-__-18__]',
        type: 'married',
      },
    ],
    children: [
      {
        id: 'ivan-leonty-dereventsov[elena-f-f-f].[__-__-1875]',
        type: 'blood',
      },
    ],
  },
  {
    id: '_-_-dereventsova[elena-f-f-f-m].[__-__-18__]',
    gender: 'female',
    parents: [],
    siblings: [],
    spouses: [
      {
        id: 'leonty-egorovich-dereventsov[elena-f-f-f-f].[__-__-1820]',
        type: 'married',
      },
    ],
    children: [
      {
        id: 'ivan-leonty-dereventsov[elena-f-f-f].[__-__-1875]',
        type: 'blood',
      },
    ],
  },

  {
    id: 'ivan-leonty-dereventsov[elena-f-f-f].[__-__-1875]',
    gender: 'male',
    parents: [
      {
        id: 'leonty-egorovich-dereventsov[elena-f-f-f-f].[__-__-1820]',
        type: 'blood',
      },
      {
        id: '_-_-dereventsova[elena-f-f-f-m].[__-__-18__]',
        type: 'blood',
      },
    ],
    siblings: [],
    spouses: [
      {
        id: 'marfa-stepan-dereventsova[elena-f-f-m].[__-__-1875]',
        type: 'married',
      },
    ],
    children: [
      {
        id: 'nikolay-ivan-dereventsov.[30-12-1909][__-__-1978]',
        type: 'blood',
      },
      {
        id: 'vasily-ivan-dereventsov[elena-f-fs].[10-08-1913][__-__-1984]',
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
      id: 'leonty-egorovich-dereventsov[elena-f-f-f-f].[__-__-1820]',
      gender: 'male',
      parents: [],
      siblings: [],
      spouses: [
        {
          id: '_-_-dereventsova[elena-f-f-f-m].[__-__-18__]',
          type: 'married',
        },
      ],
      children: [
        {
          id: 'ivan-leonty-dereventsov[elena-f-f-f].[__-__-1875]',
          type: 'blood',
        },
      ],
    })
    expect(tested[1]).toEqual({
      id: '_-_-dereventsova[elena-f-f-f-m].[__-__-18__]',
      gender: 'female',
      parents: [],
      siblings: [],
      spouses: [
        {
          id: 'leonty-egorovich-dereventsov[elena-f-f-f-f].[__-__-1820]',
          type: 'married',
        },
      ],
      children: [
        {
          id: 'ivan-leonty-dereventsov[elena-f-f-f].[__-__-1875]',
          type: 'blood',
        },
      ],
    })
    expect(tested[2]).toEqual({
      id: 'ivan-leonty-dereventsov[elena-f-f-f].[__-__-1875]',
      gender: 'male',
      parents: [
        {
          id: 'leonty-egorovich-dereventsov[elena-f-f-f-f].[__-__-1820]',
          type: 'blood',
        },
        {
          id: '_-_-dereventsova[elena-f-f-f-m].[__-__-18__]',
          type: 'blood',
        },
      ],
      siblings: [],
      spouses: [
        {
          id: 'marfa-stepan-dereventsova[elena-f-f-m].[__-__-1875]',
          type: 'married',
        },
      ],
      children: [
        {
          id: 'nikolay-ivan-dereventsov.[30-12-1909][__-__-1978]',
          type: 'blood',
        },
        {
          id: 'vasily-ivan-dereventsov[elena-f-fs].[10-08-1913][__-__-1984]',
          type: 'blood',
        },
      ],
    })
  })
})
