const fs = require('fs')
const path = require('path')

const Pos = require('./position')
const { Move } = require('./util')
const { checkmatedValue } = require('./evaluate')
const { HashTable, hashAlpha, hashBeta, hashExact } = require('./hashtable')

const { fens } = require('./testData')

const nullDepth = 2

class Sg_searchNode {
  constructor(counter = 0, alphaNodes = 0, betaNodes = 0, pvNodes = 0, evalNodes = 0, hashNodes = 0, deadNodes = 0) {
    this.counter = counter
    this.alphaNodes = alphaNodes
    this.betaNodes = betaNodes
    this.pvNodes = pvNodes
    this.evalNodes = evalNodes
    this.hashNodes = hashNodes
    this.deadNodes = deadNodes
    this.moves = []
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
      return pos.moveStack.length - checkmatedValue
    }

    return bestScore
  })(maxDepth)

  return { resultMove, score }
}

function AlphaBeta(initialAlpha = -Infinity, initialBeta = Infinity, sg_searchNode, pos, maxDepth) {
  let resultMove = null

  let time = 0
  const score = (function helper(alpha, beta, depth) {

    if (depth <= 0) {
      sg_searchNode.evalNodes++
      return pos.evaluate()
    }

    sg_searchNode.counter++

    let bestMove = null
    //是否有更新alpha
    let alphaFlag = 0
    //是否一步也没走
    let unMoveFlag = 1
    //初始化得分
    let bestScore = -Infinity

    for (let move of pos.generateMoves()) {
      if (pos.makeMove(move)) {
        unMoveFlag = 0
        const score = -helper(-beta, -alpha, depth - 1)

        pos.unMakeMove()

        if (score >= beta) {
          sg_searchNode.betaNodes++
          return beta
        }

        if (score > bestScore) {
          bestScore = score
          if (score > alpha) {
            bestMove = move
            alphaFlag = 1
            alpha = score
          }
        }
      }
    }

    //到达了根节点
    if (depth === maxDepth) {
      resultMove = bestMove
    }

    //没有更新alpha
    if (alphaFlag === 0) {
      sg_searchNode.alphaNodes++
    }
    //更新了alpha，同时没有超过beta
    else {
      sg_searchNode.pvNodes++
    }

    //没有走任何棋
    if (unMoveFlag) {
      sg_searchNode.deadNodes++
      return pos.moveStack.length - checkmatedValue
    }

    return alpha
  })(initialAlpha, initialBeta, maxDepth)

  return { resultMove, score }
}

function AlphaBetaWithHashTable(initialAlpha = -Infinity, initialBeta = Infinity, sg_searchNode, pos, maxDepth) {
  let resultMove = null

  const hashTable = new HashTable()

  const score = (function helper(alpha, beta, depth) {
    const zobrist = pos.zobrist

    //获得之前的值
    const previousScore = hashTable.readHashTable(zobrist, depth, alpha, beta, pos.moveStack.length)
    if (typeof previousScore === 'number') {
      sg_searchNode.hashNodes++
      return previousScore
    }

    if (depth <= 0) {
      sg_searchNode.evalNodes++
      const eval = pos.evaluate()
      hashTable.saveHashTable(zobrist, eval, depth, hashExact, null, pos.moveStack.length)
      return eval
    }

    sg_searchNode.counter++

    let bestMove = null
    let bestScore = -Infinity
    //是否有更新alpha
    let alphaFlag = 0
    //是否一步也没走
    let unMoveFlag = 1

    for (let move of pos.generateMoves()) {
      if (pos.makeMove(move)) {
        unMoveFlag = 0
        const score = -helper(-beta, -alpha, depth - 1)
        pos.unMakeMove()

        if (score > bestScore) {
          bestMove = move
          bestScore = score
        }

        if (score >= beta) {
          hashTable.saveHashTable(zobrist, beta, depth, hashBeta, bestMove, pos.moveStack.length)
          sg_searchNode.betaNodes++
          return beta
        }

        if (score > alpha) {
          alphaFlag = 1
          alpha = score
        }
      }
    }

    //到达了根节点
    if (depth === maxDepth) {
      resultMove = bestMove
    }

    //是否低于alpha边界
    if (alphaFlag === 0) {
      sg_searchNode.alphaNodes++
      hashTable.saveHashTable(zobrist, alpha, depth, hashAlpha, bestMove, pos.moveStack.length)
    } else {
      sg_searchNode.pvNodes++
      hashTable.saveHashTable(zobrist, alpha, depth, hashExact, bestMove, pos.moveStack.length)
    }

    //没有走任何棋
    if (unMoveFlag) {
      sg_searchNode.deadNodes++
      hashTable.saveHashTable(zobrist, pos.moveStack.length - checkmatedValue, depth, hashExact, null, pos.moveStack.length)
      return pos.moveStack.length - checkmatedValue
    }

    return alpha
  })(initialAlpha, initialBeta, maxDepth)

  return { resultMove, score }
}

