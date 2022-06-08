import { percentFormat } from "./text";

export const percentRank = (arr: number[], v: number) => {
  for (var i = 0, l = arr.length; i < l; i++) {
    if (v <= arr[i]) {
      while (i < l && v === arr[i]) i++;
      if (i === 0) return 0;
      if (v !== arr[i - 1]) {
        i += (v - arr[i - 1]) / (arr[i] - arr[i - 1]);
      }
      return i / l;
    }
  }
  return 1;
};

export function getBin(num: number, binSize: number) {
  return percentFormat(binSize * Math.ceil(num / binSize));
}

export function assignBins(arr: number[], binSize: number) {
  return arr
    .map((num) => getBin(num, binSize))
    .reduce((obj: Record<string, number>, value) => {
      if (value in obj) {
        obj[value] += 1;
      } else {
        obj[value] = 1;
      }
      return obj;
    }, {});
}

export function getAverage(arr: number[]) {
  return arr.reduce((sum, score) => (sum += score), 0) / arr.length;
}
