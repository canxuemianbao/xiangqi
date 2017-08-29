// row :9 column :8
// const { probeHash, recordHash, hashfALPHA, hashfBETA, hashfEXACT } = require("./hash")
const {
  chessesZobrist,
  Zobrist,
  generateChess,
  redChesses,
  blackChesses,
  chessesEval,
  redRooks,
  redKnights,
  redBishops,
  redAdvisors,
  redKing,
  redCans,
  redPawns,

  blackRooks,
  blackKnights,
  blackBishops,
  blackAdvisors,
  blackKing,
  blackCans,
  blackPawns,

 } = require("./pregen")

// move : {oldChess,newChess}
const timeoutValue = -1000000000
const checkmatedValue = 1000000
const timeout = 4000

const red = true
const black = false

//不允许从黑棋开始
class State {
  constructor() {
    this.color = red
    this.redChesses = []
    this.blackChesses = []
    this.chesses = []
    this.mvs = []
    this.pcList = []
    this.keyList = []
    // this.chkList = [this.checked()]

    this.staticNum = 0
    this.depth = 0
    this.redKing = null
    this.blackKing = null

    this.chessboard = [
      //0
      [null, null, null, null, null, null, null, null, null],
      //1
      [null, null, null, null, null, null, null, null, null],
      //2
      [null, null, null, null, null, null, null, null, null],
      //3
      [null, null, null, null, null, null, null, null, null],
      //4
      [null, null, null, null, null, null, null, null, null],

      //river

      //5
      [null, null, null, null, null, null, null, null, null],
      //6
      [null, null, null, null, null, null, null, null, null],
      //7
      [null, null, null, null, null, null, null, null, null],
      //8
      [null, null, null, null, null, null, null, null, null],
      //9
      [null, null, null, null, null, null, null, null, null]
    ]
  }

  addChess(chess) {
    if (chess.color === red) {
      this.redChesses.push(chess)
      if (chess.constructor.name === "King") {
        this.redKing = chess
      }
    } else {
      this.blackChesses.push(chess)
      if (chess.constructor.name === "King") {
        this.blackKing = chess
      }
    }

    this.chesses.push(chess)

    this.chessboard[chess.x][chess.y] = chess
  }

  generateZobrist() {
    // console.log(chessesZobrist.gvZobr, chess) => prevZobr.xor(chessesZobrist.get(chess)[chess.x][chess.y]), new Zobrist(0, 0, 0, 0)))
    this.zobr = {
      dwZobristLock: this.chesses.reduce((prevZobr, chess) => prevZobr.xor(chessesZobrist.get(chess)[chess.x][chess.y]), new Zobrist(0, 0, 0, 0))
    }
  }

  generateEval() {
    this.redEval = this.redChesses.reduce((preeval, chess) => chessesEval.get(chess)[chess.x][chess.y] + preeval, 0)
    this.redEval = this.blackChesses.reduce((preeval, chess) => preeval - chessesEval.get(chess)[chess.x][chess.y], this.redEval)
    this.blackEval = -this.redEval
  }

  initialByFen(fen) {
    let x = 0
    let y = 0
    let fenArray = fen.split(" ")

    let fenNum = {}
    Array.from(fenArray[0]).forEach((f) => {
      if (!isNaN(parseInt(f))) {
        y += parseInt(f)
      } else if (f === '/') {
        x++
        y = 0
      } else {
        this.addChess(generateChess(f, x, y, fenNum[f] || 0))
        fenNum[f] = (fenNum[f] || 0) + 1
        y++
      }
    })

    this.color = fenArray[1] !== 'b' ? red : black
    this.staticNum = fenArray[4]
    this.depth = (fenArray[5] - 1) * 2 + (this.color === black ? 1 : 0)

    this.generateZobrist()
    this.generateEval()
  }

  evaluate() {
    if (this.color === red) {
      return this.redEval
    }
    else {
      return this.blackEval
    }
  }