function AlphaBetaWithHashTable2(initialAlpha = -Infinity, initialBeta = Infinity, sg_searchNode, pos, maxDepth) {
  let resultMove = null

  const hashTable = new HashTable()

  const score = (function helper(alpha, beta, depth) {
    const zobrist = pos.zobrist

    //获得之前的值
    const previousScore = hashTable.readHashTable(zobrist, depth, alpha, beta, pos.moveStack.length)
    if (typeof previousScore === 'number') {
      sg_searchNode.hashNodes++
      return previousScore
    }

    if (depth <= 0) {
      sg_searchNode.evalNodes++
      const eval = pos.evaluate()
      hashTable.saveHashTable(zobrist, eval, depth, hashExact, null, pos.moveStack.length)
      return eval
    }

    sg_searchNode.counter++

    let bestScore = -Infinity

    let bestMove = null
    //是否有更新alpha
    let alphaFlag = 0
    //是否一步也没走
    let unMoveFlag = 1

    for (let move of pos.generateMoves()) {
      if (pos.makeMove(move)) {
        unMoveFlag = 0
        const score = -helper(-beta, -alpha, depth - 1)
        pos.unMakeMove()

        if (score > bestScore) {
          bestMove = move
          bestScore = score
        }

        if (score >= beta) {
          hashTable.saveHashTable(zobrist, score, depth, hashBeta, bestMove, pos.moveStack.length)
          sg_searchNode.betaNodes++
          return beta
        }

        if (score > alpha) {
          alphaFlag = 1
          alpha = score
        }
      }
    }

    //到达了根节点
    if (depth === maxDepth) {
      resultMove = bestMove
    }

    //没有走任何棋
    if (unMoveFlag) {
      sg_searchNode.deadNodes++
      hashTable.saveHashTable(zobrist, pos.moveStack.length - checkmatedValue, depth, hashExact, null, pos.moveStack.length)
      return pos.moveStack.length - checkmatedValue
    } else {
      //是否低于alpha边界
      if (alphaFlag === 0) {
        sg_searchNode.alphaNodes++
        hashTable.saveHashTable(zobrist, bestScore, depth, hashAlpha, bestMove, pos.moveStack.length)
      } else {
        sg_searchNode.pvNodes++
        hashTable.saveHashTable(zobrist, alpha, depth, hashExact, bestMove, pos.moveStack.length)
      }
    }

    return bestScore
  })(initialAlpha, initialBeta, maxDepth)

  return { resultMove, score }
}

