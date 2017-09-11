const Pos = require('../core/position')
const { checkmatedValue, winValue, banValue, drawValue } = require('../core/evaluate')
const { HashTable, hashAlpha, hashBeta, hashExact } = require('../core/hashtable')
const { Move } = require('../core/util')
const {fens} = require('./testData')

const timeout = 5 * 1000
const timeoutValue = 300000
const limitDepth = 40
const nullDepth = 2
const hashFakeDepth = 50

let hashTable = new HashTable()
let historyTable = Array.from(Array(256)).map(() => Array.from(Array(256)).map(() => 0))
let killerMove = []
let isFinished = true
let bestMove = null

//重置整个搜索
function initial() {
  hashTable = new HashTable()
  historyTable = Array.from(Array(256)).map(() => Array.from(Array(256)).map(() => 0))
  killerMove = []
  isFinished = true
  bestMove = null
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
      const gap = historyTable[move1.from][move1.to] - historyTable[move2.from][move2.to]
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
  const hashScore = hashTable.readHashTable(zobrist, hashFakeDepth, alpha, beta, ply)
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
  let moves = pos.generateMoves().sort(sortingMoves(hashMv, ply))

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
          hashTable.saveHashTable(zobrist, score, hashFakeDepth, hashBeta, move, ply)
          //保存走法到历史表里
          saveGoodMove(move, 1, ply)
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
    //7.1.1 超过了alpha，是pv值
    if (exceedAlpha) {
      if (bestMove) {
        saveGoodMove(bestMove, 1, ply)
      }
      hashTable.saveHashTable(zobrist, bestScore, hashFakeDepth, hashExact, bestMove, ply)
      return bestScore
    }
    //7.1.2 没有超过alpha
    else {
      hashTable.saveHashTable(zobrist, bestScore, hashFakeDepth, hashAlpha, bestMove, ply)
      return bestScore
    }
  }
  //被将死了 
  else {
    return ply - checkmatedValue
  }
}

function success(fen) {
  const start1 = Date.now()
  const normalQuiescent = QuiescentSearch(new Pos(fen), -Infinity, Infinity)
  const end1 = Date.now()

  const start2 = Date.now()
  const pvsQuiescent = PVSQuiescentSearch(new Pos(fen), Date.now() + 2000000, -Infinity, Infinity)
  const end2 = Date.now()
  console.assert(normalQuiescent === pvsQuiescent)
  // console.log('QuiescentSearch time consume:' + (end1 - start1) + 'ms')

  // console.log('PVSQuiescentSearch time consume:' + (end2 - start2) + 'ms')
}

//2RCkab2/9/4n2r1/p2Rn1pcp/2p6/4c4/2r3P1P/B3C1N2/4A4/4KAB2 b
describe('quiescentSearch', function () {
  beforeEach(function () {
    initial()
  })

  it('should sucess', function () {
    fens.forEach((fen) => {
      success(fen)
    })
  })
})