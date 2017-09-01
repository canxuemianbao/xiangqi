const Pos = require('./position')
const { Move, IntToChar } = require('./util')

const {
  evalWhite,
  evalBlack,
  evalWhiteMove,
  evalBlackMove
} = require('./evaluate')

let pos = new Pos()

console.assert(evalBlack(pos) === evalWhite(pos))
console.assert(evalWhiteMove(pos) === evalBlackMove(pos))
