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

const {
  checkmatedValue,
  winValue,
  banValue
} = require('./evaluate')

const Pos = require('./position')

describe('hashtable', function () {
  beforeEach(function () {

  })

  //新的层数低于旧的
  it('will return 999996', function () {
    const hashTable = new HashTable()
    hashTable.saveHashTable(new ZobristNode(), checkmatedValue - 5, 0, hashExact, null, 2)
    console.assert(hashTable.readHashTable(new ZobristNode(), 10, -Infinity, Infinity, 1) === checkmatedValue - 5 + 2 - 1)
  })

  //新的层数高于旧的
  it('will return 999993', function () {
    const hashTable = new HashTable()
    hashTable.saveHashTable(new ZobristNode(), checkmatedValue - 5, 0, hashExact, null, 1)
    console.assert(hashTable.readHashTable(new ZobristNode(), 10, -Infinity, Infinity, 3) === checkmatedValue - 5 + 1 - 3)
  })

  it('will return exact value', function () {
    const hashTable = new HashTable()
    hashTable.saveHashTable(new ZobristNode(), 100, 10, hashExact, null, 1)
    console.assert(hashTable.readHashTable(new ZobristNode(), 10, -Infinity, Infinity, 3) === 100)
    console.assert(hashTable.readHashTable(new ZobristNode(), 11, -Infinity, Infinity, 3) == null)
  })
})