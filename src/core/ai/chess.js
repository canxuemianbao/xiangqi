const red = true
const black = false

function isInBoard(color, x, y) {
  if (color === red) {
    return x >= 5 && x <= 9 && y >= 0 && y <= 8
  } else if (color === black) {
    return x >= 0 && x <= 4 && y >= 0 && y <= 8
  } else {
    return x >= 0 && x <= 9 && y >= 0 && y <= 8
  }
}

function isInFort(color, x, y) {
  if (color === red) {
    return x >= 7 && x <= 9 && y >= 3 && y <= 5
  } else {
    return x >= 0 && x <= 2 && y >= 3 && y <= 5
  }
}

class Chess {
  constructor(x, y, color, offensive = false) {
    this.x = x
    this.y = y
    this.color = color
    this.offensive = offensive
    this.dead = false
    this.name = this.constructor.name
  }

  canThisColorOccupy(x, y) {
    return (chessboard) => chessboard[x][y] == null || chessboard[x][y].color !== this.color
  }

  canGenerateOneDirectionBoardMove(x, y) {
    return (chessboard) => isInBoard(null, x, y) && this.canThisColorOccupy(x, y)(chessboard)
  }

  canGenerateOneDirectionMyBoardMove(x, y) {
    return (chessboard) => isInBoard(this.color, x, y) && this.canThisColorOccupy(x, y)(chessboard)
  }

  canGenerateOneDirectionFortMove(x, y) {
    return (chessboard) => isInFort(this.color, x, y) && this.canThisColorOccupy(x, y)(chessboard)
  }

  canGenerateOneDirectionMove(x, y) {
    return (chessboard) => true
  }

  isInMyRule(x, y) { }

  generateMyRules() { }

  canMove(x, y) {
    return (chessboard) => this.isInMyRule(x, y) && this.canGenerateOneDirectionMove(x, y)(chessboard)
  }

  generateMoves(resultArray) {
    return (chessboard) => {
      for (let rule of this.generateMyRules()) {
        if (this.canGenerateOneDirectionMove(rule.x, rule.y)(chessboard)) {
          resultArray.push({ chess: this, x: rule.x, y: rule.y })
        }
      }
    }
  }
}

//将
class King extends Chess {
  isInMyRule(x, y) {
    return (
      (this.x === x && this.y - 1 === y) ||
      (this.x + 1 === x && this.y === y) ||
      (this.x === x && this.y + 1 === y) ||
      (this.x - 1 === x && this.y === y)
    )
  }

  fen() {
    return this.color === red ? "K" : "k"
  }

  //should be optimize
  generateMyRules() {
    return [
      { x: this.x, y: this.y - 1 },
      { x: this.x + 1, y: this.y },
      { x: this.x, y: this.y + 1 },
      { x: this.x - 1, y: this.y }
    ]
  }

  canGenerateOneDirectionMove(x, y) {
    return this.canGenerateOneDirectionFortMove(x, y)
  }
}

//士
class Advisor extends Chess {
  isInMyRule(x, y) {
    return (
      (this.x + 1 === x && this.y - 1 === y) ||
      (this.x + 1 === x && this.y + 1 === y) ||
      (this.x - 1 === x && this.y + 1 === y) ||
      (this.x - 1 === x && this.y - 1 === y)
    )
  }

  fen() {
    return this.color === red ? "A" : "a"
  }

  //should be optimize
  generateMyRules() {
    return [
      { x: this.x + 1, y: this.y - 1 },
      { x: this.x + 1, y: this.y + 1 },
      { x: this.x - 1, y: this.y + 1 },
      { x: this.x - 1, y: this.y - 1 }
    ]
  }

  canGenerateOneDirectionMove(x, y) {
    return this.canGenerateOneDirectionFortMove(x, y)
  }
}

//象
class Bishop extends Chess {
  isInMyRule(x, y) {
    return Math.abs(this.x - x) === 2 && Math.abs(this.y - y) === 2
  }

  fen() {
    return this.color === red ? "B" : "b"
  }

  //should be optimize
  generateMyRules() {
    return [
      { x: this.x - 2, y: this.y - 2 },
      { x: this.x + 2, y: this.y - 2 },
      { x: this.x - 2, y: this.y + 2 },
      { x: this.x + 2, y: this.y + 2 }
    ]
  }

  getPin(x, y) {
    return { x: (this.x + x) / 2, y: (this.y + y) / 2 }
  }

  canGenerateOneDirectionMove(x, y) {
    const spanPos = this.getPin(x, y)

    return (chessboard) => this.canGenerateOneDirectionMyBoardMove(x, y)(chessboard) && chessboard[spanPos.x][spanPos.y] == null
  }
}


//马
class Knight extends Chess {
  constructor(x, y, color) {
    super(x, y, color, true)
  }

  fen() {
    return this.color === red ? "N" : "n"
  }

