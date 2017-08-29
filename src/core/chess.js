const area = require('./area')
const { PosError, CannotMoveError } = require('./error')
const { Red, Black } = require('./color')

class Chess {
  constructor(id, row, column, color) {
    this.id = id
    this.row = row
    this.column = column
    this.color = color
    if (!this.isPosValid(row, column)) throw new PosError()
  }

  isForward(targetRow) {
    return this.color.isForward(this.row)(targetRow)
  }

  isPosValid(row, column) {
    return Chess.isInArea(this.wholeArea)(row, column)
  }

  get wholeArea() {
    return area.wholeArea
  }

  get myArea() {
    return area.myArea(this.color)
  }

  get myNineArea() {
    return area.myNineArea(this.color)
  }

  static isInArea(area) {
    return (row, column) => {
      return area[row] && area[row][column] || false
    }
  }

  isMovePatternValid(gameTurn) {
    return (row, column) => true
  }

  isComrade(chess) {
    return chess != null && this.color === chess.color
  }

  canMove(gameTurn) {
    return (row, column) => this.isMovePatternValid(gameTurn)(row, column) && this.isPosValid(row, column) && !this.isComrade(gameTurn.getChess(row, column))
  }

  moveTo(gameTurn, trace) {
    return (row, column) => {
      if (this.canMove(gameTurn)(row, column)) {
        return gameTurn.update(this, new (this.constructor)(this.id, row, column, this.color), trace)
      }
      throw new CannotMoveError()
    }
  }

  next(gameTurn) {
    let self = this
    return {
      *[Symbol.iterator]() {
        for (let row = 0; row < self.wholeArea.length; row++) {
          for (let column = 0; column < self.wholeArea[0].length; column++) {
            try {
              yield self.moveTo(gameTurn)(row, column)
            } catch (err) {

            }
          }
        }
      }
    }
  }
}

class Bing extends Chess {
  _isMovePatternValidInMyArea(row, column) {
    return this.isForward(row) && Math.abs(this.row - row) === 1 && this.column === column
  }

  _isMovePatternValidInOpponentArea(row, column) {
    return this.isForward(row) && Math.abs(this.row - row) + Math.abs(this.column - column) === 1
  }

  isMovePatternValid(gameTurn) {
    return (row, column) => {
      const isInMyArea = Chess.isInArea(this.myArea)(row, column)
      return isInMyArea ? this._isMovePatternValidInMyArea(row, column) : this._isMovePatternValidInOpponentArea(row, column)
    }
  }

  fen() {
    return this.color === Red ? "P" : "p"
  }
}

class Shuai extends Chess {
  isPosValid(row, column) {
    return Chess.isInArea(this.myNineArea)(row, column)
  }

  isMovePatternValid(gameTurn) {
    return (row, column) => {
      return Math.abs(this.row - row) + Math.abs(this.column - column) === 1
    }
  }

  fen() {
    return this.color === Red ? "K" : "k"
  }
}

class Shi extends Chess {
  isPosValid(row, column) {
    return Chess.isInArea(this.myNineArea)(row, column)
  }

  isMovePatternValid(gameTurn) {
    return (row, column) => {
      return Math.abs(this.row - row) === 1 && Math.abs(this.column - column) === 1
    }
  }

  fen() {
    return this.color === Red ? "A" : "a"
  }
}

class Xiang extends Chess {
  isPosValid(row, column) {
    return Chess.isInArea(this.myArea)(row, column)
  }

  isMovePatternValid(gameTurn) {
    return (row, column) => {
      const isMovePatternValid = Math.abs(this.row - row) === 2 && Math.abs(this.column - column) === 2

      return isMovePatternValid && gameTurn.getChess((this.row + row) / 2, (this.column + column) / 2) == null
    }
  }

  fen() {
    return this.color === Red ? "B" : "b"
  }
}

class Ma extends Chess {
  isMovePatternValid(gameTurn) {
    return (row, column) => {
      const isMovePatternValidLeft1 = Math.abs(this.row - row) === 1 && (this.column - column === 2 && gameTurn.getChess(this.row, column + 1) == null)
      const isMovePatternValidRight1 = Math.abs(this.row - row) === 1 && (column - this.column === 2 && gameTurn.getChess(this.row, column - 1) == null)
      const isMovePatternValidLeft2 = (this.row - row === 2 && gameTurn.getChess(row + 1, this.column) == null) && Math.abs(this.column - column) === 1
      const isMovePatternValidRight2 = (row - this.row === 2 && gameTurn.getChess(row - 1, this.column) == null) && Math.abs(this.column - column) === 1
      const isMovePatternValid = isMovePatternValidLeft1 || isMovePatternValidRight1 || isMovePatternValidLeft2 || isMovePatternValidRight2

      return isMovePatternValid
    }
  }

