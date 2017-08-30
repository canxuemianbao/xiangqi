const {
  InitialBoard,
  CharToInt,
  IntToChar,
  Move,
  KnightMove,
  KingMove,
  AdvisorMove,
  BishopMove,
  RookMove,
  CannonMove,
  PawnMove,
  canAttackByKnight,
  canAttackByRook,
  canAttackByCannon,
  canAttackByPawn
} = require('./util')

const Pos = require('./position')

class Sg_searchNode {
  constructor(counter = 0, alphaNodes = 0, betaNodes = 0, pvNodes = 0, evalNodes = 0, hashNodes = 0, deadNodes = 0) {
    this.counter = counter
    this.alphaNodes = alphaNodes
    this.betaNodes = betaNodes
    this.pvNodes = pvNodes
    this.evalNodes = evalNodes
    this.hashNodes = hashNodes
    this.deadNodes = deadNodes
  }
}

function MinMaxTest(sg_searchNode, pos, maxDepth) {
  let resultMove = null

  const score = (function helper(depth) {
    if (depth <= 0) {
      sg_searchNode.evalNodes++
      return pos.evaluate()
    }

    sg_searchNode.counter++

    let bestMove = null
    let bestScore = -Infinity

    for (let move of pos.generateMoves()) {
      if (pos.makeMove(move)) {
        const score = -helper(depth - 1)
        pos.unMakeMove()

        if (score > bestScore) {
          bestMove = move
          bestScore = score
        }
      }
    }

    if (depth == maxDepth) {
      resultMove = bestMove
    }

    if (bestScore == -Infinity) {
      sg_searchNode.deadNodes++
      return (maxDepth - depth) - checkmatedValue
    }

    return bestScore
  })(maxDepth)

  return resultMove
}

describe("position", function () {
  let sg_searchNode = new Sg_searchNode()

  beforeEach(function () {
    sg_searchNode = new Sg_searchNode()
  })

  describe("fen = rnbakabnr/9/1c5c1/p1p1p1p1p/9/9/P1P1P1P1P/1C5C1/9/RNBAKABNR w", function () {
    let pos = Pos.setToOriginal()
    beforeEach(function () {
      sg_searchNode = new Sg_searchNode()
    })

    it("should pass perft", function () {
      MinMaxTest(sg_searchNode, pos, 1)
      console.assert(sg_searchNode.evalNodes === 44)
    })

    it("should pass perft", function () {
      MinMaxTest(sg_searchNode, pos, 2)
      console.assert(sg_searchNode.evalNodes === 1920)
    })

    it("should pass perft", function () {
      MinMaxTest(sg_searchNode, pos, 3)
      console.assert(sg_searchNode.evalNodes === 79666)
    })
  })

  describe("fen = 3akabR1/9/2n1b4/p1R1p3p/6P2/9/P1P5P/4C4/4c4/2B1KAB2 w", function () {
    let pos
    beforeEach(function () {
      pos = new Pos('3akabR1/9/2n1b4/p1R1p3p/6P2/9/P1P5P/4C4/4c4/2B1KAB2 w')
      sg_searchNode = new Sg_searchNode()
    })

    it("should pass perft", function () {
      MinMaxTest(sg_searchNode, pos, 1)
      console.assert(sg_searchNode.evalNodes === 41)
    })

    it("should pass perft", function () {
      MinMaxTest(sg_searchNode, pos, 2)
      console.assert(sg_searchNode.evalNodes === 792)
    })

    it("should pass perft", function () {
      MinMaxTest(sg_searchNode, pos, 3)
      console.assert(sg_searchNode.evalNodes === 33531)
    })
  })
})

// let sg_searchNode = new Sg_searchNode()

// let pos = new Pos()


// MinMaxTest(sg_searchNode, pos, 1)
// console.assert(sg_searchNode.evalNodes === 44)

// pos.fenToBoard('3akabr1/9/2n1b4/p1r1p3p/6p2/9/p1p5p/4c4/4c4/2b1kab2 r')
// sg_searchNode = new Sg_searchNode()
// MinMaxTest(sg_searchNode, pos, 1)
// console.assert(sg_searchNode.evalNodes === 41)