  isInMyRule(x, y) {
    /**
      top left
      top right
      right top
      right bottom
      bottom left
      bottom right
      left top
      left bottom
    */
    return (
      (this.x - 1 === x && this.y - 2 === y) ||
      (this.x + 1 === x && this.y - 2 === y) ||
      (this.x + 2 === x && this.y - 1 === y) ||
      (this.x + 2 === x && this.y + 1 === y) ||
      (this.x - 1 === x && this.y + 2 === y) ||
      (this.x + 1 === x && this.y + 2 === y) ||
      (this.x - 2 === x && this.y - 1 === y) ||
      (this.x - 2 === x && this.y + 1 === y)
    )
  }

  //should be optimize
  generateMyRules() {
    /**
      top left
      top right
      right top
      right bottom
      bottom left
      bottom right
      left top
      left bottom
    */
    return [
      { x: this.x - 1, y: this.y - 2 },
      { x: this.x + 1, y: this.y - 2 },
      { x: this.x + 2, y: this.y - 1 },
      { x: this.x + 2, y: this.y + 1 },
      { x: this.x - 1, y: this.y + 2 },
      { x: this.x + 1, y: this.y + 2 },
      { x: this.x - 2, y: this.y - 1 },
      { x: this.x - 2, y: this.y + 1 },
    ]
  }

  getPin(x, y) {
    if (Math.abs(x - this.x) === 2) {
      return { x: (x + this.x) / 2, y: this.y }
    } else {
      return { x: this.x, y: (y + this.y) / 2 }
    }
  }

  canGenerateOneDirectionMove(x, y) {
    const spanPos = this.getPin(x, y)

    return (chessboard) => this.canGenerateOneDirectionBoardMove(x, y)(chessboard) && chessboard[spanPos.x][spanPos.y] == null
  }
}

//车
class Rook extends Chess {
  constructor(x, y, color) {
    super(x, y, color, true)
  }

  fen() {
    return this.color === red ? "R" : "r"
  }

  canMove(x, y) {
    return (chessboard) => {
      const isOneLine = (this.x === x && this.y !== y) || (this.y === y && this.x !== x)

      const existObstacle = () => {
        if (this.y === y) {
          const [low, high] = this.x > x ? [x + 1, this.x] : [this.x + 1, x]
          for (let i = low; i < high; i++) {
            if (chessboard[i][this.y] != null) {
              return true
            }
          }
        } else {
          const [low, high] = this.y > y ? [y + 1, this.y] : [this.y + 1, y]
          for (let i = low; i < high; i++) {
            if (chessboard[this.x][i] != null) {
              return true
            }
          }
        }
        return false
      }

      return isOneLine && !existObstacle() && this.canGenerateOneDirectionBoardMove(x, y)(chessboard)
    }
  }

  generateMoves(resultArray) {
    return (chessboard) => {
      /**
       * xxxxyxxx
       * xxxxRxxx
       * xxxxxxxx
       * xxxxxxxx
       */
      for (let i = this.x - 1; i >= 0; i--) {
        if (chessboard[i][this.y] != null) {
          if (this.canThisColorOccupy(i, this.y)(chessboard)) {
            resultArray.push({ chess: this, x: i, y: this.y })
          }
          break
        } else {
          resultArray.push({ chess: this, x: i, y: this.y })
        }
      }

      /**
       * xxxxxxxx
       * xxxxRxxx
       * xxxxyxxx
       * xxxxyxxx
       */
      for (let i = this.x + 1; i <= 9; i++) {
        if (chessboard[i][this.y] != null) {
          if (this.canThisColorOccupy(i, this.y)(chessboard)) {
            resultArray.push({ chess: this, x: i, y: this.y })
          }
          break
        } else {
          resultArray.push({ chess: this, x: i, y: this.y })
        }
      }

      /**
       * xxxxxxxx
       * yyyyRxxx
       * xxxxxxxx
       * xxxxxxxx
       */
      for (let i = this.y - 1; i >= 0; i--) {
        if (chessboard[this.x][i] != null) {
          if (this.canThisColorOccupy(this.x, i)(chessboard)) {
            resultArray.push({ chess: this, x: this.x, y: i })
          }
          break
        } else {
          resultArray.push({ chess: this, x: this.x, y: i })
        }
      }

      /**
       * xxxxyxxx
       * xxxxRyyy
       * xxxxxxxx
       * xxxxxxxx
       */
      for (let i = this.y + 1; i <= 8; i++) {
        if (chessboard[this.x][i] != null) {
          if (this.canThisColorOccupy(this.x, i)(chessboard)) {
            resultArray.push({ chess: this, x: this.x, y: i })
          }
          break
        } else {
          resultArray.push({ chess: this, x: this.x, y: i })
        }
      }
    }
  }
}

//炮
class Can extends Chess {
  constructor(x, y, color) {
    super(x, y, color, true)
  }

  fen() {
    return this.color === red ? "C" : "c"
  }

