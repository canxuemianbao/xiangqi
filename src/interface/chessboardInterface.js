const { ComradeError, FinishError, NotYourRoundError } = require('../core/error')
const Game = require('../core/game')
const { CharToInt } = require('../core/ai2/util')
const { banValue, drawValue } = require('../core/ai2/evaluate')
const _ = require('lodash')
const $ = require("jquery")

class ChessboardInterface {
  constructor(game = new Game(), playSide = 0, startWidth, startHeight, gapWidth, gapHeight) {
    this.coordinates = []
    this.chesses = []
    this.game = game
    this.playSide = playSide
    this.selectedChess = null
    this.constructChessboard(startWidth, startHeight, gapWidth, gapHeight)
    this.constructChesses()
    this.fenToBoard()
    this.considerMove()

    $("#strange").click(() => {
      
    })

    $("#back").click(() => {
      if (this.game.side === this.playSide) {
        if (this.game.zobristStack.length >= 2) {
          this.game.unMakeMove()
          this.game.unMakeMove()
          this.fenToBoard()
        }
      } else {
        if (this.game.zobristStack.length >= 1) {
          this.game.unMakeMove()
          this.fenToBoard()
        }
      }
    })
  }

  considerMove() {
    if (this.game.isCheckmated()) {
      alert(`${this.game.side === this.playSide ? '你输了' : '你赢了'}`)
      return
    }

    const repValue = this.game.repValue()

    if (repValue === banValue) {
      if (this.playSide === this.game.side) {
        alert('你赢了')
      } else {
        alert('你输了')
      }
      return
    } else if (repValue === -banValue) {
      if (this.playSide === this.game.side) {
        alert('你输了')
      } else {
        alert('你赢了')
      }
      return
    } else if (repValue === drawValue) {
      alert('和棋')
      return
    }

    if (this.game.side !== this.playSide) {
      return this.moveChess(this.game.search())
    } else {
      const self = this
      for (let i = 0; i < 16; i++) {
        const chessDom = document.getElementById(`chess_${i + this.game.sideTag}`)
        if (chessDom) {
          chessDom.onclick = function (ev) {
            if (self.selectedChess) {
              self.getCoordinate(self.selectedChess.pos).classList.remove('selected')
            }
            self.selectedChess = chessDom
            self.getCoordinate(this.pos).classList.add('selected')
            ev.stopPropagation()
          }
        }
      }
      this.coordinates.forEach((coordinate) => {
        coordinate.onclick = function (ev) {
          if (self.selectedChess) {
            const move = self.game.getLegalMove(self.selectedChess.pos, this.pos)
            if (move) {
              this.onclick = null
              self.getCoordinate(self.selectedChess.pos).classList.remove('selected')
              self.chesses.forEach((chess) => chess.onclick = null)
              return self.moveChess(move)
            }
          }
        }
      })
    }
  }

  moveChess(move) {
    this.game.makeMove(move)
    this.fenToBoard()
    if (this.game.isChecking()) {
      alert('将军')
    }
    setTimeout(this.considerMove.bind(this), 500)
  }

  constructChessboard(startWidth, startHeight, gapWidth, gapHeight) {
    const column = 9, row = 10

    for (let i = 3; i <= 3 + row; i++) {
      for (let j = 3; j <= 3 + column; j++) {
        const coordinate = document.createElement('div')
        coordinate.className = `coordinate coordinate_${i - 3}_${j - 3}`
        coordinate.style.position = 'absolute'
        coordinate.style.top = startHeight + (i - 3) * gapHeight
        coordinate.style.left = startWidth + (j - 3) * gapWidth
        coordinate.style.width = gapWidth
        coordinate.style.height = gapHeight

        coordinate.pos = (i << 4) + j

        document.getElementById('chessboard-container').appendChild(coordinate)
        const tmpAppendChild = coordinate.appendChild
        coordinate.appendChild = (child) => {
          coordinate.innerHTML = ''
          tmpAppendChild.call(coordinate, child)
        }

        this.coordinates.push(coordinate)
      }
    }
  }

  constructChesses() {
    const chessDoms = []
    for (let i = 16; i < 48; i++) {
      const chessDom = document.createElement('div')
      this.chesses.push(chessDom)
      chessDom.id = `chess_${i}`
      if (i < 32) {
        chessDom.side = 0
      } else {
        chessDom.side = 1
      }
      chessDom.className = 'chess'
    }
  }

  getCoordinate(pos) {
    return this.coordinates.find((coordinate) => coordinate.pos == pos)
  }

  getChess({ id, pos }) {
    if (id) {
      return this.chesses.find((chess) => chess.id == `chess_${id}`)
    } else if (pos) {
      return this.chesses.find((chess) => chess.pos == pos)
    }
  }

  fenToBoard() {
    const fen = this.game.toFen()

    const pc = {}

    const fenInfo = fen.split(' ')

    const addPiece = (chessId, row, column) => {
      const pos = (row << 4) + column
      this.getCoordinate(pos).appendChild(this.getChess({ id: chessId }))
      this.getChess({ id: chessId }).pos = pos
    }

    let row = 3
    let column = 3

    Array.from(fenInfo[0]).forEach((fenChar) => {
      if (fenChar === '/') {
        row++
        column = 3
      } else if (!isNaN(Number(fenChar))) {
        column += parseInt(fenChar)
      } else {
        let piece = CharToInt(fenChar)
        if (pc[piece] === undefined) {
          pc[piece] = 0
        }

        addPiece(pc[piece] + piece, row, column)

        column++
        pc[piece]++
      }
    })

    if (this.game.moveStack.length >= 1) {
      const lastMove = this.game.moveStack[this.game.moveStack.length - 1]
      this.getCoordinate(lastMove.from).classList.add('lastSelected')
      this.getCoordinate(lastMove.to).classList.add('lastSelecting')

      if (this.game.moveStack.length >= 2) {
        const lastLastMove = this.game.moveStack[this.game.moveStack.length - 2]
        this.getCoordinate(lastLastMove.from).classList.remove('lastSelected')
        this.getCoordinate(lastLastMove.to).classList.remove('lastSelecting')
      }
    } else {
      this.coordinates.forEach((coordinate)=>{
        coordinate.classList.remove('lastSelected')
        coordinate.classList.remove('lastSelecting')
      })
    }
  }
}

module.exports = ChessboardInterface