function sortedMoveHashTable(initialAlpha = -Infinity, initialBeta = Infinity, sg_searchNode, pos, maxDepth) {
  let resultMove = null

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


  const score = (function helper(alpha, beta, depth) {
    const zobrist = pos.zobrist
    const ply = pos.moveStack.length

    //获得之前的值
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

    if (depth <= 0) {
      sg_searchNode.evalNodes++
      const eval = pos.evaluate()
      hashTable.saveHashTable(zobrist, eval, depth, hashExact, null, pos.moveStack.length)
      return eval
    }

    sg_searchNode.counter++

    let bestScore = -Infinity

    let bestMove = null
    //是否有更新alpha
    let alphaFlag = 0
    //是否一步也没走
    let unMoveFlag = 1

    const moves = pos.generateMoves().sort(sortingMoves(hashMv, pos.moveStack.length))

    for (let move of moves) {
      if (pos.makeMove(move)) {
        unMoveFlag = 0
        const score = -helper(-beta, -alpha, depth - 1)
        pos.unMakeMove()

        if (score > bestScore) {
          bestMove = move
          bestScore = score
        }

        if (score >= beta) {
          saveGoodMove(move, depth, pos.moveStack.length)
          hashTable.saveHashTable(zobrist, score, depth, hashBeta, bestMove, pos.moveStack.length)

          sg_searchNode.betaNodes++
          return score
        }

        if (score > alpha) {
          alphaFlag = 1
          alpha = score
        }
      }
    }

    //到达了根节点
    if (depth === maxDepth) {
      resultMove = bestMove
    }

    //没有走任何棋
    if (unMoveFlag) {
      sg_searchNode.deadNodes++
      hashTable.saveHashTable(zobrist, pos.moveStack.length - checkmatedValue, depth, hashExact, null, pos.moveStack.length)
      return pos.moveStack.length - checkmatedValue
    } else {
      //是否低于alpha边界
      if (alphaFlag === 0) {
        sg_searchNode.alphaNodes++
        hashTable.saveHashTable(zobrist, bestScore, depth, hashAlpha, bestMove, pos.moveStack.length)
      } else {
        sg_searchNode.pvNodes++
        saveGoodMove(bestMove, depth, pos.moveStack.length)
        hashTable.saveHashTable(zobrist, alpha, depth, hashExact, bestMove, pos.moveStack.length)
      }
    }

    return bestScore
  })(initialAlpha, initialBeta, maxDepth)

  return { resultMove, score }
}

function iterateSortedHashTable(initialAlpha = -Infinity, initialBeta = Infinity, sg_searchNode, pos, maxDepth) {
  let resultMove = null

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


  function AlphaBeta(alpha, beta, depth) {
    const zobrist = pos.zobrist
    const ply = pos.moveStack.length

    //获得之前的值
    const previousScore = hashTable.readHashTable(zobrist, depth, alpha, beta, pos.moveStack.length)
    if (typeof previousScore === 'number') {
      sg_searchNode.hashNodes++
      return previousScore
    }
    const lastGoodMv = previousScore

    if (depth <= 0) {
      sg_searchNode.evalNodes++
      const eval = pos.evaluate()
      hashTable.saveHashTable(zobrist, eval, depth, hashExact, null, pos.moveStack.length)
      return eval
    }

    sg_searchNode.counter++

    let bestScore = -Infinity

    let bestMove = null
    //是否有更新alpha
    let alphaFlag = 0
    //是否一步也没走
    let unMoveFlag = 1

    const moves = pos.generateMoves().sort(sortingMoves(lastGoodMv, pos.moveStack.length))

    for (let move of moves) {
      if (pos.makeMove(move)) {
        unMoveFlag = 0
        const score = -AlphaBeta(-beta, -alpha, depth - 1)
        pos.unMakeMove()

        if (score >= beta) {
          saveGoodMove(move, depth, pos.moveStack.length)
          hashTable.saveHashTable(zobrist, score, depth, hashBeta, bestMove, pos.moveStack.length)

          sg_searchNode.betaNodes++
          return beta
        }

        if (score > bestScore) {
          bestMove = move
          bestScore = score
        }

        if (score > alpha) {
          alphaFlag = 1
          alpha = score
        }
      }
    }

    //到达了根节点
    if (depth === maxDepth) {
      resultMove = bestMove
    }

    //没有走任何棋
    if (unMoveFlag) {
      sg_searchNode.deadNodes++
      hashTable.saveHashTable(zobrist, pos.moveStack.length - checkmatedValue, depth, hashExact, null, pos.moveStack.length)
      return pos.moveStack.length - checkmatedValue
    } else {
      //是否低于alpha边界
      if (alphaFlag === 0) {
        sg_searchNode.alphaNodes++
        hashTable.saveHashTable(zobrist, bestScore, depth, hashAlpha, bestMove, pos.moveStack.length)
      } else {
        sg_searchNode.pvNodes++
        saveGoodMove(bestMove, depth, pos.moveStack.length)
        hashTable.saveHashTable(zobrist, alpha, depth, hashExact, bestMove, pos.moveStack.length)
      }
    }

    return alpha
  }

  let score

  for (let depth = 1; depth <= maxDepth; depth++) {
    score = AlphaBeta(initialAlpha, initialBeta, maxDepth)
  }

  return { resultMove, score }
}

