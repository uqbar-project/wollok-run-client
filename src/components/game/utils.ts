
export type Cell = {
  img: string;
  message?: any;
}

export type Board = Cell[][][]  // y, x, actors
export type Layer = Cell[][]    // y, x

export const boardToLayers = (board: Board): Layer[] => {
  return zipLongest(...board.map(line => zipLongest(...line)))
}

const zipLongest = <T>(...list: T[][]) => {
  const arrs = list.splice(0)

  const longest = arrs.reduce(function (a, b) {
    return a.length > b.length ? a : b
  })

  return returnMap(longest, arrs)
}


function returnMap <T>(shortest: T[], arrs: T[][]) {
  return shortest.map(function (_item, i) {
    return arrs.map(function (arr) {
      return arr[i]
    })
  })
}