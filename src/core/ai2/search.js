const Pos = require('./position')
const { checkmatedValue, winValue, banValue, drawValue } = require('./evaluate')
const { HashTable, hashAlpha, hashBeta, hashExact } = require('./hashtable')
const { Move } = require('./util')

const timeout = 5 * 1000
const timeoutValue = 300000
const limitDepth = 40

//用于判断是否将死
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

let hashTable = new HashTable()
let historyTable = Array.from(Array(256)).map(() => Array.from(Array(256)).map(() => 0))
let killerMove = []
let isFinished = true
let bestMove = null
let searchDepth = 1
const nullDepth = 2

//重置整个搜索
function initial() {
  hashTable = new HashTable()
  historyTable = Array.from(Array(256)).map(() => Array.from(Array(256)).map(() => 0))
  killerMove = []
  isFinished = true
  searchDepth = 20
}

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
      const gap = move1.wvl - move2.wvl
      return gap > 0 ? -1 : gap === 0 ? 0 : 1
    } else if (move1.wvl != null && move2.wvl == null) {
      return -1
    } else if (move2.wvl != null && move1.wvl == null) {
      return 1
    }

    // 历史表排序不吃子走法
    else {
      const gap = historyTable[move1.to][move1.from] - historyTable[move2.to][move2.from]
      return gap > 0 ? -1 : gap === 0 ? 0 : 1
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

//静态搜索
function QuiescentSearch(pos, alpha, beta) {
  const ply = pos.moveStack.length

  //1. 是否走了连续将军的走法，导致局面重复
  const repValue = pos.repValue()
  if (repValue) {
    return repValue
  }

  //2. 局面是否足够好到产生截断
  const score = pos.evaluate()
  if (score >= beta) {
    return score
  }

  //3. 到达了极限深度
  if (ply >= limitDepth) {
    return pos.evaluate()
  }

  //4. 初始化最低值
  let bestScore = score

  //5. 生成能走的走法
  let moves = pos.generateMoves()

  //5.1 是否被将军中
  const isChecking = pos.isChecking()

  //5.2 是否有棋可走，没有则被将死了
  let hasMove = false

  //6. 搜索所有走法
  for (let move of moves) {
    if (pos.makeMove(move)) {
      hasMove = true

      //如果正在被将军，走全部走法，如果没有被将军，走吃子走法
      if (isChecking || move.capture) {
        const score = -QuiescentSearch(pos, -beta, -alpha)
        if (score >= beta) {
          pos.unMakeMove()
          return score
        }

        if (score > bestScore) {
          bestScore = score

          if (score > alpha) {
            alpha = score
          }
        }
      }
      pos.unMakeMove()
    }
  }

  //7. 返回得分，如果没有走法，返回将死得分
  return hasMove ? bestScore : ply - checkmatedValue
}

function PVS(pos, finishTime, alpha = -Infinity, beta = Infinity, depth) {
  // 0. 判断是否超时
  if (Date.now() > finishTime) {
    isFinished = false
    return timeoutValue
  }

  // 1. 查看当前局面是否重复了
  const repValue = pos.repValue()
  if (repValue) {
    return repValue
  }

  //获得pos的zobrist值和当前已经走过的步数
  const zobrist = pos.zobrist
  const ply = pos.moveStack.length

  //2. 查看置换表里是否已经有走法了
  const hashScore = hashTable.readHashTable(zobrist, depth, alpha, beta, ply)
  let hashMv

  if (hashScore != null) {
    //2.1 找到了可用的得分
    if (typeof hashScore === 'number') {
      return hashScore
    }
    //2.2 找到了可用的置换表走法
    else if (hashScore instanceof Move) {
      hashMv = hashScore
    }
  }

  //3. 查看是否到达水平线,小于0是因为空步可能导致深度小于0
  if (depth <= 0) {
    // const eval = QuiescentSearch(pos, alpha, beta)
    const eval = pos.evaluate()
    return eval
  }

  //4. 根据置换表，杀手走法，历史表排序走法
  const moves = pos.generateMoves().sort(sortingMoves(hashMv, ply))

  //5. 按顺序进行pvs-alpha-beta算法
  let pvFlag = 0
  let bestScore = -Infinity
  let exceedAlpha = 0
  let bestMove = null
  for (let move of moves) {
    //如果这个走法是合法的(不会将死自己)
    if (pos.makeMove(move)) {
      let score
      //若是第一个走法，走普通的pvs算法
      if (!pvFlag) {
        score = -PVS(pos, finishTime, -beta, -alpha, depth - 1)
        pvFlag = 1
      }
      //若已经走过至少一个走法，走限制边界的pvs算法
      else {
        //预测下一个走法要么超过beta产生截断，要么比bestScore要差
        score = -PVS(pos, finishTime, -(bestScore + 1), -bestScore, depth - 1)

        //若预测失败，这个走法可能是一个好的走法，那么重新搜索pvs得分
        if (score > bestScore && score < beta) {
          score = -PVS(pos, finishTime, -beta, -alpha, depth - 1)
        }
      }
      pos.unMakeMove()

      //产生beta截断
      if (score >= beta) {
        //保存得分到置换表里
        hashTable.saveHashTable(zobrist, score, depth, hashBeta, move, ply)
        //保存走法到历史表里
        saveGoodMove(move, depth, ply)
        return score
      }

      if (score > bestScore) {
        bestMove = move
        //更新最好的得分
        bestScore = score
        //更新alpha值
        if (score > alpha) {
          alpha = score
          exceedAlpha = 1
        }
      }
    }
  }

  //6. 判断得分

  //6.1 搜完了整棵树
  if (searchDepth === depth) {
    return bestMove
  }

  //6.2 一步都没走,被将死了
  if (!pvFlag) {
    //尽量挣扎的久一点(笑)
    const score = ply - checkmatedValue
    //保存得分
    hashTable.saveHashTable(zobrist, score, depth, hashExact, null, ply)
    return score
  }
  //6.3 有走法
  else {
    //6.3.1走法是准确值，超过了初始alpha
    if (exceedAlpha) {
      hashTable.saveHashTable(zobrist, bestScore, depth, hashExact, bestMove, ply)
      return bestScore
    }
    //6.3.2走法不好，比初始alpha还差
    else {
      hashTable.saveHashTable(zobrist, bestScore, depth, hashAlpha, bestMove, ply)
      return bestScore
    }
  }
}

function ComputerThinkTimer(pos, remainTime = timeout, maxDepth = 20) {
  initial()

  const finishTime = Date.now() + timeout
  let bestMove = null
  for (let i = 1; i <= maxDepth; i++) {
    searchDepth = i
    console.log('=========')
    const resultMove = PVS(pos, finishTime, -Infinity, Infinity, i)

    if (resultMove && isFinished) {
      console.log("搜索层数: " + i)
      console.log(resultMove)
      bestMove = resultMove
    }

    if (Date.now() > finishTime) {
      break
    }
  }
  return bestMove
}

const { IntToChar, getRowAndColumn, InitialBoard } = require('./util')


searchDepth = 6
// console.log(PVS(new Pos('1r2kCb2/4n4/b5c2/p2RR1n1p/2c6/9/P3P3P/4B1N2/9/1r1AKAB2 b'), Date.now() + 10000000, -Infinity, Infinity, 6))

// console.log(IntToChar(new Pos('1r2kCb2/4n4/b5c2/p2RR1n1p/2c6/9/P3P3P/4B1N2/9/1r1AKAB2 b').board[52]))
// console.log(IntToChar(new Pos('1r2kCb2/4n4/b5c2/p2RR1n1p/2c6/9/P3P3P/4B1N2/9/1r1AKAB2 b').board[116]))

module.exports = {
  ComputerThinkTimer,
  MinMax,
  checkmatedValue
}


// function ComputerThinkTimer(pos, remainTime = timeout, maxDepth = 20) {
//   const finishTime = Date.now() + remainTime
//   //置换表
//   const hashTable = new HashTable()
//   //历史表(historyTable[from][to])
//   const historyTable = Array.from(Array(256)).map(() => Array.from(Array(256)).map(() => 0))
//   //杀手走法(保存两个,killerMove[depth][0],killerMove[depth][1])
//   const killerMove = []

//   //对走法进行排序
//   const sortingMoves = (hashMv, ply) => (move1, move2) => {
//     //置换表排序
//     if (move1 === hashMv) {
//       return -1
//     } else if (move2 === hashMv) {
//       return 1
//     }
//     else {
//       //按杀手1排序
//       if (killerMove[ply]) {
//         if (killerMove[ply][0] && killerMove[ply][0].equal(move1)) {
//           return -1
//         } else if (killerMove[ply][0] && killerMove[ply][0].equal(move2)) {
//           return 1
//         }

//         //按杀手2排序
//         if (killerMove[ply][1] && killerMove[ply][1].equal(move1)) {
//           return -1
//         } else if (killerMove[ply][1] && killerMove[ply][1].equal(move2)) {
//           return 1
//         }
//       }

//       //mvv/lva排序吃子走法
//       if (move1.wvl != null && move2.wvl != null) {
//         return move1.wvl - move2.wvl > 0 ? -1 : 1
//       } else if (move1.wvl != null && move2.wvl == null) {
//         return -1
//       } else if (move2.wvl != null && move1.wvl == null) {
//         return 1
//       }

//       //历史表排序不吃子走法
//       else {
//         return historyTable[move1.to][move1.from] - historyTable[move2.to][move2.from] > 0 ? -1 : 1
//       }
//     }
//   }

//   //保存历史表走法，depth是向下的层数，ply是向上的层数
//   function saveGoodMove(mv, depth, ply) {
//     historyTable[mv.from][mv.to] += depth

//     //防止溢出
//     if (historyTable[mv.from][mv.to] > 240) {
//       historyTable.forEach((row, from) => {
//         row.forEach((score, to) => {
//           historyTable[from][to] = score / 4
//         })
//       })
//     }

//     if (killerMove[ply] != null) {
//       killerMove[ply] = [mv, killerMove[ply][0]]
//     } else {
//       killerMove[ply] = [mv]
//     }
//   }

//   let isFinished = true

//   function PVS(pos, maxDepth, initialAlpha = -Infinity, initialBeta = Infinity) {
//     function QuiescentSearch(alpha, beta) {
//       //超过了时间
//       if (Date.now() > finishTime) {
//         isFinished = false
//         return timeoutValue
//       }

//       if (pos.isChecking()) {
//         return pvsAlphabeta(alpha, beta, 1)
//       }

//       const zobrist = pos.zobrist

//       let eval = pos.evaluate()

//       if (eval >= beta) {
//         return eval
//       }
//       if (eval > alpha) {
//         alpha = eval
//       }

//       let unMoveFlag = 1

//       for (let move of pos.generateMoves(true)) {
//         if (pos.makeMove(move)) {
//           //至少走了一步
//           unMoveFlag = 0
//           const score = -QuiescentSearch(-beta, -alpha)
//           pos.unMakeMove()

//           if (score >= beta) {
//             return score
//           }
//           if (score > alpha) {
//             alpha = score
//           }
//         }
//       }

//       if (unMoveFlag) {
//         return pos.moveStack.length - checkmatedValue
//       }

//       return alpha
//     }

//     function pvsAlphabeta(alpha, beta, depth) {
//       if (Date.now() > finishTime) {
//         isFinished = false
//         return timeoutValue
//       }

//       //是否发生重复
//       const repScore = pos.repValue(pos.repStatus())
//       if (repScore) {
//         return repScore
//       }

//       const zobrist = pos.zobrist
//       const ply = pos.moveStack.length

//       //生成置换表裁剪
//       const previousScore = hashTable.readHashTable(zobrist, depth, alpha, beta, pos.moveStack.length)
//       if (typeof previousScore === 'number') {
//         return previousScore
//       }
//       const lastGoodMv = null

//       //到达水平线，采用静态搜索  
//       if (depth <= 0) {
//         // const eval = QuiescentSearch(alpha, beta)
//         const eval = pos.evaluate()
//         hashTable.saveHashTable(zobrist, eval, depth, hashExact, null, pos.moveStack.length)
//         return eval
//       }

//       let bestScore = -Infinity

//       let bestMove = null
//       //是否有更新alpha
//       let alphaFlag = 0
//       //是否一步也没走
//       let unMoveFlag = 1

//       const moves = pos.generateMoves().sort(sortingMoves(lastGoodMv, pos.moveStack.length))

//       //至少要走完一步棋
//       let pvFlag = false

//       for (let move of moves) {
//         if (pos.makeMove(move)) {
//           //走了一步
//           unMoveFlag = 0

//           let score
//           if (pvFlag) {
//             score = -pvsAlphabeta(-alpha - 1, -alpha, depth - 1)
//             if (score > alpha && score < beta) {
//               score = -pvsAlphabeta(-beta, -alpha, depth - 1)
//             }
//           } else {
//             score = -pvsAlphabeta(-beta, -alpha, depth - 1)
//           }
//           pos.unMakeMove()

//           if (score >= beta) {
//             saveGoodMove(move, depth, pos.moveStack.length)
//             hashTable.saveHashTable(zobrist, score, depth, hashBeta, bestMove)
//             return score
//           }

//           if (score > bestScore) {
//             bestMove = move
//             bestScore = score
//           }

//           if (score > alpha) {
//             pvFlag = true
//             alphaFlag = 1
//             alpha = score
//           }
//         }
//       }

//       //到达了根节点
//       if (depth === maxDepth) {
//         resultZobrist = zobrist
//         resultMove = bestMove
//       }

//       //没有走任何棋
//       if (unMoveFlag) {
//         hashTable.saveHashTable(zobrist, pos.moveStack.length - checkmatedValue, depth, hashExact, null, pos.moveStack.length)
//         return pos.moveStack.length - checkmatedValue
//       } else {
//         //是否低于alpha边界
//         if (alphaFlag === 0) {
//           hashTable.saveHashTable(zobrist, bestScore, depth, hashAlpha, bestMove)
//         } else {
//           saveGoodMove(bestMove, depth, pos.moveStack.length)
//           hashTable.saveHashTable(zobrist, alpha, depth, hashExact, bestMove)
//         }
//       }

//       return bestScore
//     }

//     pvsAlphabeta(initialAlpha, initialBeta, maxDepth)

//     return resultMove
//   }

//   let resultMove

//   for (let i = 1; i <= maxDepth; i++) {
//     const bestMove = PVS(pos, i)
//     if (isFinished && bestMove) {
//       console.log(i)
//       resultMove = bestMove
//     }

//     if (Date.now() > finishTime) {
//       break
//     }
//   }

//   return resultMove
// }

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