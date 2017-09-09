const Pos = require('./position')
const { checkmatedValue, winValue, banValue, drawValue } = require('./evaluate')
const { HashTable, hashAlpha, hashBeta, hashExact } = require('./hashtable')
const { Move } = require('./util')

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

const timeout = 5 * 1000
const timeoutValue = 300000
const limitDepth = 40
const nullDepth = 2
const hashFakeDepth = 50

let hashTable = new HashTable()
let quiescentHashTable = new HashTable()
let fullHistoryTable = Array.from(Array(256)).map(() => Array.from(Array(256)).map(() => 0))
let quiescentHistoryTable = Array.from(Array(256)).map(() => Array.from(Array(256)).map(() => 0))
let killerMove = []
let quiescentKillerMove = []
let isFinished = true
let bestMove = null
let searchDepth = 1


//重置整个搜索
function initial() {
  hashTable = new HashTable()
  quiescentHashTable = new HashTable()
  fullHistoryTable = Array.from(Array(256)).map(() => Array.from(Array(256)).map(() => 0))
  quiescentHistoryTable = Array.from(Array(256)).map(() => Array.from(Array(256)).map(() => 0))
  killerMove = []
  quiescentKillerMove = []
  isFinished = true
  searchDepth = 1
  bestMove = null
}

//对走法进行排序
const sortingMoves = (hashMv, ply, historyTable = fullHistoryTable) => (move1, move2) => {
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
      const gap = historyTable[move1.from][move1.to] - historyTable[move2.from][move2.to]
      return gap > 0 ? -1 : gap === 0 ? 0 : 1
    }
  }
}

//保存历史表走法，depth是向下的层数，ply是向上的层数
function saveGoodMove(mv, depth, ply, historyTable = fullHistoryTable) {
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
function PVSQuiescentSearch(pos, finishTime, alpha = -Infinity, beta = Infinity) {
  // 0. 判断是否超时
  if (Date.now() > finishTime) {
    isFinished = false
    return timeoutValue
  }

  //1. 是否走了连续将军的走法，导致局面重复
  const repValue = pos.repValue()
  if (repValue) {
    return repValue
  }

  //获得pos的zobrist值和当前已经走过的步数
  const zobrist = pos.zobrist
  const ply = pos.moveStack.length
  //2. 查看置换表里是否已经有走法了
  const hashScore = quiescentHashTable.readHashTable(zobrist, hashFakeDepth, alpha, beta, ply)
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
  let moves = pos.generateMoves().sort(sortingMoves(hashMv, ply, quiescentHistoryTable))

  //5.1 是否被将军中
  const isChecked = pos.isChecked()

  //6. 搜索所有走法

  //6.1 是否有棋可走，没有则被将死了
  let hasMove = false
  //6.2 是否是超过了alpha值（是pv值）
  let exceedAlpha = bestScore > alpha
  //6.3 是否走了至少一步（吃子或者解将）
  let pvFlag = false
  //6.4 最佳走法
  let bestMove

  for (let move of moves) {
    if (pos.makeMove(move)) {
      hasMove = true

      //如果正在被将军，走全部走法，如果没有被将军，走吃子走法
      if (isChecked || move.capture) {
        let score
        if (!pvFlag) {
          score = -PVSQuiescentSearch(pos, finishTime, -beta, -alpha)
          pvFlag = true
        }
        //若已经走过至少一个走法，走限制边界的pvs算法
        else {
          //预测下一个走法要么超过beta产生截断，要么比bestScore要差
          score = -PVSQuiescentSearch(pos, finishTime, -(alpha + 1), -alpha)

          //若预测失败，这个走法可能是一个好的走法，那么重新搜索pvs得分
          if (score > alpha && score < beta) {
            score = -PVSQuiescentSearch(pos, finishTime, -beta, -alpha)
          }
        }
        if (score >= beta) {
          //保存得分到置换表里
          quiescentHashTable.saveHashTable(zobrist, score, hashFakeDepth, hashBeta, move, ply)
          //保存走法到历史表里
          saveGoodMove(move, 1, ply, quiescentHistoryTable)
          pos.unMakeMove()
          return score
        }

        if (score > bestScore) {
          bestScore = score
          bestMove = move

          if (score > alpha) {
            alpha = score
            exceedAlpha = true
          }
        }
      }
      pos.unMakeMove()
    }
  }

  //7. 返回得分，如果没有走法，返回将死得分
  if (hasMove) {
    //7.1 超过了alpha，是pv值
    if (exceedAlpha) {
      //7.1.1 至少走了一步吃子走法或者应将走法，则添加到历史表里
      if (bestMove) {
        saveGoodMove(bestMove, 1, ply, quiescentHistoryTable)
      }
      quiescentHashTable.saveHashTable(zobrist, bestScore, hashFakeDepth, hashExact, bestMove, ply)
      return bestScore
    }
    //7.2 没有超过alpha
    else {
      quiescentHashTable.saveHashTable(zobrist, bestScore, hashFakeDepth, hashAlpha, bestMove, ply)
      return bestScore
    }
  }
  //被将死了 
  else {
    return ply - checkmatedValue
  }
}

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
  const isChecked = pos.isChecked()

  //5.2 是否有棋可走，没有则被将死了
  let hasMove = false

  //6. 搜索所有走法
  for (let move of moves) {
    if (pos.makeMove(move)) {
      hasMove = true

      //如果正在被将军，走全部走法，如果没有被将军，走吃子走法
      if (isChecked || move.capture) {
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

function PVS(pos, finishTime, alpha = -Infinity, beta = Infinity, depth, nullMoveAble = true) {
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
    const eval = PVSQuiescentSearch(pos, finishTime, alpha, beta)
    // const eval = pos.evaluate()
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
        //预测下一个走法要么超过beta产生截断，要么比alpha要差
        score = -PVS(pos, finishTime, -(alpha + 1), -alpha, depth - 1)

        //若预测失败，这个走法可能是一个好的走法，那么重新搜索pvs得分
        if (score > alpha && score < beta) {
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
      //保存走法到历史表里
      saveGoodMove(bestMove, depth, ply)
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

function ComputerThinkTimer(pos, remainTime = timeout, maxDepth = 30) {
  initial()

  const finishTime = Date.now() + remainTime
  let bestMove = null
  for (let i = 1; i <= maxDepth; i++) {
    searchDepth = i
    console.log('=========')
    const resultMove = PVS(pos, finishTime, -checkmatedValue, checkmatedValue, i)

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

module.exports = {
  ComputerThinkTimer,
  MinMax,
  checkmatedValue
}