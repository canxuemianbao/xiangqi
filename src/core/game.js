const { Black, Red } = require('./color')
const { Shuai, generateChess } = require('./chess')
const { ComradeError, FinishError, NotYourRoundError } = require('./error')
// const { State, search } = require("./ai/main")
const { search, Pos, MinMax, drawValue, banValue } = require('./ai2/main')


class Game extends Pos {
  constructor(fen = 'rnbakabnr/9/1c5c1/p1p1p1p1p/9/9/P1P1P1P1P/1C5C1/9/RNBAKABNR w', moveStack = []) {
    super(fen, moveStack)
    this.intialFen = fen
  }

  //返回一个move
  search() {
    return search(this.pos())
  }

  record() {
    return [this.intialFen, ...this.moveStack]
  }

  restore(fen, moveStack) {
    return new Game(fen, moveStack)
  }

  pos() {
    const pos = new Pos(this.intialFen, this.moveStack)
    return pos
  }

  isCheckmated() {
    return MinMax(this.pos()) == null
  }
}

module.exports = Game