// function main(fileName, func) {
//   let resultInfo = ''
//   const name = ['开局', '中局', '残局'];

//   [fen1, fen2, fen3].forEach((fen, index) => {
//     const pos = new Pos()
//     pos.fenToBoard(fen)

//     resultInfo += `${name[index]}(fen为:${fen})\n\n`

//     for (let i = 3; i < 6; i++) {
//       const sg_searchNode = new Sg_searchNode()

//       const start = Date.now()
//       const move = func(sg_searchNode, pos, i)
//       const end = Date.now()

//       if (move) {
//         resultInfo += `depth = ${i}, bestMove = from ${move.from} to ${move.to}`
//         if (move.capture) {
//           resultInfo += `, capture = ${move.capture}`
//         }
//       } else {
//         resultInfo += `depth = ${i}, bestMove = null, because computer is checked in this depth`
//       }

//       resultInfo += `\n 花费时间为${end - start}ms \n`

//       resultInfo += `
//         counter      =      ${sg_searchNode.counter}
//         evalNodes    =      ${sg_searchNode.evalNodes}
//         betaNodes    =      ${sg_searchNode.betaNodes}
//         pvNodes      =      ${sg_searchNode.pvNodes}
//         alphaNodes   =      ${sg_searchNode.alphaNodes}
//         hashNodes    =      ${sg_searchNode.hashNodes}
//         deadNodes    =      ${sg_searchNode.deadNodes}`

//       resultInfo += '\n'
//       resultInfo += '\n'
//     }
//   })
// }


// const Pos = require('./position')

// const initialFen = 'rnbakabnr/9/1c5c1/p1p1p1p1p/9/9/P1P1P1P1P/1C5C1/9/RNBAKABNR w'

// let pos = new Pos()
// //fen
// pos.setToOriginal()

// console.assert(pos.toFen() === initialFen)
// pos.fenToBoard(initialFen)
// console.assert(pos.toFen() === initialFen)
// pos.fenToBoard('1nbakabnr/9/1c5c1/p1p1p1p2/9/9/P1P1P1P1P/1C5C1/9/RNBAKABN1 b')
// console.assert(pos.toFen() === '1nbakabnr/9/1c5c1/p1p1p1p2/9/9/P1P1P1P1P/1C5C1/9/RNBAKABN1 b')

// //move
// pos.fenToBoard(initialFen)
// //knight move
// function move(moveFunc, piecePos) {
//   let moves = []

//   let pos = new Pos()
//   pos.fenToBoard(initialFen)
//   //knight
//   moveFunc(pos, moves, piecePos)

//   return moves.length
// }

// //马在初始位置
// console.assert(move(KnightMove, 0xc4) === 2)

// //马在左边车的位置
// console.assert(move(KnightMove, 0xc3) === 0)

// //马在对面车的位置
// console.assert(move(KnightMove, 0x33) === 1)

// //马在能走全部位置的位置
// console.assert(move(KnightMove, 0x56) === 8)

// // king move
// console.assert(move(KingMove, 0xb0) === 0)
// console.assert(move(KingMove, 0xc7) === 1)
// console.assert(move(KingMove, 0xb7) === 3)
// console.assert(move(KingMove, 0x37) === 0)
// console.assert(move(KingMove, 0x47) === 0)

// //advisor move
// console.assert(move(AdvisorMove, 0xb0) === 0)
// console.assert(move(AdvisorMove, 0xc6) === 1)
// console.assert(move(AdvisorMove, 0xb7) === 2)
// console.assert(move(AdvisorMove, 0x36) === 0)
// console.assert(move(AdvisorMove, 0x47) === 0)

// //bishop move
// console.assert(move(BishopMove, 0xb0) === 0)
// console.assert(move(BishopMove, 0xc5) === 2)

// //rook move 
// console.assert(move(RookMove, 0x33) === 4)
// console.assert(move(RookMove, 0x43) === 11)
// console.assert(move(RookMove, 0xb3) === 9)

