const fs = require('fs')
const path = require('path')

const Pos = require('./position')
const { checkmatedValue } = require('./evaluate')
const { HashTable, hashAlpha, hashBeta, hashExact } = require('./hashtable')

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

//开局
const fen1 = 'r1bakabr1/9/1cn3n1c/p1p1p1R1p/6p2/2P6/P3P1P1P/1C2C1N2/9/RNBAKAB2 b'

//中局
const fen2 = '2bakab2/9/1c2c1n2/p5p1p/2P4R1/1C2p1P2/P3Pr2P/2N1BC3/4A4/3K1AB2 b'

//残局
const fen3 = '9/2P6/3k5/4c4/2b6/9/4N4/8B/3n1p3/3K5 b'

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

  return resultMove
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

    for (let move of pos.generateMoves()) {
      if (pos.makeMove(move)) {
        unMoveFlag = 0
        const score = -helper(-beta, -alpha, depth - 1)
        pos.unMakeMove()

        if (score >= beta) {
          sg_searchNode.betaNodes++
          return beta
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

    return alpha
  })(initialAlpha, initialBeta, maxDepth)

  return resultMove
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
      hashTable.saveHashTable(zobrist, eval, depth, hashExact, null)
      return eval
    }

    sg_searchNode.counter++

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

        if (score >= beta) {
          hashTable.saveHashTable(zobrist, beta, depth, hashBeta, bestMove)
          sg_searchNode.betaNodes++
          return beta
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

    //是否低于alpha边界
    if (alphaFlag === 0) {
      sg_searchNode.alphaNodes++
      hashTable.saveHashTable(zobrist, alpha, depth, hashAlpha, bestMove)
    } else {
      sg_searchNode.pvNodes++
      hashTable.saveHashTable(zobrist, alpha, depth, hashExact, bestMove)
    }

    //没有走任何棋
    if (unMoveFlag) {
      sg_searchNode.deadNodes++
      hashTable.saveHashTable(zobrist, pos.moveStack.length - checkmatedValue, depth, hashExact, null, pos.moveStack.length)
      return pos.moveStack.length - checkmatedValue
    }

    return alpha
  })(initialAlpha, initialBeta, maxDepth)

  return resultMove
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
      hashTable.saveHashTable(zobrist, eval, depth, hashExact, null)
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

        if (score >= beta) {
          hashTable.saveHashTable(zobrist, score, depth, hashBeta, bestMove)
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
        hashTable.saveHashTable(zobrist, bestScore, depth, hashAlpha, bestMove)
      } else {
        sg_searchNode.pvNodes++
        hashTable.saveHashTable(zobrist, alpha, depth, hashExact, bestMove)
      }
    }

    return bestScore
  })(initialAlpha, initialBeta, maxDepth)

  return resultMove
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


  const score = (function helper(alpha, beta, depth) {
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
      hashTable.saveHashTable(zobrist, eval, depth, hashExact, null)
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
        const score = -helper(-beta, -alpha, depth - 1)
        pos.unMakeMove()

        if (score >= beta) {
          saveGoodMove(move, depth, pos.moveStack.length)
          hashTable.saveHashTable(zobrist, score, depth, hashBeta, bestMove)

          sg_searchNode.betaNodes++
          return score
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
        hashTable.saveHashTable(zobrist, bestScore, depth, hashAlpha, bestMove)
      } else {
        sg_searchNode.pvNodes++
        saveGoodMove(bestMove, depth, pos.moveStack.length)
        hashTable.saveHashTable(zobrist, alpha, depth, hashExact, bestMove)
      }
    }

    return bestScore
  })(initialAlpha, initialBeta, maxDepth)

  return resultMove
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
      if (killerMove[ply]) {
        //按杀手1排序
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
      hashTable.saveHashTable(zobrist, eval, depth, hashExact, null)
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
          hashTable.saveHashTable(zobrist, score, depth, hashBeta, bestMove)

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
        hashTable.saveHashTable(zobrist, bestScore, depth, hashAlpha, bestMove)
      } else {
        sg_searchNode.pvNodes++
        saveGoodMove(bestMove, depth, pos.moveStack.length)
        hashTable.saveHashTable(zobrist, alpha, depth, hashExact, bestMove)
      }
    }

    return alpha
  }

  for (let depth = 1; depth <= maxDepth; depth++) {
    AlphaBeta(initialAlpha, initialBeta, maxDepth)
  }

  return resultMove
}

