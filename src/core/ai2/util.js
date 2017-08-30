//board

exports.InitialBoard = [
  0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
  0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
  0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
  0, 0, 0, 39, 37, 35, 33, 32, 34, 36, 38, 40, 0, 0, 0, 0,
  0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
  0, 0, 0, 0, 41, 0, 0, 0, 0, 0, 42, 0, 0, 0, 0, 0,
  0, 0, 0, 43, 0, 44, 0, 45, 0, 46, 0, 47, 0, 0, 0, 0,
  0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
  0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
  0, 0, 0, 27, 0, 28, 0, 29, 0, 30, 0, 31, 0, 0, 0, 0,
  0, 0, 0, 0, 25, 0, 0, 0, 0, 0, 26, 0, 0, 0, 0, 0,
  0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
  0, 0, 0, 23, 21, 19, 17, 16, 18, 20, 22, 24, 0, 0, 0, 0,
  0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
  0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
  0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0
]

const newLegalPosition = [
  //white
  [
    0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
    0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
    0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
    0, 0, 0, 9, 9, 9, 9, 9, 9, 9, 9, 9, 0, 0, 0, 0,
    0, 0, 0, 9, 9, 9, 9, 9, 9, 9, 9, 9, 0, 0, 0, 0,
    0, 0, 0, 9, 9, 9, 9, 9, 9, 9, 9, 9, 0, 0, 0, 0,
    0, 0, 0, 9, 9, 9, 9, 9, 9, 9, 9, 9, 0, 0, 0, 0,
    0, 0, 0, 9, 9, 9, 9, 9, 9, 9, 9, 9, 0, 0, 0, 0,
    0, 0, 0, 9, 1, 25, 1, 9, 1, 25, 1, 9, 0, 0, 0, 0,
    0, 0, 0, 9, 1, 9, 1, 9, 1, 9, 1, 9, 0, 0, 0, 0,
    0, 0, 0, 17, 1, 1, 7, 19, 7, 1, 1, 17, 0, 0, 0, 0,
    0, 0, 0, 1, 1, 1, 3, 7, 3, 1, 1, 1, 0, 0, 0, 0,
    0, 0, 0, 1, 1, 17, 7, 3, 7, 17, 1, 1, 0, 0, 0, 0,
    0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
    0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
    0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
  ],

  //black
  [
    0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
    0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
    0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
    0, 0, 0, 1, 1, 17, 7, 3, 7, 17, 1, 1, 0, 0, 0, 0,
    0, 0, 0, 1, 1, 1, 3, 7, 3, 1, 1, 1, 0, 0, 0, 0,
    0, 0, 0, 17, 1, 1, 7, 19, 7, 1, 1, 17, 0, 0, 0, 0,
    0, 0, 0, 9, 1, 9, 1, 9, 1, 9, 1, 9, 0, 0, 0, 0,
    0, 0, 0, 9, 1, 25, 1, 9, 1, 25, 1, 9, 0, 0, 0, 0,
    0, 0, 0, 9, 9, 9, 9, 9, 9, 9, 9, 9, 0, 0, 0, 0,
    0, 0, 0, 9, 9, 9, 9, 9, 9, 9, 9, 9, 0, 0, 0, 0,
    0, 0, 0, 9, 9, 9, 9, 9, 9, 9, 9, 9, 0, 0, 0, 0,
    0, 0, 0, 9, 9, 9, 9, 9, 9, 9, 9, 9, 0, 0, 0, 0,
    0, 0, 0, 9, 9, 9, 9, 9, 9, 9, 9, 9, 0, 0, 0, 0,
    0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
    0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
    0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
  ]
]

//每一个棋子的mask，通过与legalPosition与运算产生棋子的位置表
const PositionMask = [2, 4, 16, 1, 1, 1, 8]

LegalPosition = [
  0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
  0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
  0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
  0, 0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0, 0,
  0, 0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0, 0,
  0, 0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0, 0,
  0, 0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0, 0,
  0, 0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0, 0,
  0, 0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0, 0,
  0, 0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0, 0,
  0, 0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0, 0,
  0, 0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0, 0,
  0, 0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0, 0,
  0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
  0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
  0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
]

