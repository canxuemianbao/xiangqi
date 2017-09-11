
const toastr = require('toastr')

const Pos = require('./core/position')
const { ComputerThinkTimer, MinMax } = require('./core/search')
const { banValue, drawValue, winValue } = require('./core/evaluate')

const initialFen = 'rnbakabnr/9/1c5c1/p1p1p1p1p/9/9/P1P1P1P1P/1C5C1/9/RNBAKABNR w'

const [pos, playerSide] = ((fen = initialFen, playerSide = 0) => [new Pos(fen), playerSide])()

const chesses = {}
const coordinates = {}

let finish = false
let playerTurn = pos.side === playerSide

function canMove(move) {
  //1. 已经结束了
  if (finish) {
    return false
  }

  const repValue = pos.repValue()

  //2. 产生了结果（输，赢或者和棋）
  if (repValue) {
    return false
  }

  //3. move不合理
  if (pos.getLegalMove(move.from, move.to) == null) {
    return false
  }

  //4. 这么走会被将军
  if (!pos.makeMove(pos.getLegalMove(move.from, move.to))) {
    return false
  } else {
    pos.unMakeMove()
  }

  return true
}

function playerMove(move) {
  //1. 如果不是玩家回合
  if (!playerTurn) {
    return
  }

  //2. 不是一个合理的走法
  if (!canMove(move)) {
    unSelectTo()
    return
  }

  pos.makeMove(pos.getLegalMove(move.from, move.to))

  display().then(computerConsider)
}

function computerMove(move) {
  //1. 如果不是电脑回合
  if (playerTurn) {
    return
  }

  //2. 不是一个合理的走法
  if (!canMove(move)) {
    return
  }

  pos.makeMove(move)

  display().then(playerConsider)
}

function display() {
  unSelect()

  //1. 判断是否将军
  if (pos.isChecked()) {
    toastr.warning("将军")
  }

  //2 判断是否结束了

  //2.1 将死了
  if (MinMax(pos) == null) {
    if (pos.side === playerSide) {
      toastr.error("你输了")
    } else {
      toastr.success("你赢了")
    }
    finish = true
  }

  //2.2 长将
  const repValue = pos.repValue()

  if (repValue) {
    if (repValue === banValue) {
      if (playerSide === pos.side) {
        toastr.success("你赢了")
      } else {
        toastr.error("你输了")
      }
    } else if (repValue === -banValue) {
      if (playerSide === pos.side) {
        toastr.error('你输了')
      } else {
        toastr.success('你赢了')
      }
    } else if (repValue === drawValue) {
      toastr.info('和棋')
    }
    finish = true
  }

  //重置coordinate状态
  Object.keys(coordinates).forEach((index) => {
    coordinate = coordinates[index]

    coordinate.classList.remove('lastSelected')
    coordinate.classList.remove('lastSelecting')
  })

  pos.board.forEach((chessNum, boardPos) => {
    if (coordinates[boardPos]) {
      coordinates[boardPos].setChess(chesses[chessNum])
    }
  })

  if (pos.moveStack.length) {
    const lastMove = pos.moveStack[pos.moveStack.length - 1]

    coordinates[lastMove.from].classList.add('lastSelected')
    coordinates[lastMove.to].classList.add('lastSelected')
  }

  return new Promise((resolve) => {
    setTimeout(() => resolve(), 500)
  })
}

function playerConsider() {
  playerTurn = true
}

function computerConsider() {
  playerTurn = false

  computerMove(ComputerThinkTimer(pos))
}

let from
let to

function selectFrom(pos) {
  //1. 取消上一步选中
  unSelectFrom()

  //2. 重新选择
  from = pos
  coordinates[pos].classList.add('selected')
}

function unSelectFrom() {
  if (from) {
    coordinates[from].classList.remove('selected')
  }
  from = undefined
}

function selectTo(pos) {
  to = pos
  playerMove({ from, to })
}

function unSelectTo() {
  to = undefined
}

function unSelect() {
  unSelectFrom()
  unSelectTo()
}

function setInterface(startHeight, startWidth, gapWidth, gapHeight) {
  for (let i = 3; i <= 3 + 9; i++) {
    for (let j = 3; j <= 3 + 10; j++) {
      const coordinate = document.createElement('div')
      coordinate.className = `coordinate coordinate_${i - 3}_${j - 3} pos_${(i << 4) + j}`
      coordinate.style.position = 'absolute'
      coordinate.style.top = startHeight + (i - 3) * gapHeight
      coordinate.style.left = startWidth + (j - 3) * gapWidth
      coordinate.style.width = gapWidth
      coordinate.style.height = gapHeight

      coordinate.pos = (i << 4) + j

      document.getElementById('chessboard-container').appendChild(coordinate)

      coordinate.onclick = function () {
        if (playerTurn) {
          if (from != undefined) {
            selectTo(this.pos)
          }
        }
      }

      coordinate.setChess = function (child) {
        if (child) {
          this.innerHTML = null
          this.appendChild(child)
          child.pos = this.pos
        }
      }

      coordinates[coordinate.pos] = coordinate
    }
  }

  for (let i = 16; i < 48; i++) {
    const chessDom = document.createElement('div')

    chessDom.id = `chess_${i}`
    if (i < 32) {
      chessDom.side = 0
    } else {
      chessDom.side = 1
    }
    chessDom.className = 'chess'

    chessDom.onclick = function (ev) {
      if (playerTurn) {
        if (this.side === pos.side) {
          selectFrom(this.pos)
        } else {
          if (from) {
            selectTo(this.pos)
          }
        }
      }

      ev.stopPropagation()
    }

    chesses[i] = chessDom
  }
}

window.onload = function () {
  setInterface(15, 15, 71, 71)

  if (pos.side === playerSide) {
    display().then(playerConsider)
  } else {
    display().then(computerConsider)
  }
}