  canMove(x, y) {
    return (chessboard) => {
      const isOneLine = (this.x === x && this.y !== y) || (this.y === y && this.x !== x)

      if (!isOneLine) {
        return false
      }

      const getObstacleNum = () => {
        let obstacleNum = 0

        if (this.y === y) {
          const [low, high] = this.x > x ? [x + 1, this.x] : [this.x + 1, x]
          for (let i = low; i < high; i++) {
            if (chessboard[i][this.y] != null) {
              obstacleNum++
              if (obstacleNum >= 2) {
                return 2
              }
            }
          }
        } else {
          const [low, high] = this.y > y ? [y + 1, this.y] : [this.y + 1, y]
          for (let i = low; i < high; i++) {
            if (chessboard[this.x][i] != null) {
              obstacleNum++
              if (obstacleNum >= 2) {
                return 2
              }
            }
          }
        }
        return obstacleNum
      }

      const obstacleNum = getObstacleNum()

      if (obstacleNum === 2) {
        return false
      } else if (obstacleNum === 1) {
        return isInBoard(null, x, y) && chessboard[x][y] && chessboard[x][y].color !== this.color
      } else {
        return isInBoard(null, x, y) && chessboard[x][y] == null
      }
    }
  }

  generateMoves(resultArray) {
    return (chessboard) => {
      /**
       * xxxxyxxx
       * xxxxRxxx
       * xxxxxxxx
       * xxxxxxxx
       */
      let obstacleNum = 0
      for (let i = this.x - 1; i >= 0; i--) {
        if (chessboard[i][this.y] != null) {
          obstacleNum++
          if (obstacleNum === 2) {
            if (this.canThisColorOccupy(i, this.y)(chessboard)) {
              resultArray.push({ chess: this, x: i, y: this.y })
            }
            break
          }
        } else {
          if (obstacleNum === 1) {
            continue
          }
          resultArray.push({ chess: this, x: i, y: this.y })
        }
      }

      /**
       * xxxxxxxx
       * xxxxRxxx
       * xxxxyxxx
       * xxxxyxxx
       */
      obstacleNum = 0
      for (let i = this.x + 1; i <= 9; i++) {
        if (chessboard[i][this.y] != null) {
          obstacleNum++
          if (obstacleNum === 2) {
            if (this.canThisColorOccupy(i, this.y)(chessboard)) {
              resultArray.push({ chess: this, x: i, y: this.y })
            }
            break
          }
        } else {
          if (obstacleNum === 1) {
            continue
          }
          resultArray.push({ chess: this, x: i, y: this.y })
        }
      }

      /**
       * xxxxxxxx
       * yyyyRxxx
       * xxxxxxxx
       * xxxxxxxx
       */
      obstacleNum = 0
      for (let i = this.y - 1; i >= 0; i--) {
        if (chessboard[this.x][i] != null) {
          obstacleNum++
          if (obstacleNum === 2) {
            if (this.canThisColorOccupy(this.x, i)(chessboard)) {
              resultArray.push({ chess: this, x: this.x, y: i })
            }
            break
          }
        } else {
          if (obstacleNum === 1) {
            continue
          }
          resultArray.push({ chess: this, x: this.x, y: i })
        }
      }

      /**
       * xxxxyxxx
       * xxxxRyyy
       * xxxxxxxx
       * xxxxxxxx
       */
      obstacleNum = 0
      for (let i = this.y + 1; i <= 8; i++) {
        if (chessboard[this.x][i] != null) {
          obstacleNum++
          if (obstacleNum === 2) {
            if (this.canThisColorOccupy(this.x, i)(chessboard)) {
              resultArray.push({ chess: this, x: this.x, y: i })
            }
            break
          }
        } else {
          if (obstacleNum === 1) {
            continue
          }
          resultArray.push({ chess: this, x: this.x, y: i })
        }
      }
    }
  }
}

//兵
class Pawn extends Chess {
  constructor(x, y, color) {
    super(x, y, color, true)
  }

  fen() {
    return this.color === red ? "P" : "p"
  }

  isInMyRule(x, y) {
    let forwardX = this.color === red ? this.x - 1 : this.x + 1

    if (isInBoard(this.color, x, y)) {
      return forwardX === x && this.y === y
    } else {
      return (
        (forwardX === x && this.y === y) ||
        (this.x === x && this.y - 1 === y) ||
        (this.x === x && this.y + 1 === y)
      )
    }
  }

  //should be optimize
  generateMyRules() {
    let forwardX = this.color === red ? this.x - 1 : this.x + 1

    if (isInBoard(this.color, this.x, this.y)) {
      return [
        { x: forwardX, y: this.y }
      ]
    } else {
      return [
        { x: forwardX, y: this.y },
        { x: this.x, y: this.y - 1 },
        { x: this.x, y: this.y + 1 }
      ]
    }
  }

  canGenerateOneDirectionMove(x, y) {
    return this.canGenerateOneDirectionBoardMove(x, y)
  }
}

module.exports = {
  isInFort,
  isInBoard,
  King,
  Advisor,
  Bishop,
  Knight,
  Rook,
  Can,
  Pawn
}