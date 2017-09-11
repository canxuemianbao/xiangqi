const { ComputerThinkTimer, MinMax, checkmatedValue } = require('./search')

function search(pos) {
  const resultMove = ComputerThinkTimer(pos,1000)

  return resultMove
}

module.exports = {
  search,
  MinMax: require('./search').MinMax,
  Pos: require('./position'),
  Move: require('./util').Move,
  drawValue: require('./evaluate').drawValue,
  banValue: require('./evaluate').banValue
}