console.assert(exports.InitialBoard.length === 256)
console.assert(LegalPosition.length === 256)

//棋子编号到棋子类型编号,分别为帅，士，象，马，车，炮，兵（0，1，2，3，4，5，6，7）
exports.PieceNumToType = [
  0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
  0, 1, 1, 2, 2, 3, 3, 4, 4, 5, 5, 6, 6, 6, 6, 6,
  0, 1, 1, 2, 2, 3, 3, 4, 4, 5, 5, 6, 6, 6, 6, 6,
]

//棋子编号到棋子名字
exports.IntToChar = function (value) {
  if (value < 32) {
    switch (value) {
      case 16: return 'K'

      case 17:
      case 18: return 'A'

      case 19:
      case 20: return 'B'

      case 21:
      case 22: return 'N'

      case 23:
      case 24: return 'R'

      case 25:
      case 26: return 'C'

      case 27:
      case 28:
      case 29:
      case 30:
      case 31: return 'P'
    }
  } else {
    switch (value - 16) {
      case 16: return 'k'

      case 17:
      case 18: return 'a'

      case 19:
      case 20: return 'b'

      case 21:
      case 22: return 'n'

      case 23:
      case 24: return 'r'

      case 25:
      case 26: return 'c'

      case 27:
      case 28:
      case 29:
      case 30:
      case 31: return 'p'
    }
  }
}

//棋子编号到棋子名字
exports.CharToInt = function (value) {
  switch (value) {
    case 'K':
      return 16
    case 'A':
      return 17
    case 'B':
      return 19
    case 'N':
      return 21
    case 'R':
      return 23
    case 'C':
      return 25
    case 'P':
      return 27

    case 'k':
      return 32
    case 'a':
      return 33
    case 'b':
      return 35
    case 'n':
      return 37
    case 'r':
      return 39
    case 'c':
      return 41
    case 'p':
      return 43
  }
}

//move
exports.Move = class {

  //wvl 是MVV-LVA得分值,capture是被攻击棋子的编号
  constructor(from, to, capture, wvl) {
    this.from = from
    this.to = to
    this.capture = capture
    this.wvl = wvl
  }

  equal(move) {
    return this.from === move.from && this.to === move.to && this.capture === move.capture
  }

  toString() {
    return JSON.stringify({ from: this.from, to: this.to, capture: this.capture, wvl: this.wvl })
  }
}

function SaveMove(moves, pos, from, to, capture = false) {
  if (pos.board[to]) {
    const attackingPiece = pos.board[from]
    const attackedPiece = pos.board[to]
    moves.push(new exports.Move(from, to, pos.board[to], pos.isProtect(to) ? MvvValues[attackedPiece] - MvvValues[attackingPiece] : MvvValues[attackedPiece]))
  } else {
    if (capture) {
      return
    }
    moves.push(new exports.Move(from, to))
  }
}

const MvvValues = [
  0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
  8, 2, 2, 2, 2, 4, 4, 6, 6, 4, 4, 2, 2, 2, 2, 2,
  8, 2, 2, 2, 2, 4, 4, 6, 6, 4, 4, 2, 2, 2, 2, 2
]

//king
const KingDir = [-0x10, 0x01, 0x10, -0x01]
const KingPosition = [
  0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
  0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
  0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
  0, 0, 0, 0, 0, 0, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0,
  0, 0, 0, 0, 0, 0, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0,
  0, 0, 0, 0, 0, 0, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0,
  0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
  0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
  0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
  0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
  0, 0, 0, 0, 0, 0, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0,
  0, 0, 0, 0, 0, 0, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0,
  0, 0, 0, 0, 0, 0, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0,
  0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
  0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
  0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
]

function getPieceSide(pos, piecePos) {
  const side = pos.board[piecePos] & 16 ? 0 : 1
  const sideTag = (side + 1) * 16
  return { side, sideTag }
}

