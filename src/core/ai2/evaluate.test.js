const Pos = require('./position')
const { Move, IntToChar } = require('./util')

const {
  evalWhite,
  evalBlack,
  evalWhiteMove,
  evalBlackMove
} = require('./evaluate')

let pos = new Pos()
pos.setToOriginal()

console.assert(evalBlack(pos) === evalWhite(pos))
console.assert(evalWhiteMove(pos) === evalBlackMove(pos))

pos.makeMove(new Move(155,139))

console.log(evalWhite(pos) - evalBlack(pos))