function PVS(initialAlpha = -Infinity, initialBeta = Infinity, sg_searchNode, pos, maxDepth) {
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


  const score = (function helper(alpha, beta, depth) {
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
      hashTable.saveHashTable(zobrist, eval, depth, hashExact, null)
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

        if (score >= beta) {
          saveGoodMove(move, depth, pos.moveStack.length)
          hashTable.saveHashTable(zobrist, score, depth, hashBeta, bestMove)

          sg_searchNode.betaNodes++
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
        hashTable.saveHashTable(zobrist, bestScore, depth, hashAlpha, bestMove)
      } else {
        sg_searchNode.pvNodes++
        saveGoodMove(bestMove, depth, pos.moveStack.length)
        hashTable.saveHashTable(zobrist, alpha, depth, hashExact, bestMove)
      }
    }

    return bestScore
  })(initialAlpha, initialBeta, maxDepth)

  return resultMove
}

function main(fileName, func, maxDepth = 7) {
  let resultInfo = ''
  const name = ['开局', '中局', '残局'];

  [fen1, fen2, fen3].forEach((fen, index) => {
    const pos = new Pos()
    pos.fenToBoard(fen)

    resultInfo += `${name[index]}(fen为:${fen})\n\n`

    for (let i = 3; i <= maxDepth; i++) {
      const sg_searchNode = new Sg_searchNode()

      const start = Date.now()
      const move = func(sg_searchNode, pos, i)
      const end = Date.now()

      if (move) {
        resultInfo += `depth = ${i}, bestMove = from ${move.from} to ${move.to}`
        if (move.capture) {
          resultInfo += `, capture = ${move.capture}`
        }
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
  const score = (function helper(alpha, beta, depth, nullMove = false) {
    if (depth <= 0) {
      sg_searchNode.evalNodes++
      return pos.evaluate()
    }

    //执行空着，但不能连续两次执行空着
    if (!nullMove && !pos.isCheck()) {
      //执行空着
      pos.makeEmptyMove()
      const nullScore = -helper(-beta, -beta + 1, depth - 1 - nullDepth, true)
      pos.unMakeEmptyMove()

      if (nullScore > beta) {
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

  return resultMove
}

// main('MinMax_test_result', MinMaxTest, 4)
main('AlphaBeta_test_result', AlphaBeta.bind(null, -Infinity, Infinity),5)
// main('NullMoveAlphaBeta_test_result', NullMoveAlphaBeta.bind(null, -Infinity, Infinity),4)
// main('AlphaBetaWithHashTable_test_result', AlphaBetaWithHashTable.bind(null, -Infinity, Infinity), 4)
// main('AlphaBetaWithHashTable2_test_result', AlphaBetaWithHashTable2.bind(null, -Infinity, Infinity), 4)
main('sortedMoveHashTable_test_result', sortedMoveHashTable.bind(null, -Infinity, Infinity), 5)
// main('PVS_test_result', PVS.bind(null, -Infinity, Infinity), 5)

// main('iterateSortedHashTable', iterateSortedHashTable.bind(null, -Infinity, Infinity), 4)
// const pos = new Pos()
// pos.fenToBoard('2bakab2/9/1c2c1n2/p5p1p/2P4R1/1C2p1P2/P3Pr2P/2N1BC3/4A4/3K1AB2 b')

// console.log(AlphaBeta(-Infinity, Infinity, new Sg_searchNode(), pos, 5))
// console.log(NullMoveAlphaBeta(-Infinity, Infinity, new Sg_searchNode(), pos, 5))