exports.KingMove = function (pos, moves, piecePos, capture = false) {
  const movesStartNum = moves.length

  KingDir.forEach((dir, index) => {
    const nextPiecePos = piecePos + dir

    //在九宫上
    // if (KingPosition[nextPiecePos]) {
    if (newLegalPosition[pos.side][nextPiecePos] & PositionMask[0]) {
      //没有本方棋子
      if (!(pos.board[nextPiecePos] & pos.sideTag)) {
        //capture=true时只生成吃子走法
        SaveMove(moves, pos, piecePos, nextPiecePos, capture)
      }
    }
  })

  //生成了多少步
  return moves.length - movesStartNum
}

exports.canAttackByKing = function (pos, piecePos, nextPiecePos) {
  //不在九宫上
  if (!(newLegalPosition[getPieceSide(pos, piecePos).side][nextPiecePos] & PositionMask[0])) {
    return false
  }

  return KingDir.some((dir, index) => piecePos + dir === nextPiecePos)
}


//advisor
const AdvisorDir = [-0x11, -0x0f, 0x11, 0x0f]
const AdvisorPosition = [
  0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
  0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
  0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
  0, 0, 0, 0, 0, 0, 1, 0, 1, 0, 0, 0, 0, 0, 0, 0,
  0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0,
  0, 0, 0, 0, 0, 0, 1, 0, 1, 0, 0, 0, 0, 0, 0, 0,
  0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
  0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
  0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
  0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
  0, 0, 0, 0, 0, 0, 1, 0, 1, 0, 0, 0, 0, 0, 0, 0,
  0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0,
  0, 0, 0, 0, 0, 0, 1, 0, 1, 0, 0, 0, 0, 0, 0, 0,
  0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
  0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
  0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
]

exports.AdvisorMove = function (pos, moves, piecePos, capture = false) {
  const movesStartNum = moves.length

  AdvisorDir.forEach((dir, index) => {
    const nextPiecePos = piecePos + dir

    //在九宫上
    // if (AdvisorPosition[nextPiecePos]) {
    if (newLegalPosition[pos.side][nextPiecePos] & PositionMask[1]) {
      //没有本方棋子
      if (!(pos.board[nextPiecePos] & pos.sideTag)) {
        //capture=true时只生成吃子走法
        SaveMove(moves, pos, piecePos, nextPiecePos, capture)
      }
    }
  })

  //生成了多少步
  return moves.length - movesStartNum
}

exports.canAttackByAdvisor = function (pos, piecePos, nextPiecePos) {
  //不在九宫上
  if (!(newLegalPosition[getPieceSide(pos, piecePos).side][nextPiecePos] & PositionMask[1])) {
    return false
  }

  return AdvisorDir.some((dir, index) => piecePos + dir === nextPiecePos)
}

//bishop
const BishopDir = [-0x22, -0x1e, 0x22, 0x1e]
const BishopCheck = [-0x11, -0x0f, 0x11, 0x0f]
const BishopPosition = [
  0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
  0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
  0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
  0, 0, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0,
  0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
  0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 0,
  0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
  0, 0, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0,
  0, 0, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0,
  0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
  0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 0,
  0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
  0, 0, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0,
  0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
  0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
  0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
]

exports.BishopMove = function (pos, moves, piecePos, capture = false) {
  const movesStartNum = moves.length

  BishopDir.forEach((dir, index) => {
    const nextPiecePos = piecePos + dir

    //在棋盘上
    // if (BishopPosition[nextPiecePos] && ) {
    if (newLegalPosition[pos.side][nextPiecePos] & PositionMask[2]) {

      //不卡象眼
      if (pos.board[piecePos + BishopCheck[index]] === 0) {
        //没有本方棋子
        if (!(pos.board[nextPiecePos] & pos.sideTag)) {
          //capture=true时只生成吃子走法
          SaveMove(moves, pos, piecePos, nextPiecePos, capture)
        }
      }
    }
  })

  //生成了多少步
  return moves.length - movesStartNum
}

exports.canAttackByBishop = function (pos, piecePos, nextPiecePos) {
  //不在本方河内
  if (!(newLegalPosition[getPieceSide(pos, piecePos).side][nextPiecePos] & PositionMask[2])) {
    return false
  }

  return BishopDir.some((dir, index) => piecePos + dir === nextPiecePos && pos.board[piecePos + BishopCheck[index]])
}

