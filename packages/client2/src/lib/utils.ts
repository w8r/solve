export const splitPairs = (arr: string[]) => {
  const pairs: string[][] = [];
  for (var i = 0; i < arr.length; i += 2) {
    if (arr[i + 1] !== undefined) {
      pairs.push([arr[i], arr[i + 1]]);
    } else {
      pairs.push([arr[i - 1], arr[i]]);
    }
  }
  return pairs;
};
