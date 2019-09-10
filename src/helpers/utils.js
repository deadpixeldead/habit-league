export function unique (targetArray, prop) {
  return targetArray.filter((obj, pos, arr) => {
    return arr.map(mapObj => mapObj[prop]).indexOf(obj[prop]) === pos
  })
}

export function sort (arrayToSort, prop) {
  function compare (a, b) {
    if (a[prop] > b[prop]) {
      return -1
    }
    if (a[prop] < b[prop]) {
      return 1
    }
    return 0
  }
  return arrayToSort.sort(compare)
}