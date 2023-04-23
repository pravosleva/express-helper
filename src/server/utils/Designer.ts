// import ConditionTypes from '~/utils/condition_types';

const baseTool = {
  alpha: function alpha(a: string, b: string) {
    // NOTE: v1
    // a = a.toUpperCase();
    // b = b.toUpperCase();
    // return a < b ? -1 : a > b ? 1 : 0;
    
    // NOTE v2: localeCompare
    // const abSort = (a: string, b: string) => a.localeCompare(b)
    return a.localeCompare(b)
  },
  number: function number(a: any, b: any) {
    const _a = parseFloat(a);
    const _b = parseFloat(b);
    return _a - _b;
  },
};

function* iteratorGenerator(arr: any[]) {
  for (let i = 0; i < arr.length; i++) {
    yield arr[i];
  }
}

export class Designer {
  getABSorted(arr: any[]): any[] {
    try {
      const sorted = arr.sort((e1, e2) => baseTool.alpha(e1[0], e2[0]));

      return sorted;
    } catch (err) {
      console.log(err);
      return arr;
    }
  }
  // constructor() {}
  getSortedMemorylist(arr: any[]): any[] {
    try {
      const sorted = arr.sort((e1, e2) =>
        baseTool.number(e1.split(' ')[0], e2.split(' ')[0])
        
      );

      return sorted;
    } catch (err) {
      console.log(err);
      return arr;
    }
  }

  abSortObjectsByFieldName({ arr, targetFieldName }: { arr: any[], targetFieldName: string }): any[] {
    try {
      const sorted = arr.sort((e1, e2) => baseTool.alpha(e1[targetFieldName], e2[targetFieldName]))

      return sorted;
    } catch (err) {
      // console.log(err);
      return arr;
    }
  }

  // NOTE: For strings[]
  static sortByTopAndBottomTemplates({ arr, topTemplate, bottomTemplate = [] }: { arr: any[], topTemplate: string[], bottomTemplate?: string[] }) {
    const iterator = iteratorGenerator(arr);
    let currentItem = iterator.next();
    const resultTop = [];
    const resultMiddle = [];
    const resultBottom = [];

    while (!currentItem.done) {
      // console.log(currentItem.value);
      if (topTemplate.includes(currentItem.value)) {
        resultTop.unshift(currentItem.value);
      } else if (bottomTemplate.includes(currentItem.value)) {
        resultBottom.push(currentItem.value);
      } else {
        resultMiddle.push(currentItem.value);
      }
      currentItem = iterator.next();
    }

    return [
      ...resultTop.sort(
        (e1, e2) => topTemplate.indexOf(e1) - topTemplate.indexOf(e2)
      ),
      ...resultMiddle,
      ...resultBottom.sort(
        (e1, e2) => bottomTemplate.indexOf(e1) - bottomTemplate.indexOf(e2)
      ),
    ];
  }

  // NOTE: For { [targetFieldName]: string; baseDiscount: number }[]
  sortObjectsByTopAndBottomTemplates({
    arr,
    topTemplate,
    bottomTemplate = [],
    targetFieldName,
  }: {
    arr: any[]
    topTemplate: string[]
    bottomTemplate?: string[]
    targetFieldName: string
  }) {
    const iterator = iteratorGenerator(arr);
    let currentItem = iterator.next();
    const resultTop = [];
    const resultMiddle = [];
    const resultBottom = [];

    // NOTE: Add to end of array: resultTop.unshift(currentItem.value);
    while (!currentItem.done) {
      if (topTemplate.includes(currentItem.value[targetFieldName]))
        resultTop.push(currentItem.value)
      else if (bottomTemplate.includes(currentItem.value[targetFieldName]))
        resultBottom.push(currentItem.value)
      else
        resultMiddle.push(currentItem.value)

      currentItem = iterator.next();
    }

    return [
      ...resultTop.sort(
        (e1, e2) => topTemplate.indexOf(e1) - topTemplate.indexOf(e2)
      ),
      ...resultMiddle,
      ...resultBottom.sort(
        (e1, e2) => bottomTemplate.indexOf(e1) - bottomTemplate.indexOf(e2)
      ),
    ];
  }
}
