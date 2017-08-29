const {
  AlphaBeta,
  AlphaBetaWithHashTable,
  AlphaBetaWithHashTable2
} = require('./search')

const { Move, IntToChar } = require('./util')

function MinMax(pos, maxDepth) {
  let resultMove = null

  const score = (function helper(depth) {
    if (depth === 0) {
      return pos.evaluate()
    }

    let bestMove = null
    let bestScore = -Infinity

    for (let move of pos.generateMoves()) {
      pos.makeMove(move)
      if (pos.isCheck()) {
        pos.unMakeMove()
      } else {
        const score = -helper(depth - 1)
        pos.unMakeMove()
        if (depth === 2) {
          console.log("depth: " + 2)
          console.log(move)
          console.log("from: " + IntToChar(pos.board[move.from]))
          console.log("to: " + IntToChar(pos.board[move.to]))
          console.log(score)
          console.log('==========')
        }
        if (score > bestScore) {
          bestMove = move
          bestScore = score
        }
      }
    }

    if (bestMove == null) {
      return (maxDepth - depth) - checkmatedValue
    }

    if (depth == maxDepth) {
      resultMove = bestMove
    }
    return bestScore
  })(maxDepth)

  return { resultMove, score }
}

const Pos = require('./position')

function logTime(func) {
  const start = Date.now()
  func()
  const end = Date.now()
  console.log((func.name) + " function cost time: " + (end - start) + "ms")
}

let pos = new Pos()

pos.setToOriginal()

// pos.makeMove(new Move(0xa4, 0x94, pos.board[0x34]))

console.log(MinMax(pos, 2))
// console.log(AlphaBeta(pos,2))

// pos.fenToBoard('rnbakabnr/9/1c7/p1p1p1p1p/9/9/P1P1P1P1P/1CN4C1/9/R1BAKABcR w')

// const { resultMove, score } = AlphaBeta(pos, 1)

// console.log(IntToChar(pos.board[resultMove.from]))
// console.log(IntToChar(pos.board[resultMove.to]))

// console.log({resultMove})
// console.log({score})


// pos.setToOriginal()
// console.assert(MinMax(pos, 3).score === AlphaBeta(pos, 3).score)


// // console.log(AlphaBeta(pos, 7))
// // console.log(AlphaBetaWithHashTable(pos, 7))
// console.assert(AlphaBeta(pos, 4).resultMove.equal(AlphaBetaWithHashTable(pos, 4).resultMove))
// console.assert(AlphaBetaWithHashTable(pos, 4).resultMove.equal(AlphaBetaWithHashTable2(pos, 4).resultMove))
// logTime(AlphaBeta.bind(null, pos, 5))
// logTime(AlphaBetaWithHashTable.bind(null, pos, 5))
// logTime(AlphaBetaWithHashTable2.bind(null, pos, 5))

// pos.fenToBoard('3akabR1/9/2n1b4/p1R1p3p/6P2/9/P1P5P/4C4/4c4/2B1KAB2 r')
// console.assert(AlphaBeta(pos, 4).resultMove.equal(AlphaBetaWithHashTable(pos, 4).resultMove))
// console.assert(AlphaBetaWithHashTable(pos, 4).resultMove.equal(AlphaBetaWithHashTable2(pos, 4).resultMove))