  getChesses(color) {
    if (color === red) {
      return this.redChesses
    } else if (color === black) {
      return this.blackChesses
    } else {
      return this.chesses
    }
  }

  getKing(color) {
    if (color === red) {
      return this.redKing
    } else {
      return this.blackKing
    }
  }

  generateMoves() {
    let currentMoves = []

    this.getChesses(this.color).forEach((chess) => {
      if (!chess.dead) {
        chess.generateMoves(currentMoves)(this.chessboard)
      }
    })

    return currentMoves
  }

  switchColor() {
    if (this.color === red) this.color = black
    else this.color = red
  }

  executeMove(move) {
    const { chess, x, y } = move
    const originalInfo = { x: chess.x, y: chess.y }
    const originalStaticNum = this.staticNum
    const originalDepth = this.depth
    const originalEval = this.redEval

    //判断是否吃子
    const deadChess = this.chessboard[x][y]
    if (deadChess != null) {
      deadChess.dead = true
      this.chessboard[x][y] = null

      //更改得分
      if (this.color === red) this.redEval = this.redEval + chessesEval.get(deadChess)[x][y]
      else this.redEval = this.redEval - chessesEval.get(deadChess)[x][y]

      //从zobrist中删除这个值
      this.zobr.dwZobristLock = this.zobr.dwZobristLock.xor(chessesZobrist.get(deadChess)[x][y])

      this.staticNum = 0
    } else {
      this.staticNum++
    }

    this.depth++

    //改变zobrist值
    this.zobr.dwZobristLock = this.zobr.dwZobristLock.xor(chessesZobrist.get(chess)[chess.x][chess.y])
    this.zobr.dwZobristLock = this.zobr.dwZobristLock.xor(chessesZobrist.get(chess)[x][y])

    //更改得分
    if (chess.color === red) {
      this.redEval = this.redEval - chessesEval.get(chess)[chess.x][chess.y]
      this.redEval = this.redEval + chessesEval.get(chess)[x][y]
      this.blackEval = -this.redEval
    } else {
      this.redEval = this.redEval + chessesEval.get(chess)[chess.x][chess.y]
      this.redEval = this.redEval - chessesEval.get(chess)[x][y]
      this.blackEval = -this.redEval
    }

    //插入棋子
    this.chessboard[chess.x][chess.y] = null
    this.chessboard[x][y] = chess
    chess.x = x
    chess.y = y

    this.switchColor()

    return () => {
      //恢复zobrist值
      this.zobr.dwZobristLock = this.zobr.dwZobristLock.xor(chessesZobrist.get(chess)[chess.x][chess.y])
      this.zobr.dwZobristLock = this.zobr.dwZobristLock.xor(chessesZobrist.get(chess)[originalInfo.x][originalInfo.y])

      //恢复分数
      this.redEval = originalEval
      this.blackEval = -this.redEval

      //取消棋子移动
      chess.x = originalInfo.x
      chess.y = originalInfo.y
      this.chessboard[chess.x][chess.y] = chess
      this.chessboard[x][y] = null

      //取消吃子
      if (deadChess != null) {
        deadChess.dead = false
        this.chessboard[x][y] = deadChess
        this.zobr.dwZobristLock = this.zobr.dwZobristLock.xor(chessesZobrist.get(deadChess)[x][y])
      }

      this.staticNum = originalStaticNum
      this.depth = originalDepth

      this.switchColor()
    }
  }

  isKingFace() {
    if (this.redKing.y !== this.blackKing.y) {
      return false
    }

    for (let i = this.blackKing.x + 1; i < this.redKing.x; i++) {
      if (this.chessboard[i][this.redKing.y]) {
        return false
      }
    }
    return true
  }

  //should be replace
  isChecked() {
    let lastKing = this.getKing(!this.color)

    return this.isKingFace() || this.getChesses(this.color).some((chess) => !chess.dead && chess.offensive && chess.canMove(lastKing.x, lastKing.y)(this.chessboard))
  }

