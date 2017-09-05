const {
  InitialBoard,
  CharToInt,
  IntToChar,
  PieceNumToType,
  Move,
  KnightMove,
  KingMove,
  AdvisorMove,
  BishopMove,
  RookMove,
  CannonMove,
  PawnMove,
  canAttackByKing,
  canAttackByAdvisor,
  canAttackByBishop,
  canAttackByKnight,
  canAttackByRook,
  canAttackByCannon,
  canAttackByPawn,
} = require('./util')

const {
  evalWhite,
  evalBlack,
  evalBlackMove,
  evalWhiteMove,
  banValue,
  drawValue,
  nullOkMargin,
  nullSafeMargin
} = require('./evaluate')

const {
  zobristTable,
  zobristSide,
  Zobrist,
  ZobristNode
} = require('./hashtable')

const initialFen = 'rnbakabnr/9/1c5c1/p1p1p1p1p/9/9/P1P1P1P1P/1C5C1/9/RNBAKABNR w'

class Pos {
  constructor(fen = initialFen, moveStack = []) {
    this.fenToBoard(fen)

    moveStack.forEach(({ from, to }) => {
      const legalMove = this.getLegalMove(from, to)
      if (legalMove) {
        this.makeMove(legalMove)
      } else {
        throw new Error('非法的移动')
      }
    })
  }

  static setToOriginal() {
    const pos = new Pos(initialFen)
    return pos
  }

  getLegalMove(from, to) {
    return this.generateMoves().find((move) => move.from === from && move.to === to)
  }

  clearBoard() {
    //没有棋子则为0
    this.board = Array.from(Array(256)).map(() => 0)
    //棋子被吃掉的为0
    this.piece = Array.from(Array(48)).map(() => 0)
  }

  canAttack(piecePos, sideTag) {
    //被将攻击
    if (canAttackByKing(this, this.piece[sideTag], piecePos)) {
      return true
    }

    //被士攻击
    for (let i = 1; i <= 2; i++) {
      const knightPos = this.piece[sideTag + i]
      if (canAttackByKing(this, knightPos, piecePos)) {
        return true
      }
    }

    //被象攻击
    for (let i = 3; i <= 4; i++) {
      const BishopPos = this.piece[i + this.sideTag]

      //马还没被吃掉
      if (BishopPos) {
        if (canAttackByBishop(this, BishopPos, piecePos)) {
          return true
        }
      }
    }

    //是否被马攻击
    for (let i = 5; i <= 6; i++) {
      const knightPos = this.piece[i + this.sideTag]

      //马还没被吃掉
      if (knightPos) {
        if (canAttackByKnight(this, knightPos, piecePos)) {
          return true
        }
      }
    }

    //是否被车攻击
    for (let i = 7; i <= 8; i++) {
      const rookPos = this.piece[i + this.sideTag]

      //车还没被吃掉
      if (rookPos) {
        if (canAttackByRook(this, rookPos, piecePos)) {
          return true
        }
      }
    }

    //是否被炮攻击
    for (let i = 9; i <= 10; i++) {
      const cannonPos = this.piece[i + this.sideTag]

      //炮还没被吃掉
      if (cannonPos) {
        if (canAttackByCannon(this, cannonPos, piecePos)) {
          return true
        }
      }
    }

    //是否被兵攻击
    for (let i = 11; i <= 15; i++) {
      const pawnPos = this.piece[i + this.sideTag]

      //兵还没被吃掉
      if (pawnPos) {
        if (canAttackByPawn(this, pawnPos, piecePos)) {
          return true
        }
      }
    }

    return false
  }

  isProtect(piecePos) {
    //16为红方,32为黑方
    const sideTag = this.board[piecePos] & 16 ? 16 : 32

    return this.canAttack(piecePos, sideTag)
  }

  repValue() {
    const status = this.repStatus()
    switch (status) {
      //双方重复但未将军
      case 1:
        return drawValue
      //我方长将，对我方来说返回一个-ban值
      case 3:
        return -banValue
      //敌方长将，对我方来说返回一个ban值  
      case 5:
        return banValue
      //双方长将
      case 7:
        return drawValue
    }
  }

