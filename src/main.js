const Game = require('./core/game')
const { Move } = require('./core/ai2/util')
const ChessboardInterface = require('./interface/chessboardInterface')
const $ = require("jquery")

//'4kr3/9/5c3/5R3/9/4C4/9/9/6n2/5K3 w'
const game = new Game()
// game.setToOriginal()

window.onload = () => {
  const chessboardInterface = new ChessboardInterface(game, 0, 15, 15, 71, 71)
  let strangeNum = 0
}