  fen() {
    return this.color === Red ? "N" : "n"
  }
}

class Che extends Chess {
  isMovePatternValid(gameTurn) {
    return (row, column) => {
      const isOneLine = (this.row === row && this.column !== column) || (this.column === column && this.row !== row)

      const existObstacle = () => {
        if (this.column === column) {
          const [low, high] = this.row > row ? [row + 1, this.row] : [this.row + 1, row]
          for (let i = low; i < high; i++) {
            if (gameTurn.getChess(i, this.column) != null) {
              return true
            }
          }
        } else {
          const [low, high] = this.column > column ? [column + 1, this.column] : [this.column + 1, column]
          for (let i = low; i < high; i++) {
            if (gameTurn.getChess(this.row, i) != null) {
              return true
            }
          }
        }
        return false
      }

      return isOneLine && !existObstacle()
    }
  }

  fen() {
    return this.color === Red ? "R" : "r"
  }
}

class Pao extends Chess {
  isMovePatternValid(gameTurn) {
    return (row, column) => {
      const isOneLine = (this.row === row && this.column !== column) || (this.column === column && this.row !== row)

      if (!isOneLine) {
        return false
      }

      const getObstacleNums = () => {
        let obstacleNums = 0
        if (this.column === column) {
          const [low, high] = this.row > row ? [row + 1, this.row] : [this.row + 1, row]
          for (let i = low; i < high; i++) {
            if (gameTurn.getChess(i, this.column) != null) {
              obstacleNums++
            }
          }
        } else {
          const [low, high] = this.column > column ? [column + 1, this.column] : [this.column + 1, column]
          for (let i = low; i < high; i++) {
            if (gameTurn.getChess(this.row, i) != null) {
              obstacleNums++
            }
          }
        }
        return obstacleNums
      }

      const obstacleNums = getObstacleNums()
      const chess = gameTurn.getChess(row, column)

      const isMovePatternValid1 = obstacleNums === 1 && (chess != null && this.color !== chess.color)
      const isMovePatternValid2 = obstacleNums === 0 && chess == null
      return (isMovePatternValid1 || isMovePatternValid2)
    }
  }

  fen() {
    return this.color === Red ? "C" : "c"
  }
}

const redShuais = ["red_shuai"]
const redShis = ["red_shi_1", "red_shi_2"]
const redXiangs = ["red_xiang_1", "red_xiang_2"]
const redMas = ["red_ma_1", "red_ma_2"]
const redChes = ["red_che_1", "red_che_2"]
const redPaos = ["red_pao_1", "red_pao_2"]
const redBings = ["red_bing_1", "red_bing_2", "red_bing_3", "red_bing_4", "red_bing_5"]

const blackShuais = ["black_shuai"]
const blackShis = ["black_shi_1", "black_shi_2"]
const blackXiangs = ["black_xiang_1", "black_xiang_2"]
const blackMas = ["black_ma_1", "black_ma_2"]
const blackChes = ["black_che_1", "black_che_2"]
const blackPaos = ["black_pao_1", "black_pao_2"]
const blackBings = ["black_bing_1", "black_bing_2", "black_bing_3", "black_bing_4", "black_bing_5"]

function generateChess(fen, x, y) {
  //Black
  if (fen === 'k') {
    return new Shuai(blackShuais.shift(), x, y, Black)
  } else if (fen === 'a') {
    return new Shi(blackShis.shift(), x, y, Black)
  } else if (fen === 'b') {
    return new Xiang(blackXiangs.shift(), x, y, Black)
  } else if (fen === 'n') {
    return new Ma(blackMas.shift(), x, y, Black)
  } else if (fen === 'r') {
    return new Che(blackChes.shift(), x, y, Black)
  } else if (fen === 'c') {
    return new Pao(blackPaos.shift(), x, y, Black)
  } else if (fen === 'p') {
    return new Bing(blackBings.shift(), x, y, Black)
  }

  //red
  else if (fen === 'K') {
    return new Shuai(redShuais.shift(), x, y, Red)
  } else if (fen === 'A') {
    return new Shi(redShis.shift(), x, y, Red)
  } else if (fen === 'B') {
    return new Xiang(redXiangs.shift(), x, y, Red)
  } else if (fen === 'N') {
    return new Ma(redMas.shift(), x, y, Red)
  } else if (fen === 'R') {
    return new Che(redChes.shift(), x, y, Red)
  } else if (fen === 'C') {
    return new Pao(redPaos.shift(), x, y, Red)
  } else if (fen === 'P') {
    return new Bing(redBings.shift(), x, y, Red)
  }
}

module.exports = {
  Chess,
  Bing,
  Shuai,
  Shi,
  Xiang,
  Ma,
  Che,
  Pao,
  generateChess
}