//knight
const KnightDir = [0x0e, -0x12, -0x21, -0x1f, -0x0e, 0x12, 0x21, 0x1f]
const KnightCheck = [-0x01, -0x01, -0x10, -0x10, 0x01, 0x01, 0x10, 0x10]
const KnightPosition = LegalPosition

exports.KnightMove = function (pos, moves, piecePos, capture = false) {
  const movesStartNum = moves.length

  KnightDir.forEach((dir, index) => {
    const nextPiecePos = piecePos + dir

    //在棋盘上
    // if (KnightPosition[nextPiecePos]  ) {
    if (newLegalPosition[pos.side][nextPiecePos] & PositionMask[3]) {
      //不蹩马脚
      if (pos.board[piecePos + KnightCheck[index]] === 0) {
        //没有本方棋子
        if (!(pos.board[nextPiecePos] & pos.sideTag)) {
          //capture=true时只生成吃子走法
          SaveMove(moves, pos, piecePos, nextPiecePos, capture)
        }
      }
    }
  })

  //生成了多少步
  return moves.length - movesStartNum
}

exports.canAttackByKnight = function (pos, piecePos, nextPiecePos) {
  return KnightDir.some((dir, index) => {
    //在棋盘上
    if (newLegalPosition[getPieceSide(pos, piecePos).side][nextPiecePos] & PositionMask[3]) {
      //在马的进攻方向上
      if (dir + piecePos === nextPiecePos) {
        //不蹩马脚
        if (pos.board[piecePos + KnightCheck[index]] === 0) {
          return true
        }
      }
    }
  })
}

//rook
const RookDir = [-0x01, -0x10, 0x01, 0x10]
const RookPosition = LegalPosition

exports.RookMove = function (pos, moves, piecePos, capture = false) {
  const movesStartNum = moves.length

  RookDir.forEach((dir, index) => {
    let nextPiecePos = piecePos + dir

    while ((newLegalPosition[pos.side][nextPiecePos] & PositionMask[4]) && pos.board[nextPiecePos] === 0) {
      SaveMove(moves, pos, piecePos, nextPiecePos, capture)
      nextPiecePos += dir
    }

    //在棋盘上
    if (newLegalPosition[pos.side][nextPiecePos] & PositionMask[4]) {
      //没有本方棋子
      if (!(pos.board[nextPiecePos] & pos.sideTag)) {
        //capture=true时只生成吃子走法
        SaveMove(moves, pos, piecePos, nextPiecePos, capture)
      }
    }
  })

  //生成了多少步
  return moves.length - movesStartNum
}

exports.canAttackByRook = function (pos, piecePos, nextPiecePos) {
  //不在棋盘上
  if (!(newLegalPosition[getPieceSide(pos, piecePos).side][nextPiecePos] & PositionMask[4])) {
    return false
  }

  let dir
  //同一行
  if ((nextPiecePos >> 4) === (piecePos >> 4)) {
    dir = nextPiecePos > piecePos ? RookDir[2] : RookDir[0]
  }
  //同一列
  else if (nextPiecePos % 16 === piecePos % 16) {
    dir = nextPiecePos > piecePos ? RookDir[3] : RookDir[1]
  }
  else {
    return false
  }

  //判断中间是否有棋子
  for (let middlePiecePos = piecePos + dir; middlePiecePos !== nextPiecePos; middlePiecePos += dir) {
    if (pos.board[middlePiecePos] !== 0) return false
  }

  return true
}

//can
const CannonDir = [-0x01, -0x10, 0x01, 0x10]
const CannonPosition = LegalPosition

