const { Rook, Knight, Bishop, Advisor, King, Can, Pawn } = require("./chess")
const { KingPawnMidgameAttackless, AdvisorBishopThreatless, KnightMidgame, CannonMidgame, RookMidgame } = require("./preeval")

const red = true
const black = false

const chessesEval = new Map()

const redRooks = [
  new Rook(9, 0, red),
  new Rook(9, 8, red),
]

chessesEval.set(redRooks[0], RookMidgame)
chessesEval.set(redRooks[1], RookMidgame)

const redKnights = [
  new Knight(9, 1, red),
  new Knight(9, 7, red),
]

chessesEval.set(redKnights[0], KnightMidgame)
chessesEval.set(redKnights[1], KnightMidgame)

const redBishops = [
  new Bishop(9, 2, red),
  new Bishop(9, 6, red),
]

chessesEval.set(redBishops[0], AdvisorBishopThreatless)
chessesEval.set(redBishops[1], AdvisorBishopThreatless)

const redAdvisors = [
  new Advisor(9, 3, red),
  new Advisor(9, 5, red),
]

chessesEval.set(redAdvisors[0], AdvisorBishopThreatless)
chessesEval.set(redAdvisors[1], AdvisorBishopThreatless)

const redKing = new King(9, 4, red)

chessesEval.set(redKing, KingPawnMidgameAttackless)

const redCans = [
  new Can(7, 1, red),
  new Can(7, 7, red)
]

chessesEval.set(redCans[0], CannonMidgame)
chessesEval.set(redCans[1], CannonMidgame)

const redPawns = [
  new Pawn(6, 0, red),
  new Pawn(6, 2, red),
  new Pawn(6, 4, red),
  new Pawn(6, 6, red),
  new Pawn(6, 8, red)
]

chessesEval.set(redPawns[0], KingPawnMidgameAttackless)
chessesEval.set(redPawns[1], KingPawnMidgameAttackless)
chessesEval.set(redPawns[2], KingPawnMidgameAttackless)
chessesEval.set(redPawns[3], KingPawnMidgameAttackless)
chessesEval.set(redPawns[4], KingPawnMidgameAttackless)

const redChesses = [
  ...redRooks,
  ...redKnights,
  ...redBishops,
  ...redAdvisors,
  redKing,
  ...redCans,
  ...redPawns
]

//black
const blackRooks = [
  new Rook(0, 0, black),
  new Rook(0, 8, black),
]

chessesEval.set(blackRooks[0], RookMidgame.slice().reverse())
chessesEval.set(blackRooks[1], RookMidgame.slice().reverse())

const blackKnights = [
  new Knight(0, 1, black),
  new Knight(0, 7, black),
]

chessesEval.set(blackKnights[0], KnightMidgame.slice().reverse())
chessesEval.set(blackKnights[1], KnightMidgame.slice().reverse())

const blackBishops = [
  new Bishop(0, 2, black),
  new Bishop(0, 6, black),
]

chessesEval.set(blackBishops[0], AdvisorBishopThreatless.slice().reverse())
chessesEval.set(blackBishops[1], AdvisorBishopThreatless.slice().reverse())

const blackAdvisors = [
  new Advisor(0, 3, black),
  new Advisor(0, 5, black),
]

chessesEval.set(blackAdvisors[0], AdvisorBishopThreatless.slice().reverse())
chessesEval.set(blackAdvisors[1], AdvisorBishopThreatless.slice().reverse())

const blackKing = new King(0, 4, black)
chessesEval.set(blackKing, KingPawnMidgameAttackless.slice().reverse())

const blackCans = [
  new Can(2, 1, black),
  new Can(2, 7, black)
]

chessesEval.set(blackCans[0], CannonMidgame.slice().reverse())
chessesEval.set(blackCans[1], CannonMidgame.slice().reverse())

const blackPawns = [
  new Pawn(3, 0, black),
  new Pawn(3, 2, black),
  new Pawn(3, 4, black),
  new Pawn(3, 6, black),
  new Pawn(3, 8, black)
]

chessesEval.set(blackPawns[0], KingPawnMidgameAttackless.slice().reverse())
chessesEval.set(blackPawns[1], KingPawnMidgameAttackless.slice().reverse())
chessesEval.set(blackPawns[2], KingPawnMidgameAttackless.slice().reverse())
chessesEval.set(blackPawns[3], KingPawnMidgameAttackless.slice().reverse())
chessesEval.set(blackPawns[4], KingPawnMidgameAttackless.slice().reverse())

