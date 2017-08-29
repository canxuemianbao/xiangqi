const Pos = require('./position')
const { checkmatedValue, winValue, banValue, drawValue } = require('./evaluate')
const { HashTable, hashAlpha, hashBeta, hashExact } = require('./hashtable')

const timeout = 5 * 1000
const timeoutValue = 300000

function MinMax(pos, maxDepth = 1) {
  let resultMove = null

  const score = (function helper(depth) {
    if (depth === 0) {
      return pos.evaluate()
    }

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

    if (bestMove == null) {
      return (maxDepth - depth) - checkmatedValue
    }

    if (depth == maxDepth) {
      resultMove = bestMove
    }
    return bestScore
  })(maxDepth)

  return resultMove
}

function ComputerThinkTimer(pos, remainTime = timeout, maxDepth = 4) {
  const finishTime = Date.now() + remainTime
  //置换表
  const hashTable = new HashTable()
  //历史表(historyTable[from][to])
  const historyTable = Array.from(Array(256)).map(() => Array.from(Array(256)).map(() => 0))
  //杀手走法(保存两个,killerMove[depth][0],killerMove[depth][1])
  const killerMove = []

  //对走法进行排序
  const sortingMoves = (hashMv, ply) => (move1, move2) => {
    //置换表排序
    if (move1 === hashMv) {
      return -1
    } else if (move2 === hashMv) {
      return 1
    }
    else {
      //按杀手1排序
      if (killerMove[ply]) {
        if (killerMove[ply][0] && killerMove[ply][0].equal(move1)) {
          return -1
        } else if (killerMove[ply][0] && killerMove[ply][0].equal(move2)) {
          return 1
        }

        //按杀手2排序
        if (killerMove[ply][1] && killerMove[ply][1].equal(move1)) {
          return -1
        } else if (killerMove[ply][1] && killerMove[ply][1].equal(move2)) {
          return 1
        }
      }

      //mvv/lva排序吃子走法
      if (move1.wvl != null && move2.wvl != null) {
        return move1.wvl - move2.wvl > 0 ? -1 : 1
      } else if (move1.wvl != null && move2.wvl == null) {
        return -1
      } else if (move2.wvl != null && move1.wvl == null) {
        return 1
      }

      //历史表排序不吃子走法
      else {
        return historyTable[move1.to][move1.from] - historyTable[move2.to][move2.from] > 0 ? -1 : 1
      }
    }
  }

  //保存历史表走法，depth是向下的层数，ply是向上的层数
  function saveGoodMove(mv, depth, ply) {
    historyTable[mv.from][mv.to] += depth

    //防止溢出
    if (historyTable[mv.from][mv.to] > 240) {
      historyTable.forEach((row, from) => {
        row.forEach((score, to) => {
          historyTable[from][to] = score / 4
        })
      })
    }

    if (killerMove[ply] != null) {
      killerMove[ply] = [mv, killerMove[ply][0]]
    } else {
      killerMove[ply] = [mv]
    }
  }

  let isFinished = true

  function PVS(pos, maxDepth, initialAlpha = -Infinity, initialBeta = Infinity) {
    let resultMove = null
    let resultZobrist = null

    function QuiescentSearch(alpha, beta) {
      //超过了时间
      if (Date.now() > finishTime) {
        isFinished = false
        return timeoutValue
      }

      if (pos.isCheck()) {
        return pvsAlphabeta(alpha, beta, 1)
      }

      const zobrist = pos.zobrist

      let eval = pos.evaluate()

      if (eval >= beta) {
        return eval
      }
      if (eval > alpha) {
        alpha = eval
      }

      let unMoveFlag = 1

      for (let move of pos.generateMoves(true)) {
        if (pos.makeMove(move)) {
          //至少走了一步
          unMoveFlag = 0
          const score = -QuiescentSearch(-beta, -alpha)
          pos.unMakeMove()

          if (score >= beta) {
            return score
          }
          if (score > alpha) {
            alpha = score
          }
        }
      }

      if (unMoveFlag) {
        return -checkmatedValue
      }

      return alpha
    }

    function pvsAlphabeta(alpha, beta, depth) {
      if (Date.now() > finishTime) {
        isFinished = false
        return timeoutValue
      }

      const zobrist = pos.zobrist
      const ply = pos.moveStack.length

      //生成置换表裁剪
      const previousScore = hashTable.readHashTable(zobrist, depth, alpha, beta, pos.moveStack.length)
      if (typeof previousScore === 'number') {
        return previousScore
      }
      const lastGoodMv = previousScore

      //到达水平线，采用静态搜索
      if (depth <= 0) {
        // const eval = QuiescentSearch(alpha, beta)
        const eval = pos.evaluate()
        return eval
      }

      // //是否发生重复
      // const repScore = pos.repValue(pos.repStatus())
      // if (repScore) {
      //   return repScore
      // }

      let bestScore = -Infinity

      let bestMove = null
      //是否有更新alpha
      let alphaFlag = 0
      //是否一步也没走
      let unMoveFlag = 1

      const moves = pos.generateMoves().sort(sortingMoves(lastGoodMv, pos.moveStack.length))

      //至少要走完一步棋
      let pvFlag = false

      for (let move of moves) {
        if (pos.makeMove(move)) {
          //走了一步
          unMoveFlag = 0

          let score
          if (pvFlag) {
            score = -pvsAlphabeta(-alpha - 1, -alpha, depth - 1)
            if (score > alpha && score < beta) {
              score = -pvsAlphabeta(-beta, -alpha, depth - 1)
            }
          } else {
            score = -pvsAlphabeta(-beta, -alpha, depth - 1)
          }
          pos.unMakeMove()

          if (score >= beta) {
            saveGoodMove(move, depth, pos.moveStack.length)
            hashTable.saveHashTable(zobrist, score, depth, hashBeta, bestMove)
            return score
          }

          if (score > bestScore) {
            bestMove = move
            bestScore = score
          }

          if (score > alpha) {
            pvFlag = true
            alphaFlag = 1
            alpha = score
          }
        }
      }

      //到达了根节点
      if (depth === maxDepth) {
        resultZobrist = zobrist
        resultMove = bestMove
      }

      //没有走任何棋
      if (unMoveFlag) {
        hashTable.saveHashTable(zobrist, pos.moveStack.length - checkmatedValue, depth, hashExact, null, pos.moveStack.length)
        return pos.moveStack.length - checkmatedValue
      } else {
        //是否低于alpha边界
        if (alphaFlag === 0) {
          hashTable.saveHashTable(zobrist, bestScore, depth, hashAlpha, bestMove)
        } else {
          saveGoodMove(bestMove, depth, pos.moveStack.length)
          hashTable.saveHashTable(zobrist, alpha, depth, hashExact, bestMove)
        }
      }

      return bestScore
    }

    pvsAlphabeta(initialAlpha, initialBeta, maxDepth)

    return resultMove
  }

  let resultMove
  console.log(PVS(pos, 1))
  // console.log(PVS(pos, 4))
  for (let i = 1; i <= 3; i++) {
    // console.log(i)
    let bestMove = PVS(pos, i)
    if(!bestMove){
      console.log(i)
    }
    console.log(bestMove)
    if (isFinished) {
      resultMove = bestMove
    }

    if (Date.now() > finishTime) {
      break
    }
  }

  return resultMove
}

