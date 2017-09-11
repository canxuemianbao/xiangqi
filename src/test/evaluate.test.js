const Pos = require('../core/position')
const { Move, IntToChar } = require('../core/util')

const {
  evalWhite,
  evalBlack,
  evalWhiteMove,
  evalBlackMove
} = require('../core/evaluate')

let pos = new Pos()

console.assert(evalBlack(pos) === evalWhite(pos))
console.assert(evalWhiteMove(pos) === evalBlackMove(pos))