const blackChesses = [
  ...blackRooks,
  ...blackKnights,
  ...blackBishops,
  ...blackAdvisors,
  blackKing,
  ...blackCans,
  ...blackPawns
]

function generateChess(fen, x, y, fenNum) {
  //black
  if (fen === 'k') {
    blackKing.x = x
    blackKing.y = y
    return blackKing
  } else if (fen === 'a') {
    blackAdvisors[fenNum].x = x
    blackAdvisors[fenNum].y = y
    return blackAdvisors[fenNum]
  } else if (fen === 'b') {
    blackBishops[fenNum].x = x
    blackBishops[fenNum].y = y
    return blackBishops[fenNum]
  } else if (fen === 'n') {
    blackKnights[fenNum].x = x
    blackKnights[fenNum].y = y
    return blackKnights[fenNum]
  } else if (fen === 'r') {
    blackRooks[fenNum].x = x
    blackRooks[fenNum].y = y
    return blackRooks[fenNum]
  } else if (fen === 'c') {
    blackCans[fenNum].x = x
    blackCans[fenNum].y = y
    return blackCans[fenNum]
  } else if (fen === 'p') {
    blackPawns[fenNum].x = x
    blackPawns[fenNum].y = y
    return blackPawns[fenNum]
  }

  //red
  else if (fen === 'K') {
    redKing.x = x
    redKing.y = y
    return redKing
  } else if (fen === 'A') {
    redAdvisors[fenNum].x = x
    redAdvisors[fenNum].y = y
    return redAdvisors[fenNum]
  } else if (fen === 'B') {
    redBishops[fenNum].x = x
    redBishops[fenNum].y = y
    return redBishops[fenNum]
  } else if (fen === 'N') {
    redKnights[fenNum].x = x
    redKnights[fenNum].y = y
    return redKnights[fenNum]
  } else if (fen === 'R') {
    redRooks[fenNum].x = x
    redRooks[fenNum].y = y
    return redRooks[fenNum]
  } else if (fen === 'C') {
    redCans[fenNum].x = x
    redCans[fenNum].y = y
    return redCans[fenNum]
  } else if (fen === 'P') {
    redPawns[fenNum].x = x
    redPawns[fenNum].y = y
    return redPawns[fenNum]
  }
}


class Zobrist {
  constructor(first, second, thrid, last) {
    this.first = first
    this.second = second
    this.thrid = thrid
    this.last = last
  }

  xor(zobrist) {
    return new Zobrist(zobrist.first ^ this.first, zobrist.second ^ this.second, zobrist.thrid ^ this.thrid, zobrist.last ^ this.last)
  }

  equal(zobrist) {
    return this.first === zobrist.first && this.second === zobrist.second && this.thrid === zobrist.thrid && this.last === zobrist.last
  }

  valueOf() {
    return Number(this.first).toString(2) + Number(this.second).toString(2) + Number(this.thrid).toString(2) + Number(this.last).toString(2)
  }
}

function generateRandomNum() {
  return Math.floor(Math.random() * (Math.pow(2, 16) + 1))
}

function generateZobrist() {
  let result = []

  for (let i = 0; i < 10; i++) {
    result[i] = []
    for (let j = 0; j < 9; j++) {
      const first = generateRandomNum()
      const second = generateRandomNum()
      const thrid = generateRandomNum()
      const last = generateRandomNum()

      result[i][j] = new Zobrist(first, second, thrid, last)
    }
  }
  return result
}

const redChessesZobrist = new Map()

redChesses.forEach((chess) => {
  redChessesZobrist.set(chess, generateZobrist())
})


const blackChessesZobrist = new Map()

blackChesses.forEach((chess) => {
  blackChessesZobrist.set(chess, generateZobrist())
})

const chessesZobrist = new Map([...redChessesZobrist, ...blackChessesZobrist])

const checkmatedValue = 1000000
const max_ply = 100
module.exports = {
  redRooks,
  redKnights,
  redBishops,
  redAdvisors,
  redKing,
  redCans,
  redPawns,
  redChesses,

  blackRooks,
  blackKnights,
  blackBishops,
  blackAdvisors,
  blackKing,
  blackCans,
  blackPawns,
  blackChesses,
  
  generateChess,
  checkmatedValue,
  generateZobrist,
  max_ply,
  chessesZobrist,
  Zobrist,
  chessesEval
}