module.exports = {
  ComputerThinkTimer,
  MinMax,
  checkmatedValue
}


// //空着裁剪减少两层
// const nullDepth = 2

// function AlphaBeta(pos, maxDepth = 2, initialAlpha = -Infinity, initialBeta = Infinity) {
//   let resultMove = null
//   let isFinished = true

//   const score = (function helper(alpha, beta, depth) {
//     if (depth <= 0) {
//       return pos.evaluate()
//     }

//     let bestMove = null
//     //是否有更新alpha
//     let alphaFlag = 0
//     //是否一步也没走
//     let unMoveFlag = 1

//     for (let move of pos.generateMoves()) {
//       pos.makeMove(move)
//       if (pos.isCheck()) {
//         pos.unMakeMove()
//       } else {
//         unMoveFlag = 0
//         const score = -helper(-beta, -alpha, depth - 1)
//         pos.unMakeMove()

//         if (score >= beta) {
//           return beta
//         }

//         if (score > alpha) {
//           bestMove = move
//           alphaFlag = 1
//           alpha = score
//         }
//       }
//     }

//     //到达根节点
//     if (depth === maxDepth) {
//       console.log(alpha)
//       resultMove = bestMove
//     }

//     //没有走任何棋
//     if (unMoveFlag) {
//       return (maxDepth - depth) - checkmatedValue
//     }