function PVS(initialAlpha = -Infinity, initialBeta = Infinity, sg_searchNode, pos, maxDepth) {
  let resultMove = null
  const nullDepth = 2
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


  const score = (function helper(alpha, beta, depth) {
    const zobrist = pos.zobrist
    const ply = pos.moveStack.length

    //获得之前的值
    const previousScore = hashTable.readHashTable(zobrist, depth, alpha, beta, ply)
    let lastGoodMv
    if (typeof previousScore === 'number') {
      sg_searchNode.hashNodes++
      // if (pos.moveStack[0] && pos.moveStack[0].from === 55 && pos.moveStack[0].to === 54) {

      // }else{
      return previousScore
      // }
    } else if (previousScore instanceof Move) {
      lastGoodMv = previousScore
    }

    if (depth <= 0) {
      sg_searchNode.evalNodes++
      const eval = pos.evaluate()
      hashTable.saveHashTable(zobrist, eval, depth, hashExact, null, ply)
      return eval
    }


    sg_searchNode.counter++

    let bestScore = -Infinity

    let bestMove = null
    //是否有更新alpha
    let alphaFlag = 0
    //是否一步也没走
    let unMoveFlag = 1

    const moves = pos.generateMoves().sort(sortingMoves(lastGoodMv, ply))

    //至少要走完一步棋
    let pvFlag = false

    for (let move of moves) {
      if (pos.makeMove(move)) {
        //走了一步
        unMoveFlag = 0
        let score
        if (pvFlag) {
          score = -helper(-alpha - 1, -alpha, depth - 1)
          if (score > alpha && score < beta) {
            score = -helper(-beta, -alpha, depth - 1)
          }
        } else {
          score = -helper(-beta, -alpha, depth - 1)
        }
        pos.unMakeMove()

        if (score > bestScore) {
          bestMove = move
          bestScore = score
        }

        if (score >= beta) {
          saveGoodMove(move, depth, ply)
          hashTable.saveHashTable(zobrist, score, depth, hashBeta, bestMove, ply)

          sg_searchNode.betaNodes++
          return score
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
      resultMove = bestMove
    }

    //没有走任何棋
    if (unMoveFlag) {
      sg_searchNode.deadNodes++
      hashTable.saveHashTable(zobrist, ply - checkmatedValue, depth, hashExact, null, ply)
      return ply - checkmatedValue
    } else {
      //是否低于alpha边界
      if (alphaFlag === 0) {
        sg_searchNode.alphaNodes++
        hashTable.saveHashTable(zobrist, bestScore, depth, hashAlpha, bestMove, ply)
      } else {
        sg_searchNode.pvNodes++
        saveGoodMove(bestMove, depth, ply)
        hashTable.saveHashTable(zobrist, alpha, depth, hashExact, bestMove, ply)
      }
    }

    return bestScore
  })(initialAlpha, initialBeta, maxDepth)

  return { resultMove, score }
}

function main(fileName, func, maxDepth = 7) {
  let resultInfo = ''
  const name = ['开局', '中局', '残局'];

  fens.forEach((fen, index) => {
    const pos = new Pos(fen)

    if (name[index]) {
      resultInfo += `${name[index]}(fen为:${fen})\n\n`
    } else {
      resultInfo += `strange${index - 2}(fen为:${fen})\n\n`
    }

    for (let i = 1; i <= maxDepth; i++) {
      const sg_searchNode = new Sg_searchNode()

      const start = Date.now()
      const moveInfo = func(sg_searchNode, pos, i)
      const move = moveInfo.resultMove
      const score = moveInfo.score
      const end = Date.now()

      if (move) {
        resultInfo += `depth = ${i}, bestMove = from ${move.from} to ${move.to}`
        if (move.capture) {
          resultInfo += `, capture = ${move.capture}`
        }
        resultInfo += `\n得分为： ${score}`
      } else {
        resultInfo += `depth = ${i}, bestMove = null, because computer is checked in this depth`
      }

      resultInfo += `\n 花费时间为${end - start}ms \n`

      resultInfo += `
        counter      =      ${sg_searchNode.counter}
        evalNodes    =      ${sg_searchNode.evalNodes}
        betaNodes    =      ${sg_searchNode.betaNodes}
        pvNodes      =      ${sg_searchNode.pvNodes}
        alphaNodes   =      ${sg_searchNode.alphaNodes}
        hashNodes    =      ${sg_searchNode.hashNodes}
        deadNodes    =      ${sg_searchNode.deadNodes}`

      resultInfo += '\n'
      resultInfo += '\n'
    }
  })

  fs.open(path.resolve(`test_result/${fileName}`), 'w', () => {
    fs.writeFile(path.resolve(`test_result/${fileName}`), resultInfo, function (err) {
      if (err) {
        return console.log(err)
      }
      console.log('文件写入成功')
    })
  })
}

function NullMoveAlphaBeta(initialAlpha = -Infinity, initialBeta = Infinity, sg_searchNode, pos, maxDepth) {
  let resultMove = null

  let nullDepth = 2
  let time = 0

  const score = (function helper(alpha, beta, depth, noNull = false) {
    if (depth <= 0) {
      sg_searchNode.evalNodes++
      return pos.evaluate()
    }

    //执行空着，但不能连续两次执行空着,深度必须大于等于1，否则就退化成单纯的局面评估了
    if (!noNull && depth - 1 - nullDepth > 0 && pos.nullOk && pos.makeEmptyMove()) {
      //执行空着
      const nullScore = -helper(-beta, -beta + 1, depth - 1 - nullDepth, true)
      pos.unMakeEmptyMove()

      //我认为beta-1到beta就足够验证了，但其他人这里设的是alpha，beta
      if (nullScore >= beta && (pos.nullSafe || helper(beta - 1, beta, depth - nullDepth, true) >= beta)) {
        return nullScore
      }
    }

    sg_searchNode.counter++

    let bestMove = null
    //是否有更新alpha
    let alphaFlag = 0
    //是否一步也没走
    let unMoveFlag = 1

    let bestScore = -Infinity

    for (let move of pos.generateMoves()) {
      if (pos.makeMove(move)) {
        unMoveFlag = 0
        const score = -helper(-beta, -alpha, depth - 1)
        pos.unMakeMove()

        if (score >= beta) {
          sg_searchNode.betaNodes++
          return score
        }

        if (score > bestScore) {
          bestScore = score
        }

        if (score > alpha) {
          bestMove = move
          alphaFlag = 1
          alpha = score
        }
      }
    }

    //到达了根节点
    if (depth === maxDepth) {
      resultMove = bestMove
    }

    //没有更新alpha
    if (alphaFlag === 0) {
      sg_searchNode.alphaNodes++
    }
    //更新了alpha，同时没有超过beta
    else {
      sg_searchNode.pvNodes++
    }

    //没有走任何棋
    if (unMoveFlag) {
      sg_searchNode.deadNodes++
      return pos.moveStack.length - checkmatedValue
    }

    return bestScore
  })(initialAlpha, initialBeta, maxDepth)

  return { resultMove, score }
}


function compareTest(maxDepth = 4) {
  const correctFuncs = [MinMaxTest, AlphaBeta]

  const testFuncs = [AlphaBetaWithHashTable, AlphaBetaWithHashTable2, sortedMoveHashTable, PVS]

  function isCorrect(fen, depth, func) {
    return func(-Infinity, Infinity, new Sg_searchNode(), new Pos(fen), depth).score === correctFuncs[1](-Infinity, Infinity, new Sg_searchNode(), new Pos(fen), depth).score
  }

  const errorCases = []

  for (let fenIndex = 0; fenIndex < fens.length; fenIndex++) {
    for (let depth = 1; depth <= maxDepth; depth++) {
      for (let funcIndex = 0; funcIndex < testFuncs.length; funcIndex++) {
        if (!isCorrect(fens[fenIndex], depth, testFuncs[funcIndex])) {
          errorCases.push({ fenIndex, depth, funcIndex })
        }
      }
    }
  }

  errorCases.sort(function (case1, case2) {
    if (case1.funcIndex === case2.funcIndex) {
      if (case1.depth === case2.depth) {
        if (case1.fenIndex === case2.fenIndex) {
          return 0
        }
        return case1.fenIndex - case2.fenIndex
      }
      return case1.depth - case2.depth
    }
    return case1.funcIndex - case2.funcIndex
  })

  if (errorCases.length) {
    const { fenIndex, depth, funcIndex } = errorCases[0]

    const fen = fens[fenIndex]
    const func = testFuncs[funcIndex]

    if (correctFuncs[0](new Sg_searchNode(), new Pos(fen), depth).score === correctFuncs[1](-Infinity, Infinity, new Sg_searchNode(), new Pos(fen), depth).score) {
      console.log('失败的函数为：' + func.name)
      console.log('失败的层数为：' + depth)
      console.log('失败的fen为：' + fen)
      const failResult = func(-Infinity, Infinity, new Sg_searchNode(), new Pos(fen), depth)
      console.log('失败的结果为：' + failResult.resultMove)
      console.log('失败的得分为：' + failResult.score)
      const shouldResult = correctFuncs[1](-Infinity, Infinity, new Sg_searchNode(), new Pos(fen), depth)
      console.log('应该的结果为：' + shouldResult.resultMove)
      console.log('应该的得分为：' + shouldResult.score)
    } else {
      console.log('alphabeta失败')
    }

    throw new Error()
  } else {
    console.log('成功')
  }
}

compareTest()

// const pos = new Pos(fens[6])
// pos.changeSide()
// console.log('AlphaBeta')
// console.log(AlphaBeta(-Infinity, Infinity, new Sg_searchNode(), pos, 1))
// console.log('AlphaBetaWithHashTable')
// console.log(AlphaBetaWithHashTable(-Infinity, Infinity, new Sg_searchNode(), pos, 1))



main('MinMax_test_result', MinMaxTest, 4)
main('AlphaBeta_test_result', AlphaBeta.bind(null, -Infinity, Infinity), 5)
// main('NullMoveAlphaBeta_test_result', NullMoveAlphaBeta.bind(null, -Infinity, Infinity), 5)
main('AlphaBetaWithHashTable_test_result', AlphaBetaWithHashTable.bind(null, -Infinity, Infinity), 5)
main('AlphaBetaWithHashTable2_test_result', AlphaBetaWithHashTable2.bind(null, -Infinity, Infinity), 5)
main('sortedMoveHashTable_test_result', sortedMoveHashTable.bind(null, -Infinity, Infinity), 7)
main('PVS_test_result', PVS.bind(null, -Infinity, Infinity), 7)


// console.log(MinMaxTest(new Sg_searchNode(),new Pos('1nbakabnr/r8/1c5c1/p1p1p1p1p/9/9/P1P1P1P1P/2N1C2C1/9/R1BAKABNR b'),5))

// console.log( new Pos(fens[7]).piece.filter((pos,index)=>{
//   if(index>=32){
//     console.log(pos)
//   }
// }))

// let pos = new Pos(fens[7])

// console.log(sortedMoveHashTable(-Infinity, Infinity, new Sg_searchNode(), new Pos(fens[7]), 5))

// main('iterateSortedHashTable', iterateSortedHashTable.bind(null, -Infinity, Infinity), 4)