  fen() {
    let fen = ""
    let space = 0
    for (let x = 0; x < this.chessboard.length; x++) {
      space = 0
      for (let y = 0; y < this.chessboard[0].length; y++) {
        if (this.chessboard[x][y] == null) {
          space++
        } else {
          if (space !== 0) {
            fen += space
            space = 0
          }
          fen += this.chessboard[x][y].fen()
        }
      }
      if (space !== 0) {
        fen += space
      }
      fen += '/'
    }

    fen += ` ${this.color === red ? 'r' : 'b'} - - ${this.staticNum} ${Math.ceil((this.depth + 1) / 2)}`
    return fen
  }
}

const state = new State()

function SearchQuiesc(state,alpha,beta) {
  var vlAlpha = vlAlpha_;
  
  // 一个静态搜索分为以下几个阶段
  
  // 1. 如果vlBeta值比杀棋分值还小，直接返回杀棋分值
  var vl = this.pos.mateValue();
  if (vl >= vlBeta) {
    return vl;
  }
  
  // 2. 检查重复局面
  var vlRep = this.pos.repStatus(1);
  if (vlRep > 0) {
    return this.pos.repValue(vlRep);
  }
  
  // 3. 到达极限深度就返回局面评价
  if (this.pos.distance == LIMIT_DEPTH) {
    return this.pos.evaluate();
  }
  
  // 4. 初始化最佳值
  var vlBest = -MATE_VALUE;	// 这样可以知道，是否一个走法都没走过(杀棋)
  
  
  var mvs = [], vls = [];
  if (this.pos.inCheck()) {
    // 5. 如果被将军，则生成全部走法
    mvs = this.pos.generateMoves(null);
    for (var i = 0; i < mvs.length; i ++) {
      vls.push(this.historyTable[this.pos.historyIndex(mvs[i])]);
    }
    shellSort(mvs, vls);
  } else {
    // 6. 如果不被将军，先做局面评价
    vl = this.pos.evaluate();
    if (vl > vlBest) {
      if (vl >= vlBeta) {
        return vl;
      }
      vlBest = vl;
      vlAlpha = Math.max(vl, vlAlpha);
    }
	
	// 7. 如果局面评价没有截断，再生成吃子走法
    mvs = this.pos.generateMoves(vls);
    shellSort(mvs, vls);
    for (var i = 0; i < mvs.length; i ++) {
      if (vls[i] < 10 || (vls[i] < 20 && HOME_HALF(DST(mvs[i]), this.pos.sdPlayer))) {	// 棋子过少的话不搜索了
        mvs.length = i;
        break;
      }
    }
  }
  
  // 8. 逐一走这些走法，并进行递归
  for (var i = 0; i < mvs.length; i ++) {
    if (!this.pos.makeMove(mvs[i])) {
      continue;
    }
    vl = -this.searchQuiesc(-vlBeta, -vlAlpha);
    this.pos.undoMakeMove();
    
	// 9. 进行Alpha-Beta大小判断和截断
	if (vl > vlBest) {					// 找到最佳值
      if (vl >= vlBeta) {				// 找到一个Beta走法
        return vl;						// Beta截断
      }
      vlBest = vl;						// "vlBest"就是目前要返回的最佳值，可能超出Alpha-Beta边界
      vlAlpha = Math.max(vl, vlAlpha);	// 缩小Alpha-Beta边界
    }
  }
  
  // 10. 所有走法都搜索完了，返回最佳值
  return vlBest == -MATE_VALUE ? this.pos.mateValue() : vlBest;
}

