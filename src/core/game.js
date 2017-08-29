const { Black, Red } = require('./color')
const { Shuai, generateChess } = require('./chess')
const { ComradeError, FinishError, NotYourRoundError } = require('./error')
// const { State, search } = require("./ai/main")
const { search, Pos, MinMax, drawValue, banValue } = require('./ai2/main')


class Game extends Pos {
  constructor(fen = 'rnbakabnr/9/1c5c1/p1p1p1p1p/9/9/P1P1P1P1P/1C5C1/9/RNBAKABNR w') {
    super(fen)
    this.fenStack = [this.toFen()]
  }

  //返回一个move
  search() {
    return search(this.pos())
  }

  pos() {
    const pos = new Pos(this.toFen())
    // pos.zobristStack = this.zobristStack.map(_ => _)
    // pos.checkStack = this.checkStack.map(_ => _)
    // pos.moveStack = this.moveStack.map(_ => _)
    return pos
  }

  getLegalMove(from, to) {
    return this.generateMoves().find((move) => move.from === from && move.to === to)
  }

  isCheckmated() {
    return MinMax(this.pos()) == null
  }

  isChecking() {
    this.makeEmptyMove()
    const isChecking = this.isCheck()
    this.unMakeEmptyMove()
    return isChecking
  }
}

module.exports = Game