//     return alpha
//   })(initialAlpha, initialBeta, maxDepth)

//   return { resultMove, score, isFinished }
// }

// function AlphaBetaWithHashTable(pos, maxDepth, remainTime = timeout, initialAlpha = -Infinity, initialBeta = Infinity) {
//   let resultMove = null
//   let isFinished = true

//   let start = Date.now()

//   const hashTable = new HashTable()

//   const score = (function helper(alpha, beta, depth) {
//     //超过了时间
//     if (Date.now() - start > remainTime) {
//       isFinished = false
//       return timeoutValue
//     }

//     const zobrist = pos.zobrist

//     //获得之前的值
//     const previousScore = hashTable.readHashTable(zobrist, depth, alpha, beta, pos.moveStack.length)
//     if (typeof previousScore === 'number') {
//       return previousScore
//     }

//     if (depth <= 0) {
//       const eval = pos.evaluate()
//       hashTable.saveHashTable(zobrist, eval, depth, hashExact, null)
//       return eval
//     }

//     let bestMove = null
//     //是否有更新alpha
//     let alphaFlag = 0
//     //是否一步也没走
//     let unMoveFlag = 1

//     for (let move of pos.generateMoves()) {
//       pos.makeMove(move)
//       if (pos.isCheck()) {
//         pos.unMakeMove()
//       } else {
//         //走了至少一步
//         unMoveFlag = 0
//         const score = -helper(-beta, -alpha, depth - 1)
//         pos.unMakeMove()

//         if (score >= beta) {
//           hashTable.saveHashTable(zobrist, beta, depth, hashBeta, bestMove)
//           return beta
//         }

//         if (score > alpha) {
//           bestMove = move
//           alphaFlag = 1
//           alpha = score
//         }
//       }
//     }

//     //到达根节点
//     if (depth === maxDepth) {
//       resultMove = bestMove
//     }

//     //没有走任何棋
//     if (unMoveFlag) {
//       hashTable.saveHashTable(zobrist, pos.moveStack.length - checkmatedValue, depth, hashExact, null, pos.moveStack.length)
//       return pos.moveStack.length - checkmatedValue
//     } else {
//       //是否低于alpha边界
//       if (alphaFlag === 0) {
//         hashTable.saveHashTable(zobrist, alpha, depth, hashAlpha, bestMove)
//       } else {
//         hashTable.saveHashTable(zobrist, alpha, depth, hashExact, bestMove)
//       }
//     }
//     return alpha
//   })(initialAlpha, initialBeta, maxDepth)

//   return { resultMove, score, isFinished }
// }

// //超过边界的
// function AlphaBetaWithHashTable2(pos, maxDepth, finishTime = Date.now() + timeout, initialAlpha = -Infinity, initialBeta = Infinity) {
//   let resultMove = null
//   let isFinished = true

//   const hashTable = new HashTable()

//   function AlphaBeta(alpha, beta, depth) {
//     //超过了时间
//     if (Date.now() > finishTime) {
//       isFinished = false
//       return timeoutValue
//     }

//     const zobrist = pos.zobrist

//     //获得之前的值
//     const previousScore = hashTable.readHashTable(zobrist, depth, alpha, beta, pos.moveStack.length)
//     if (typeof previousScore === 'number') {
//       return previousScore
//     }