// int AlphaBeta(int vlAlpha, int vlBeta, int nDepth) {
// 　if (nDepth == 0) {
// 　　return 局面评价函数
// 　}
// 　生成全部走法
// 　按历史表排序全部走法
// 　for (每个生成的走法) {
// 　　走这个走法
// 　　if (被将军) {
// 　　　撤消这个走法
// 　　} else {
// 　　　int vl = -AlphaBeta(-vlBeta, -vlAlpha, nDepth - 1)
// 　　　撤消这个走法　
// 　　　if (vl >= vlBeta) {
// 　　　　将这个走法记录到历史表中
// 　　　　return vlBeta
// 　　　}
// 　　　if (vl > vlAlpha) {
// 　　　　设置最佳走法
// 　　　　vlAlpha = vl
// 　　　}
// 　　}
// 　}
// 　if (没有走过任何走法) {
// 　　return 杀棋的分数
// 　}
// 　将最佳走法记录到历史表中
// 　if (根节点) {
// 　　最佳走法就是电脑要走的棋
// 　}
// 　return vlAlpha
// }

function AlphaBeta(state, maxDepth, forbidRecord = false, remainTime = timeout, initialAlpha = -Infinity, initialBeta = Infinity) {
  let resultMove = null
  let isFinished = false

  let start = Date.now()
  let time = 0

  let score = (function helper(alpha, beta, depth) {
    //超过了时间
    if (Date.now() - start > remainTime) {
      return timeoutValue
    }

    if (depth == 0) {
      time++
      return state.evaluate()
    }

    // const hashScore = probeHash(state, alpha, beta)
    // if (hashScore) return hashScore

    let bestMove = null

    for (let move of state.generateMoves()) {
      const cancelMove = state.executeMove(move)
      if (state.isChecked()) {
        cancelMove()
      } else {
        const score = -helper(-beta, -alpha, depth - 1)
        // if (score > alpha && score < beta) {
        //   recordHash(state, score, hashfEXACT, move)
        // } else if (score <= alpha) {
        //   recordHash(state, score, hashfALPHA, move)
        // } else if (score >= beta) {
        //   recordHash(state, score, hashfBETA, move)
        // }
        cancelMove()
        //超时直接返回
        if (score === -timeoutValue) {
          return timeoutValue
        }

        if (score >= beta) {
          return beta
        }

        if (score > alpha) {
          bestMove = move
          alpha = score
        }

        if (depth === maxDepth) {
          resultMove = bestMove
        }
      }
    }

    if (bestMove == null) {
      return (maxDepth - depth) - checkmatedValue
    }

    return alpha
  })(initialAlpha, initialBeta, maxDepth)

  if (!forbidRecord) console.log("check how many nodes: " + time)

  return { resultMove, score, isFinished: score !== timeoutValue }
}

function MinMax(state, maxDepth, forbidRecord = false) {
  let resultMove = null;

  let time = 0;
  (function helper(depth) {
    if (depth == 0) {
      time++
      return state.evaluate()
    }

    let bestMove = null
    let bestScore = -Infinity

    for (let move of state.generateMoves()) {
      const cancelMove = state.executeMove(move)
      if (state.isChecked()) {
        cancelMove()
      } else {
        const score = -helper(depth - 1)
        cancelMove()

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

  if (!forbidRecord) console.log("check how many nodes: " + time)

  return { time, resultMove }
}

function search(state) {
  let start = Date.now()

  let moveInfo
  for (i = 1; i < 50; i++) {
    console.log(i)
    let currentMoveInfo = AlphaBeta(state, i, true, timeout - (Date.now() - start))

    if (!currentMoveInfo.isFinished && moveInfo == null) {
      moveInfo = currentMoveInfo
    }

    if (currentMoveInfo.isFinished) {
      moveInfo = currentMoveInfo
    } else if (currentMoveInfo.score > moveInfo.score) {
      moveInfo = currentMoveInfo
    }

    if (Date.now() - start > timeout) {
      break
    }
  }

  return moveInfo.resultMove
}

module.exports = { State, AlphaBeta, MinMax, search }