// //can move
// console.assert(move(CannonMove, 0x33) === 3)
// console.assert(move(CannonMove, 0xa4) === 12)
// console.assert(move(CannonMove, 0xa5) === 6)
// console.assert(move(CannonMove, 0x85) === 10)

// //pawn move
// console.assert(move(PawnMove, 0x33) === 1)
// console.assert(move(PawnMove, 0x93) === 1)
// console.assert(move(PawnMove, 0x95) === 1)
// console.assert(move(PawnMove, 0x84) === 3)

// console.assert(pos.generateMoves().length === 44)
// pos.changeSide()
// console.assert(pos.generateMoves().length === 44)

// pos.changeSide()
// pos.fenToBoard('3akabR1/9/2n1b4/p1R1p3p/6P2/9/P1P5P/4C4/4c4/2B1KAB2 r')

// console.assert(pos.generateMoves().length === 41)

// function canAttackBy(attackFunc, piecePos, nextPiecePos) {
//   let pos = new Pos()
//   pos.fenToBoard(initialFen)

//   return attackFunc(pos, piecePos, nextPiecePos)
// }

// //knight
// console.assert(canAttackBy(canAttackByKnight, 0x53, 0x34) === true)
// console.assert(canAttackBy(canAttackByKnight, 0x53, 0x65) === false)
// console.assert(canAttackBy(canAttackByKnight, 0x53, 0x74) === false)

// //rook
// console.assert(canAttackBy(canAttackByRook, 0x53, 0x43) === true)
// console.assert(canAttackBy(canAttackByRook, 0x53, 0x33) === true)
// console.assert(canAttackBy(canAttackByRook, 0x53, 0x54) === true)
// console.assert(canAttackBy(canAttackByRook, 0x53, 0x55) === false)
// console.assert(canAttackBy(canAttackByRook, 0x53, 0x73) === false)
// console.assert(canAttackBy(canAttackByRook, 0x53, 0x75) === false)
// console.assert(canAttackBy(canAttackByRook, 0x73, 0x93) === true)

// //cannon
// console.assert(canAttackBy(canAttackByCannon, 0x53, 0x43) === false)
// console.assert(canAttackBy(canAttackByCannon, 0x53, 0x33) === false)
// console.assert(canAttackBy(canAttackByCannon, 0x53, 0x54) === false)
// console.assert(canAttackBy(canAttackByCannon, 0x53, 0x55) === true)
// console.assert(canAttackBy(canAttackByCannon, 0x53, 0x73) === true)
// console.assert(canAttackBy(canAttackByCannon, 0x53, 0x75) === false)
// console.assert(canAttackBy(canAttackByCannon, 0x73, 0x93) === false)
// console.assert(canAttackBy(canAttackByCannon, 0x73, 0xc3) === true)

// //pawn
// console.assert(canAttackBy(canAttackByPawn, 0x53, 0x43) === true)
// console.assert(canAttackBy(canAttackByPawn, 0x53, 0x33) === false)
// console.assert(canAttackBy(canAttackByPawn, 0x53, 0x54) === true)
// console.assert(canAttackBy(canAttackByPawn, 0x53, 0x52) === false)

// //ischeck
// console.assert(pos.isCheck() === false)
// pos.fenToBoard("rnbakabnr/9/1c5c1/9/9/9/9/1C5C1/9/RNBAKABNR w")
// console.assert(pos.isCheck() === true)
// pos.fenToBoard("rnbakabnr/4R4/1c5c1/9/9/9/9/1C5C1/9/RNBAKABN1 w")
// console.assert(pos.isCheck() === true)

// pos.setToOriginal()

// //makeMove
// move = pos.generateMoves()[0]

// pos.makeMove(move)
// pos.unMakeMove()

// console.assert(pos.toFen() === initialFen)

// move = pos.generateMoves()[0]

// pos.makeMove(move)

// move = pos.generateMoves()[0]

// pos.makeMove(move)

// pos.unMakeMove()
// pos.unMakeMove()

// console.assert(pos.toFen() === initialFen)