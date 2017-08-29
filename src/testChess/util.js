const {Bing,Shuai,Chess} = require('../core/chess')
const {Black,Red}=require('../core/color')
// const area=require('../area')

function random(testParamsFunc, sum) {
  return Array.from(Array(sum).keys()).map(() => testParamsFunc())
}

function randomArea(area){
  const rowLength=area.length
  const columnLength=area.find((value,row)=>area[row]).length

  const row=Math.floor(Math.random()*(rowLength))
  const column=Math.floor(Math.random()*(columnLength))

  return area[row]&&area[row][column]&&[row,column]||randomArea(area)
}

function randomBing(area){
  const [randomRow1,randomColumn1]=random(area)

  const bing1=new Bing('bing1',randomRow1,randomColumn1,Math.random()>=0.5?Black:Red)

  const [randomRow2,randomColumn2]=random(area)

  const chess=new Chess('chess',randomRow2,randomColumn2,Math.random()>=0.5?Black:Red)

  return [bing1,chess]  
}

module.exports={
  random,
  randomArea,
  randomBing
}