//     if (depth <= 0) {
//       const eval = QuiescentSearch(alpha, beta)
//       hashTable.saveHashTable(zobrist, eval, depth, hashExact, null)
//       return eval
//     }

//     let bestScore = -Infinity

//     let bestMove = null
//     //是否有更新alpha
//     let alphaFlag = 0
//     //是否一步也没走
//     let unMoveFlag = 1

//     for (let move of pos.generateMoves()) {
//       pos.makeMove(move)
//       if (pos.isCheck()) {
//         pos.unMakeMove()
//       } else {
//         //走了至少一步
//         unMoveFlag = 0
//         const score = -AlphaBeta(-beta, -alpha, depth - 1)
//         pos.unMakeMove()

//         if (score >= beta) {
//           hashTable.saveHashTable(zobrist, score, depth, hashBeta, bestMove)
//           return beta
//         }

//         if (score > bestScore) {
//           bestMove = move
//           bestScore = score
//         }

//         if (score > alpha) {
//           alphaFlag = 1
//           alpha = score
//         }
//       }
//     }

//     if (depth === maxDepth) {
//       resultMove = bestMove
//     }

//     //没有走任何棋
//     if (unMoveFlag) {
//       hashTable.saveHashTable(zobrist, pos.moveStack.length - checkmatedValue, depth, hashExact, null, pos.moveStack.length)
//       return pos.moveStack.length - checkmatedValue
//     } else {
//       //是否低于alpha边界
//       if (alphaFlag === 0) {
//         hashTable.saveHashTable(zobrist, bestScore, depth, hashAlpha, bestMove)
//       } else {
//         hashTable.saveHashTable(zobrist, alpha, depth, hashExact, bestMove)
//       }

//     }
//     return alpha
//   }

//   const score = AlphaBeta(initialAlpha, initialBeta, maxDepth)

//   function QuiescentSearch(alpha, beta) {
//     //超过了时间
//     if (Date.now() > finishTime) {
//       isFinished = false
//       return timeoutValue
//     }

//     if (pos.isCheck()) {
//       return AlphaBeta(alpha, beta, 1)
//     }

//     const zobrist = pos.zobrist

//     let eval = pos.evaluate()

//     if (eval >= beta) {
//       return eval
//     }
//     if (eval > alpha) {
//       alpha = eval
//     }

//     let unMoveFlag = 1

//     for (let move of pos.generateMoves(true)) {
//       pos.makeMove(move)
//       if (pos.isCheck()) {
//         pos.unMakeMove()
//       } else {
//         //至少走了一步
//         unMoveFlag = 0
//         const score = -QuiescentSearch(-beta, -alpha)
//         pos.unMakeMove()

//         if (score >= beta) {
//           return score
//         }
//         if (score > alpha) {
//           alpha = score
//         }
//       }
//     }

//     if(unMoveFlag){
//       return -checkmatedValue
//     }

//     return alpha
//   }

//   return { resultMove, score, isFinished }
// }

// //迭代加深
// function ComputerThinkTimer(pos, currentMoveNum, timeLimit = 80 * (10 * 1000), maxDepth = 20) {
//   //步数50，步数60，步数80
//   const moveNumLimits = [[50, 60], [60, 80], [80, 100]]
//   const moveNumLimit = moveNumLimits.find(([moveNum, moveLimit]) => currentMoveNum < moveNum)[1]

//   const moveRemainTime = timeLimit / (moveNumLimit - currentMoveNum)

//   const startTime = Date.now()
//   let bestMove
//   for (let depth = 1; depth <= maxDepth; depth++) {
//     const { resultMove, isFinished, score } = AlphaBetaWithHashTable2(pos, depth, startTime + moveRemainTime)

//     console.log("depth: " + depth)
//     if (Date.now() - startTime > moveRemainTime) {
//       break
//     } else {
//       bestMove = resultMove
//     }
//   }

//   return bestMove
// }

// module.exports = {
//   AlphaBeta,
//   AlphaBetaWithHashTable,
//   AlphaBetaWithHashTable2,
//   ComputerThinkTimer,
//   nullDepth
// }