  repStatus() {
    let checkIndex = this.checkStack.length - 2
    let zobristIndex = this.zobristStack.length - 2
    let moveIndex = this.moveStack.length - 1

    let selfSide = false
    let oppPerpCheck = this.checkStack[this.checkStack.length - 1]
    let perpCheck = true
    while (zobristIndex >= 0) {
      if (this.moveStack[moveIndex].capture) {
        return 0
      }

      if (selfSide) {
        oppPerpCheck = oppPerpCheck && this.checkStack[checkIndex]
        if (this.zobrist.equal(this.zobristStack[zobristIndex])) {
          return 1 + (oppPerpCheck ? 4 : 0) + (perpCheck ? 2 : 0)
        }
      } else {
        perpCheck = perpCheck && this.checkStack[checkIndex]
      }
      selfSide = !selfSide
      zobristIndex--
      checkIndex--
      moveIndex--
    }

    return 0
  }

  //当前回合棋子能否将到对面棋子
  canCheck() {
    const wKingPos = this.piece[16]
    const bKingPos = this.piece[32]

    const opponentKingPos = this.side ? wKingPos : bKingPos
    const sideTag = this.side ? 32 : 16

    //判断将帅是否照面
    if (wKingPos % 16 === bKingPos % 16) {
      let isFace = true
      for (let middlePiecePos = wKingPos - 16; middlePiecePos !== bKingPos; middlePiecePos -= 16) {
        if (this.board[middlePiecePos]) isFace = false
      }

      if (isFace) return true
    }

    return this.canAttack(opponentKingPos, sideTag)
  }

  addPiece(pos, pc) {
    this.board[pos] = pc
    this.piece[pc] = pos
  }

  //当前颜色的将是否正在被将军
  isChecked() {
    this.changeSide()
    const isChecked = this.canCheck()
    this.changeSide()
    return isChecked
  }

  changeSide() {
    this.side = this.side === 0 ? 1 : 0
    this.sideTag = 16 + this.side * 16
  }

  generateMoves(capture = false) {
    let moves = []

    for (let i = 0; i <= 15; i++) {
      const pieceIndex = i + this.sideTag
      if (!this.piece[pieceIndex]) {
        continue
      }

      switch (i) {
        case 0:
          KingMove(this, moves, this.piece[pieceIndex], capture)
          break
        case 1:
        case 2:
          AdvisorMove(this, moves, this.piece[pieceIndex], capture)
          break
        case 3:
        case 4:
          BishopMove(this, moves, this.piece[pieceIndex], capture)
          break
        case 5:
        case 6:
          KnightMove(this, moves, this.piece[pieceIndex], capture)
          break
        case 7:
        case 8:
          RookMove(this, moves, this.piece[pieceIndex], capture)
          break
        case 9:
        case 10:
          CannonMove(this, moves, this.piece[pieceIndex], capture)
          break
        case 11:
        case 12:
        case 13:
        case 14:
        case 15:
          PawnMove(this, moves, this.piece[pieceIndex], capture)
          break
      }
    }
    return moves
  }

  get zobrist() {
    return this.zobristStack[this.zobristStack.length - 1]
  }

  // makeEmptyMove() {
  //   this.moveStack.push(null)
  //   this.zobristStack.push(this.zobrist.xor(zobristSide))
  //   this.checkStack.push(this.canCheck())
  //   this.changeSide()

  //   if (this.canCheck()) {
  //     this.unMakeEmptyMove()
  //     return false
  //   }
  //   return true
  // }

  // unMakeEmptyMove() {
  //   //弹出上一个zobrist值
  //   this.zobristStack.pop()
  //   this.moveStack.pop()
  //   this.checkStack.pop()
  //   this.changeSide()
  // }

  movePiece(move) {
    //存储移动的棋子
    this.moveStack.push(move)

    //移动棋子
    const movedPiece = this.board[move.from]
    this.board[move.from] = 0
    this.board[move.to] = movedPiece
    this.piece[movedPiece] = move.to

    let newZobrist = this.zobrist
    //吃棋子
    if (move.capture) {
      const capturedPos = this.piece[move.capture]
      this.piece[move.capture] = 0
    }
  }

