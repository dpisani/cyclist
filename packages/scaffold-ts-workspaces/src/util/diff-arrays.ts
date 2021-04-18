import deepEqual = require('deep-equal');

interface ArrayDiff<T> {
  leftAdditions: T[];
  rightAdditions: T[];
}

// Performs an order-independent comparison between two arrays and finds the items that are not shared between them.
// Uses deepEqual to compare.
export const diffArrays = <T>(left: T[], right: T[]): ArrayDiff<T> => {
  const matchedItems = new Set<T>();

  for (const leftItem of left) {
    for (const rightItem of right) {
      if (deepEqual(leftItem, rightItem)) {
        matchedItems.add(leftItem);
        matchedItems.add(rightItem);
        break;
      }
    }
  }

  return {
    leftAdditions: left.filter(item => !matchedItems.has(item)),
    rightAdditions: right.filter(item => !matchedItems.has(item)),
  };
};
