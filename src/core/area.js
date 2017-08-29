const {Red,Black} = require('./color')

const area=(function getArea() {
  function generateArea(rowStart, rowEnd, columnStart, columnEnd) {
    const area = []
    for (let i = rowStart; i < rowEnd; i++) {
      for (let j = columnStart; j < columnEnd; j++) {
        if (!area[i]) {
          area[i] = []
        }
        area[i][j] = true
      }
    }
    return area
  }

  const wholeArea = generateArea(0, 10, 0, 9)
  const redArea=generateArea(5, 10, 0, 9)
  const blackArea=generateArea(0, 5, 0, 9)
  const redNineArea=generateArea(7, 10, 3, 6)
  const blackNineArea=generateArea(0, 3, 3, 6)
  
  const myArea = (color) => {
    return color === Red?redArea:blackArea
  }

  const myNineArea = (color) => {
    return color === Red?redNineArea:blackNineArea
  }

  return {
    wholeArea,
    myArea,
    myNineArea
  }
})()

module.exports=area
