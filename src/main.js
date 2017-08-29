const Game = require('./core/game')
const { Bing, Pao, Che, Ma, Xiang, Shi, Shuai } = require('./core/chess')
const ChessboardInterface = require('./interface/chessboardInterface')
const { Black, Red } = require('./core/color')
const $ = require("jquery")

//'4kr3/9/5c3/5R3/9/4C4/9/9/6n2/5K3 w'
const game = new Game('3k5/7R1/9/5P/6b2/7p1/52n1/9/4A4/4KA3 w')

// game.setToOriginal()

window.onload = () => {
  const chessboardInterface = new ChessboardInterface(game, 15, 15, 71, 71)
  let strangeNum = 0
  $("#strange").click(() => {
    localStorage.setItem("strangeNum" + strangeNum, chessboardInterface.game.fen())
  })

  $("#cancel").click(() => {
    localStorage.removeItem("strangeNum" + strangeNum--)
  })
}