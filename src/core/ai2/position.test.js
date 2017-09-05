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

const { fens } = require('./testData')

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

    it("should pass perft when depth = 1", function () {
      MinMaxTest(sg_searchNode, pos, 1)
      console.assert(sg_searchNode.evalNodes === 44)
    })

    it("should pass perft when depth = 2", function () {
      MinMaxTest(sg_searchNode, pos, 2)
      console.assert(sg_searchNode.evalNodes === 1920)
    })

    it("should pass perft when depth = 3", function () {
      MinMaxTest(sg_searchNode, pos, 3)
      console.assert(sg_searchNode.evalNodes === 79666)
    })

    it("should pass perft when depth = 4", function () {
      // MinMaxTest(sg_searchNode, pos, 4)
      // console.assert(sg_searchNode.evalNodes === 3290240)
    })
  })

  describe("fen = 3akabR1/9/2n1b4/p1R1p3p/6P2/9/P1P5P/4C4/4c4/2B1KAB2 w", function () {
    let pos
    beforeEach(function () {
      pos = new Pos('3akabR1/9/2n1b4/p1R1p3p/6P2/9/P1P5P/4C4/4c4/2B1KAB2 w')
      sg_searchNode = new Sg_searchNode()
    })

    it("should pass perft when depth = 1", function () {
      MinMaxTest(sg_searchNode, pos, 1)
      console.assert(sg_searchNode.evalNodes === 41)
    })

    it("should pass perft when depth = 2", function () {
      MinMaxTest(sg_searchNode, pos, 2)
      console.assert(sg_searchNode.evalNodes === 792)
    })

    it("should pass perft when depth = 3", function () {
      MinMaxTest(sg_searchNode, pos, 3)
      console.assert(sg_searchNode.evalNodes === 33531)
    })

    it("should pass perft when depth = 4", function () {
      // MinMaxTest(sg_searchNode, pos, 4)
      // console.assert(sg_searchNode.evalNodes === 721197)
    })
  })

  describe('makeMove', function () {
    const move1 = new Move(121,169,21,0)
    const move2 = new Move(153,169,21,-2)
    
    const pos = new Pos(fens[6])

    const firstZobrist1 = pos.zobrist

    pos.makeMove(move1)
    const zobrist1 = pos.zobrist
    pos.unMakeMove()

    const firstZobrist2 = pos.zobrist
    pos.makeMove(move2)
    const zobrist2 = pos.zobrist
    pos.unMakeMove()

    const firstZobrist3 = pos.zobrist
    console.assert(firstZobrist1.equal(firstZobrist2))
    console.assert(firstZobrist2.equal(firstZobrist3))
    console.assert(!zobrist1.equal(zobrist2))
  })
})