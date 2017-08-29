const {
  Zobrist,
  rand16,
  ZobristNode,
  initZobristTable,
  HashTable,
  hashAlpha,
  hashBeta,
  hashExact
} = require("./hashtable")

const Pos = require('./position')

const hashMask = 1024 * 1024 - 1
const maxNum = Math.pow(2, 16) - 1

console.assert(new Zobrist(0, 0, 1, 1).and(Math.pow(2, 13)) === 0)
console.assert(new Zobrist(0, 0, 1, Math.pow(2, 13)).and(Math.pow(2, 13)) === Math.pow(2, 13))
console.assert(new Zobrist(0, 0, 1, 0).and(hashMask) === Math.pow(2, 16))
console.assert(new Zobrist(0, 0, 1, 1).and(hashMask) === Math.pow(2, 16) + 1)

console.assert(new Zobrist(232323, 121212, 45123, 29181).xor(new Zobrist(232323, 121212, 45123, 29181)).equal(new Zobrist()))

console.assert(new Zobrist(maxNum, maxNum, maxNum, maxNum).xor(new Zobrist(maxNum, maxNum, maxNum, maxNum)).equal(new Zobrist()))

console.assert(new Zobrist(0, 0, 1, 0).xor(new Zobrist(3, 2, 1, 0)).equal(new Zobrist(3, 2, 1, 0).xor(new Zobrist(0, 0, 1, 0))))

const key1 = new Zobrist(1, 2, 3, 4)
const check1 = new Zobrist(14, 24, 34, 489)

const node1 = new ZobristNode(key1, check1)

const key2 = new Zobrist(1, 2, 3, 44)
const key3 = new Zobrist(1, 2, 3, 4)

const check2 = new Zobrist(14, 24, 34, 489)
const node2 = new ZobristNode(key2)
const node3 = new ZobristNode(key3)
const node4 = new ZobristNode(key3, check2)

let hashTable = new HashTable()

hashTable.saveHashTable(node1, 3, 3, hashExact)

console.assert(hashTable.readHashTable(node2, 1) == null)
console.assert(hashTable.readHashTable(node3, 1) == null)
console.assert(hashTable.readHashTable(node4, 1) === 3)
console.assert(hashTable.readHashTable(node4, 4) == null)

let pos1 = new Pos()
pos1.setToOriginal()
let pos2 = new Pos()
pos2.setToOriginal()

hashTable = new HashTable()

hashTable.saveHashTable(pos1.zobrist, 3, 3, hashExact)
console.assert(hashTable.readHashTable(pos2.zobrist, 3, 1, 4) === 3)


function testZobrist(pos = new Pos(), depth = 4, hashTable = new HashTable()) {
  if (depth === 0) {
    return
  }

  const score = hashTable.readHashTable(pos.zobrist, pos.moveStack.length)
  if (score) {
    if(hashTable.hashTable[hashTable._getIndex(pos.zobrist)].fen !== pos.toFen()){
      console.log(hashTable.hashTable[hashTable._getIndex(pos.zobrist)].fen)
      console.log(pos.toFen())
    }
    console.assert(hashTable.hashTable[hashTable._getIndex(pos.zobrist)].fen === pos.toFen())
    return
  }

  hashTable.saveHashTable(pos.zobrist, 1, pos.moveStack.length, hashExact)
  hashTable.hashTable[hashTable._getIndex(pos.zobrist)].fen = pos.toFen()

  for (let move of pos.generateMoves()) {
    pos.makeMove(move)
    testZobrist(pos, depth - 1, hashTable)
    pos.unMakeMove(move)
  }
}

pos1.setToOriginal()

testZobrist(pos1,5)