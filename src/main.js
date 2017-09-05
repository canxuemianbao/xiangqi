const Game = require('./core/game')
const { Bing, Pao, Che, Ma, Xiang, Shi, Shuai } = require('./core/chess')
const ChessboardInterface = require('./interface/chessboardInterface')
const { Black, Red } = require('./core/color')
const $ = require("jquery")

//'4kr3/9/5c3/5R3/9/4C4/9/9/6n2/5K3 w'
const game = new Game('4ka3/9/2N1b4/9/4r4/3R2B2/9/4B4/4A4/3AK4 b')

// game.setToOriginal()

window.onload = () => {
  const chessboardInterface = new ChessboardInterface(game, 1, 15, 15, 71, 71)
  let strangeNum = 0
}