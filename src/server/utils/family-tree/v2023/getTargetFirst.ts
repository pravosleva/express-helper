enum EGender {
  male = 'male',
  female = 'female'
}
enum ERelType {
  blood = 'blood',
  married = 'married',
  divorced = 'divorced',
  adopted = 'adopted',
  half = 'half'
}
type TRelation = Readonly<{
  id: string;
  type: ERelType;
}>
export type TNode = Readonly<{
  id: string;
  gender: EGender;
  parents: readonly TRelation[];
  children: readonly TRelation[];
  siblings: readonly TRelation[];
  spouses: readonly TRelation[];
  placeholder?: boolean;
}>
// export declare type TExtNode = TNode & Readonly<{
//   top: number;
//   left: number;
//   hasSubTree: boolean;
// }>

export const getTargetFirst = ({ nodes, target, validate }: {
  nodes: TNode[];
  target?: string;
  validate: (node: TNode) => boolean;
}): TNode[] => {
  if (!target) return nodes
  else {
    const firstElmIndex = nodes.findIndex(validate)

    if (firstElmIndex === -1) return nodes
    else {
      if (firstElmIndex === 0) return nodes
      else if (firstElmIndex === nodes.length - 1) {
        return [nodes[firstElmIndex], ...nodes.slice(0, firstElmIndex)]
      }
      else return [nodes[firstElmIndex], ...nodes.slice(0, firstElmIndex), ...nodes.slice(firstElmIndex + 1)]

      // return [nodes[firstElmIndex], ...nodes.slice(firstElmIndex, nodes.length - 1)]
    }
  }
}
