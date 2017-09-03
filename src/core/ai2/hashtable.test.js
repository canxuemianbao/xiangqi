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

  it('', function () {
    const hashTable = new HashTable()
    hashTable.saveHashTable(new ZobristNode(), checkmatedValue - 5, 0, hashExact,null,2)
    console.log(hashTable.readHashTable(new ZobristNode(), 10, -Infinity, Infinity, 1))
  })
})