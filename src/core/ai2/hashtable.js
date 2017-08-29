const { unknownValue, winValue, banValue, drawValue, checkmatedValue } = require('./evaluate')

const hashAlpha = 0
const hashExact = 1
const hashBeta = 2

const zobristFracMax = Math.pow(2, 16) - 1
const zobristFracMax2 = Math.pow(2, 32) - 1

function rand16() {
  return Math.floor(Math.random() * (zobristFracMax + 1))
}

class Zobrist {
  constructor(first = 0, second = 0, thrid = 0, last = 0) {
    this.first = first
    this.second = second
    this.thrid = thrid
    this.last = last
  }

  and(number) {
    if (number > zobristFracMax) {
      const last = this.last & (number & zobristFracMax)
      const thrid = this.thrid & (number >> 16)
      return (thrid << 16) + last
    } else {
      return this.last & number
    }
  }

  xor(zobrist) {
    return new Zobrist(zobrist.first ^ this.first, zobrist.second ^ this.second, zobrist.thrid ^ this.thrid, zobrist.last ^ this.last)
  }

  equal(zobrist) {
    return this.first === zobrist.first && this.second === zobrist.second && this.thrid === zobrist.thrid && this.last === zobrist.last
  }
}

function generateNoEmptyZobirstNode() {
  const key = new Zobrist(rand16(), rand16(), rand16(), rand16())
  const check = new Zobrist(rand16(), rand16(), rand16(), rand16())
  if (check.equal(new Zobrist())) {
    return generateNoEmptyZobirstNode()
  }
  return new ZobristNode(key, check)
}

//每种棋子在棋盘上生成的zobrist值
function initZobristTable() {
  //格式为：zobristTable[side][pieceTypeNum][position]

  let zobristTable = []

  for (let k = 0; k < 2; k++) {
    zobristTable[k] = []
    for (let i = 0; i < 7; i++) {
      zobristTable[k][i] = []
      for (let j = 0; j < 256; j++) {
        zobristTable[k][i][j] = generateNoEmptyZobirstNode()
      }
    }
  }

  return zobristTable
}

function initZobristSide() {
  return generateNoEmptyZobirstNode()
}

//一个新的局面的zobrist值
class ZobristNode {
  constructor(key = new Zobrist(), check = new Zobrist()) {
    this.key = key
    this.check = check
  }

  xor(zobristNode) {
    return new ZobristNode(zobristNode.key.xor(this.key), zobristNode.check.xor(this.check))
  }

  and(zobristNode) {
    return new ZobristNode(zobristNode.key.and(this.key), zobristNode.check.and(this.check))
  }

  equal(zobristNode) {
    return this.check.equal(zobristNode.check)
  }
}

//存储一个局面的value
class HashNode {
  constructor(zobristNode = new ZobristNode(), value = unknownValue, downwardDepth = 0, flag = hashExact, mv) {
    this.zobristNode = zobristNode
    this.value = value
    this.downwardDepth = downwardDepth
    this.flag = flag
    this.mv = mv
  }
}

//存储每个局面的value
class HashTable {
  constructor() {
    //低于2的32次方
    this.hashMask = 1024 * 1024 - 1
    this.hashTable = []
  }

  clearHashTable() {
    this.hashTable = []
  }

  _getIndex(zobristNode) {
    return zobristNode.key.and(this.hashMask)
  }


  //其中downwardDepth是当前局面到搜索到的最后一层的高度，ply是根节点到当前节点的高度,ply只对将军有用，不保存
  saveHashTable(newZobristNode, value, downwardDepth, flag, goodMove, ply = 0) {
    if (value < -winValue) {
      value = value - ply
    } else if (value > winValue) {
      value = value + ply
    }

    this.hashTable[this._getIndex(newZobristNode)] = new HashNode(newZobristNode, value, downwardDepth, flag, goodMove)
  }

  readHashTable(newZobristNode, currentDownwardDepth, currentAlpha, currentBeta, ply = 0) {
    const hashNode = this.hashTable[this._getIndex(newZobristNode)]

    //没找到对应的键
    if (!hashNode) return

    const { zobristNode, value, downwardDepth, flag, mv } = hashNode

    //校验值相同
    if (zobristNode && zobristNode.equal(newZobristNode)) {

      //将军的值肯定是exact值
      if (value < -winValue) {
        if (value >= -banValue) {
          return
        }
        return value + ply
      } else if (value > winValue) {
        if (value <= banValue) {
          return
        }
        return value - ply
      } else if (value === drawValue || value === -drawValue) {
        return
      }

      //置换表里高度更高
      if (currentDownwardDepth <= downwardDepth) {

        //是确定的值
        if (flag === hashExact) {
          return value
        }

        //保存的是一个alpha值
        else if (flag === hashAlpha) {
          //保存的alpha值若小于当前alpha值，就返回当前alpha值，因为pv值是小于保存的alpha值的，也小于当前alpha值
          if (currentAlpha >= value) {
            return currentAlpha
          }
        }

        //保存的是一个beta值
        else if (flag === hashBeta) {
          //保存的beta值若大于当前beta值，就返回当前beta值，因为pv值是大于保存的beta值的，也大于当前beta值
          if (currentBeta <= value) {
            return currentBeta
          }
        }

        return mv
      }
    }
  }
}

const zobristTable = initZobristTable()
const zobristSide = initZobristSide()

module.exports = {
  Zobrist,
  rand16,
  ZobristNode,
  zobristTable,
  zobristSide,
  HashTable,
  hashAlpha,
  hashBeta,
  hashExact
}