  unMovePiece() {
    //撤销上一步
    const move = this.moveStack.pop()

    //移动的棋子
    const movedPiece = this.board[move.to]

    //撤销移动棋子
    this.board[move.to] = 0
    this.board[move.from] = movedPiece
    this.piece[movedPiece] = move.from

    //撤销吃棋子
    if (move.capture) {
      this.board[move.to] = move.capture
      this.piece[move.capture] = move.to
    }
  }

  makeMove(move) {
    //1. 尝试着走一步 
    this.movePiece(move)

    //2. 走了这一步后会被将军
    if (this.isChecked()) {
      //撤销这一步
      this.unMovePiece()
      return false
    }
    //3. 一步能走的棋
    else {
      //3.0 改变局面颜色
      this.changeSide()

      const movedPiece = this.board[move.to]

      //获得上一个移动棋子的颜色
      const opponentSide = this.side?0:1

      //3.1 改变zobrist值
      const pieceZobrist = zobristTable[opponentSide][PieceNumToType[movedPiece]][move.from]
      const nextPieceZobrist = zobristTable[opponentSide][PieceNumToType[movedPiece]][move.to]
      let newZobrist = this.zobrist.xor(pieceZobrist).xor(nextPieceZobrist).xor(zobristSide)

      //3.1.1 如果被吃子
      if (move.capture) {
        //zobrist里取消被吃掉的子
        newZobrist = newZobrist.xor(zobristTable[this.side][PieceNumToType[move.capture]][move.to])
      }

      //3.1.2
      this.zobristStack.push(newZobrist)

      //3.2 判断当前局面是否被将军
      this.checkStack.push(this.isChecked())

      return true
    }
  }

  unMakeMove() {
    //1. 取消上一步
    this.unMovePiece()

    //2. 弹出上一个zobrist值
    this.zobristStack.pop()

    //3. 撤销将军判断
    this.checkStack.pop()

    //4. 改变局面颜色
    this.changeSide()
  }

  toFen() {
    let fen = ''
    let blank = 0
    for (let i = 3; i <= 12; i++) {
      for (let j = 3; j <= 11; j++) {
        const pc = this.board[(i << 4) + j]

        if (pc !== 0) {
          if (blank !== 0) {
            fen += blank
            blank = 0
          }
          fen += IntToChar(pc)
        } else {
          blank++
        }
      }
      if (blank !== 0) {
        fen += blank
        blank = 0
      }

      if (i !== 12) {
        fen += "/"
      }
    }

    fen += ` ${this.side === 0 ? 'w' : 'b'}`
    return fen
  }

  evaluate(side = null) {
    if (side === 0) {
      return this.whiteScore
    } else if (side === 1) {
      return this.blackScore
    }

    if (this.side === 0) {
      return this.whiteScore - this.blackScore
    } else {
      return this.blackScore - this.whiteScore
    }
  }

  get nullOk() {
    return this.evaluate(this.side) >= nullOkMargin
  }

  get nullSafe() {
    return this.evaluate(this.side) >= nullSafeMargin
  }

  get whiteScore() {
    const whiteMoveScore = 0
    const score = evalWhite(this) - whiteMoveScore
    return score
  }

  get blackScore() {
    const blackMoveScore = 0
    const score = evalBlack(this) - blackMoveScore
    return score
  }

  initialState(){
    this.moveStack = []
    this.zobristStack = []
    this.checkStack = []
  }

  fenToBoard(fen) {
    const pc = {}

    const fenInfo = fen.split(' ')

    this.clearBoard()
    this.initialState()

    let row = 3, column = 3
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

        this.addPiece((row << 4) + column, pc[piece] + piece)

        column++
        pc[piece]++
      }
    })

    //初始化棋盘颜色
    this.side = fenInfo[1] === 'b' ? 1 : 0
    this.sideTag = 16 + this.side * 16

    //初始化局面的zobrist
    this.zobristStack = [this.board.reduce((zobrist, piece, index) => {
      if (piece) {
        return zobrist.xor(zobristTable[this.side][PieceNumToType[piece]][index])
      } else {
        return zobrist
      }
    }, new ZobristNode())]
    this.checkStack = [this.isChecked()]
  }
}

module.exports = Pos