exports.CannonMove = function (pos, moves, piecePos, capture = false) {
  const movesStartNum = moves.length

  CannonDir.forEach((dir, index) => {
    let nextPiecePos = piecePos + dir

    //查找能到的
    while ((newLegalPosition[pos.side][nextPiecePos] & PositionMask[5]) && pos.board[nextPiecePos] === 0) {
      //capture=true时只生成吃子走法
      SaveMove(moves, pos, piecePos, nextPiecePos, capture)

      nextPiecePos += dir
    }

    //不在棋盘上
    if (!(newLegalPosition[pos.side][nextPiecePos] & PositionMask[5])) {
      return
    }

    //查找能吃的
    nextPiecePos += dir
    while ((newLegalPosition[pos.side][nextPiecePos] & PositionMask[5]) && pos.board[nextPiecePos] === 0) {
      nextPiecePos += dir
    }

    //在棋盘上
    if (newLegalPosition[pos.side][nextPiecePos] & PositionMask[5]) {
      //没有本方棋子
      if (!(pos.board[nextPiecePos] & pos.sideTag)) {
        //capture=true时只生成吃子走法
        SaveMove(moves, pos, piecePos, nextPiecePos, capture)
      }
    }
  })

  //生成了多少步
  return moves.length - movesStartNum
}

exports.canAttackByCannon = function (pos, piecePos, nextPiecePos) {
  //不在棋盘上
  if (!(newLegalPosition[getPieceSide(pos, piecePos).side][nextPiecePos] & PositionMask[4])) {
    return false
  }

  let dir
  //同一行
  if ((nextPiecePos >> 4) === (piecePos >> 4)) {
    dir = nextPiecePos > piecePos ? CannonDir[2] : CannonDir[0]
  }
  //同一列
  else if (nextPiecePos % 16 === piecePos % 16) {
    dir = nextPiecePos > piecePos ? CannonDir[3] : CannonDir[1]
  }
  else {
    return false
  }

  let middlePieceNum = 0

  //判断中间的棋子少于等于1个
  for (let middlePiecePos = piecePos + dir; middlePiecePos !== nextPiecePos; middlePiecePos += dir) {
    if (pos.board[middlePiecePos] !== 0) {
      middlePieceNum++
      if (middlePieceNum === 2) return false
    }
  }

  if (middlePieceNum === 0) {
    return false
  }
  return true
}


//pawn
const PawnDir = [
  [-0x10, -0x01, 0x01],
  [0x10, -0x01, 0x01]
]
const PawnPostion = [
  //white pawn
  [
    0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
    0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
    0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
    0, 0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0, 0,
    0, 0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0, 0,
    0, 0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0, 0,
    0, 0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0, 0,
    0, 0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0, 0,
    0, 0, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 0, 0, 0,
    0, 0, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 0, 0, 0,
    0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
    0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
    0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
    0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
    0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
    0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
  ],

  //black pawn
  [
    0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
    0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
    0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
    0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
    0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
    0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
    0, 0, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 0, 0, 0,
    0, 0, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 0, 0, 0,
    0, 0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0, 0,
    0, 0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0, 0,
    0, 0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0, 0,
    0, 0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0, 0,
    0, 0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0, 0,
    0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
    0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
    0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
  ]
]

exports.PawnMove = function (pos, moves, piecePos, capture = false) {
  const movesStartNum = moves.length
  let thisPawnDir = PawnDir[pos.side]
  // let thisPawnPosition = newLegalPosition[pos.side][nextPiecePos] & PositionMask[5]

  thisPawnDir.forEach((dir, index) => {
    const nextPiecePos = piecePos + dir

    //在兵行动位置棋盘上
    if (newLegalPosition[pos.side][nextPiecePos] & PositionMask[6]) {
      //没有本方棋子
      if (!(pos.board[nextPiecePos] & pos.sideTag)) {
        //是否只生成吃子走法
        if (capture && pos.board[nextPiecePos]) {
          SaveMove(moves, pos, piecePos, nextPiecePos, capture)
          return
        }
        SaveMove(moves, pos, piecePos, nextPiecePos, capture)
      }
    }
  })

  //生成了多少步
  return moves.length - movesStartNum
}

exports.canAttackByPawn = function (pos, piecePos, nextPiecePos) {
  const side = getPieceSide(pos, piecePos).side
  return PawnDir[side].some((dir, index) => {
    //在兵行动位置棋盘上
    if (newLegalPosition[side][nextPiecePos] & PositionMask[6]) {
      //在兵进攻的方向上
      if (piecePos + dir === nextPiecePos) {
        return true
      }
    }
  })
}