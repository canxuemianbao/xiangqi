const should = require('should')

const { Chess, Bing, Shuai, Shi, Che, Xiang, Ma, Pao } = require('../core/chess')
const area = require('../core/area')
const GameTurn = require('../core/gameTurn')

const util = require('./util')

const Color = require('../core/color')
const Red = Color.Red
const Black = Color.Black

describe('chess', function () {
  let redChess = new Chess('chess', 5, 4, Red)
  let blackChess = new Chess('chess', 3, 8, Black)
  let gameTurn = new GameTurn(Red)

  beforeEach(function () {
    gameTurn = new GameTurn(Red)
  })

  afterEach(function () {
    gameTurn = null
  })

  it('can not generate an out of bound chess', function () {
    should(() => new Chess('chess', 15, 4, Red)).throw()
  })

  it('is comrade when color is the same',function(){
    const redChess1=new Chess('redChess1', 5, 4, Red)
    const redChess2=new Chess('redChess2', 8, 4, Red)
    const blackChess1=new Chess('blackChess1', 7, 4, Black)
    const blackChess2=new Chess('blackChess2', 9, 4, Black)

    should(redChess1.isComrade(redChess2)).true()
    should(redChess1.isComrade(blackChess1)).false()
    should(blackChess1.isComrade(redChess2)).false()
    should(blackChess1.isComrade(blackChess2)).true()
  })

  it('should return true when the chess is forwarding', function () {
    should(redChess.isForward(4)).be.true()
    should(redChess.isForward(5)).be.true()

    should(blackChess.isForward(4)).be.true()
    should(redChess.isForward(3)).be.true()
  })

  it('should return false when the chess is downwarding', function () {
    should(redChess.isForward(6)).be.false()
    should(blackChess.isForward(2)).be.false()
  })

  it('should in wholeArea', function () {
    const randomWholeArea = util.randomArea.bind(null, area.wholeArea)
    util.random(randomWholeArea, 50).forEach(([row, column]) => {
      should(redChess.wholeArea[row][column]).be.true()
      should(Chess.isInArea(redChess.wholeArea)(row, column)).be.true()
    })

    util.random(randomWholeArea, 50).forEach(([row, column]) => {
      should(blackChess.wholeArea[row][column]).be.true()
      should(Chess.isInArea(blackChess.wholeArea)(row, column)).be.true()
    })
  })

  it('should in myArea', function () {
    const randomRedArea = util.randomArea.bind(null, area.myArea(Red))
    util.random(randomRedArea, 50).forEach(([row, column]) => {
      should(redChess.myArea[row][column]).be.true()
      should(Chess.isInArea(redChess.myArea)(row, column)).be.true()
    })

    const randomBlackArea = util.randomArea.bind(null, area.myArea(Black))
    util.random(randomBlackArea, 50).forEach(([row, column]) => {
      should(blackChess.myArea[row][column]).be.true()
      should(Chess.isInArea(blackChess.myArea)(row, column)).be.true()
    })
  })

  it('should in myNineArea', function () {
    const randomRedNineArea = util.randomArea.bind(null, area.myNineArea(Red))
    util.random(randomRedNineArea, 50).forEach(([row, column]) => {
      should(redChess.myNineArea[row][column]).be.true()
      should(Chess.isInArea(redChess.myNineArea)(row, column)).be.true()
    })

    const randomBlackNineArea = util.randomArea.bind(null, area.myNineArea(Black))
    util.random(randomBlackNineArea, 50).forEach(([row, column]) => {
      should(blackChess.myNineArea[row][column]).be.true()
      should(Chess.isInArea(blackChess.myNineArea)(row, column)).be.true()
    })
  })

  describe('Bing', function () {
    beforeEach(function () {
      gameTurn = new GameTurn(Red)
    })

    //isForward has beened tested,so color is not the import thing in this test 
    it('can move forward in my area but cannot move horizontally', function () {
      const myAreaBing = new Bing('myAreaBing', 6, 4, Red)

      const randomArea = util.randomArea.bind(null, area.myArea(Red))

      util.random(randomArea, 500).forEach(([row, column]) => {
        if (row === myAreaBing.row - 1 && column === myAreaBing.column) {
          should(myAreaBing._isMovePatternValidInMyArea(row, column)).be.true()
        } else {
          should(myAreaBing._isMovePatternValidInMyArea(row, column)).be.false()
        }
      })
    })

    // isForward has beened tested,so color is not the import thing in this test 
    it('can move forward in opponent area', function () {
      const bing = new Bing('bing', 4, 6, Red)

      const randomArea = util.randomArea.bind(null, area.wholeArea)

      util.random(randomArea, 500).forEach(([row, column]) => {
        if (row === bing.row - 1 && column === bing.column) {
          should(bing._isMovePatternValidInOpponentArea(row, column)).be.true()
        } else if (row === bing.row && column === bing.column - 1) {
          should(bing._isMovePatternValidInOpponentArea(row, column)).be.true()
        } else if (row === bing.row && column === bing.column + 1) {
          should(bing._isMovePatternValidInOpponentArea(row, column)).be.true()
        } else {
          should(bing._isMovePatternValidInOpponentArea(row, column)).be.false()
        }
      })
    })

    // isForward has beened tested,so color is not the import thing in this test 
    it('can move forward in own area', function () {
      const bing1 = new Bing('bing1', 6, 6, Red)
      const bing2 = new Bing('bing2', 4, 6, Red)

      const randomArea = util.randomArea.bind(null, area.wholeArea)

      util.random(randomArea, 500).forEach(([row, column]) => {
        //bing1
        if (row === bing1.row - 1 && column === bing1.column) {
          should(bing1.isMovePatternValid(gameTurn)(row, column)).be.true()
        } else {
          should(bing1.isMovePatternValid(gameTurn)(row, column)).be.false()
        }

        //bing2
        if (row === bing2.row - 1 && column === bing2.column) {
          should(bing2.isMovePatternValid(gameTurn)(row, column)).be.true()
        } else if (row === bing2.row && column === bing2.column - 1) {
          should(bing2.isMovePatternValid(gameTurn)(row, column)).be.true()
        } else if (row === bing2.row && column === bing2.column + 1) {
          should(bing2.isMovePatternValid(gameTurn)(row, column)).be.true()
        } else {
          should(bing2.isMovePatternValid(gameTurn)(row, column)).be.false()
        }
      })
    })
  })

  describe('Shuai', function () {
    it('can not generate an out of bound shuai', function () {
      should(() => new Shuai('Shuai', 10, 4, Red)).throw()
      should(() => new Shuai('Shuai', 6, 4, Red)).throw()
      should(() => new Shuai('Shuai', 9, 6, Red)).throw()
      should(() => new Shuai('Shuai', 9, 2, Red)).throw()
    })

    it('can move in own area', function () {
      const shuai = new Shuai('Shuai', 9, 4, Red)
      const randomMyNineArea = util.randomArea.bind(null, area.myNineArea(Red))

      util.random(randomMyNineArea, 500).forEach(([row, column]) => {
        if (Math.abs(shuai.row - row) + Math.abs(shuai.column - column) === 1) {
          should(shuai.isMovePatternValid(gameTurn)(row, column)).true()
        }
        else {
          should(shuai.isMovePatternValid(gameTurn)(row, column)).false()
        }
      })
    })
  })

  describe('Shi', function () {
    it('can not generate an out of bound shi', function () {
      should(() => new Shi('shi', 10, 4, Red)).throw()
      should(() => new Shi('shi', 6, 4, Red)).throw()
      should(() => new Shi('shi', 9, 6, Red)).throw()
      should(() => new Shi('shi', 9, 2, Red)).throw()
    })

    it('can move in own area', function () {
      const shi = new Shi('shi', 9, 5, Red)
      const randomMyNineArea = util.randomArea.bind(null, area.myNineArea(Red))

      util.random(randomMyNineArea, 500).forEach(([row, column]) => {
        if (Math.abs(shi.row - row) === 1 && Math.abs(shi.column - column) === 1) {
          should(shi.isMovePatternValid(gameTurn)(row, column)).true()
        } else {
          should(shi.isMovePatternValid(gameTurn)(row, column)).false()
        }
      })
    })
  })

  describe('Xiang', function () {
    xiang = new Xiang('xiang', 9, 6, Red)
    it('can not generate an out of bound xiang', function () {
      should(() => new Xiang('xiang', 11, 4, Red)).throw()
      should(() => new Xiang('xiang', 4, 4, Red)).throw()
      should(() => new Xiang('xiang', -1, 6, Red)).throw()
      should(() => new Xiang('xiang', 10, 2, Red)).throw()
    })

    beforeEach(function () {
      gameTurn = new GameTurn(Red)
      gameTurn.add(xiang)
    })

    it('can move in own area', function () {
      const randomMyArea = util.randomArea.bind(null, area.myArea(Red))

      util.random(randomMyArea, 500).forEach(([row, column]) => {
        if (Math.abs(xiang.row - row) === 2 && Math.abs(xiang.column - column) === 2) {
          should(xiang.isMovePatternValid(gameTurn)(row, column)).true()
        }
        else {
          should(xiang.isMovePatternValid(gameTurn)(row, column)).false()
        }
      })
    })

    it('can not move in own area if there exist an obstacle', function () {
      const randomMyArea = util.randomArea.bind(null, area.myArea(Red))

      util.random(randomMyArea, 500).forEach(([row, column]) => {
        if (Math.abs(xiang.row - row) === 2 && Math.abs(xiang.column - column) === 2) {
          const obstacle = new Chess('chess', (xiang.row + row) / 2, (xiang.column + column) / 2, Red)
          gameTurn.add(obstacle)
          should(xiang.isMovePatternValid(gameTurn)(row, column)).false()
          gameTurn._delete(obstacle)
        }
      })
    })
  })

  describe('Ma', function () {
    ma = new Ma('Ma', 5, 6, Red)
    beforeEach(function () {
      gameTurn = new GameTurn(Red)
      gameTurn.add(ma)
    })

    it('can move in own area', function () {
      const randomArea = util.randomArea.bind(null, area.wholeArea)

      util.random(randomArea, 500).forEach(([row, column]) => {
        if (Math.abs(ma.row - row) === 2 && Math.abs(ma.column - column) === 1) {
          should(ma.isMovePatternValid(gameTurn)(row, column)).true()
        }
        else if (Math.abs(ma.row - row) === 1 && Math.abs(ma.column - column) === 2) {
          should(ma.isMovePatternValid(gameTurn)(row, column)).true()
        }
        else {
          should(ma.isMovePatternValid(gameTurn)(row, column)).false()
        }
      })
    })

    it('can not move in own area if there exist an obstacle', function () {
      const randomArea = util.randomArea.bind(null, area.wholeArea)

      util.random(randomArea, 500).forEach(([row, column]) => {
        if (Math.abs(ma.row - row) === 2 && Math.abs(ma.column - column) === 1) {
          const newChess = new Chess('chess', (ma.row + row) / 2, ma.column, Red)
          gameTurn.add(newChess)
          should(ma.isMovePatternValid(gameTurn)(row, column)).false()
          gameTurn._delete(newChess)
        }
        else if (Math.abs(ma.row - row) === 1 && Math.abs(ma.column - column) === 2) {
          const newChess = new Chess('chess', ma.row, (ma.column + column) / 2, Red)
          gameTurn.add(newChess)
          should(ma.isMovePatternValid(gameTurn)(row, column)).false()
          gameTurn._delete(newChess)
        }
        else {
          should(ma.isMovePatternValid(gameTurn)(row, column)).false()
        }
      })
    })
  })

  describe('che', function () {
    const che = new Che('che', 9, 4, Red)
    beforeEach(function () {
      gameTurn = new GameTurn(Red)
      gameTurn.add(che)
    })

    it('can move in own area', function () {
      const randomArea = util.randomArea.bind(null, area.wholeArea)

      util.random(randomArea, 500).forEach(([row, column]) => {
        if (che.row === row && che.column !== column) {
          should(che.isMovePatternValid(gameTurn)(row, column)).true()
        }
        else if (che.column === column && che.row !== row) {
          should(che.isMovePatternValid(gameTurn)(row, column)).true()
        }
        else {
          should(che.isMovePatternValid(gameTurn)(row, column)).false()
        }
      })
    })

    it('can not move the same column or the same row if there exist obstacle', function () {
      const randomArea = util.randomArea.bind(null, area.wholeArea)

      util.random(randomArea, 5).forEach(([row, column]) => {
        if (che.row === row && Math.abs(che.column - column) > 1) {
          const newChess = new Chess('chess', che.row, Math.floor((che.column + column) / 2), Red)
          gameTurn.add(newChess)
          should(che.isMovePatternValid(gameTurn)(row, column)).false()
          gameTurn._delete(newChess)
        }
        else if (che.column === column && Math.abs(che.row - row) > 1) {
          const newChess = new Chess('chess', Math.floor((che.row + row) / 2), che.column, Red)
          gameTurn.add(newChess)
          should(che.isMovePatternValid(gameTurn)(row, column)).false()
          gameTurn._delete(newChess)
        }
      })
    })

    it('can move to black chess position',function(){
      const blackChess=new Chess('black',5,4,Black)
      gameTurn.add(blackChess)
      should(che.canMove(gameTurn)(blackChess.row,blackChess.column)).true()
    })
  })

  describe('Pao', function () {
    const pao = new Pao('Pao', 9, 4, Red)
    beforeEach(function () {
      gameTurn = new GameTurn(Red)
      gameTurn.add(pao)
    })

    it('can move in own area', function () {
      const randomArea = util.randomArea.bind(null, area.wholeArea)

      util.random(randomArea, 500).forEach(([row, column]) => {
        if (pao.row === row && pao.column !== column) {
          should(pao.isMovePatternValid(gameTurn)(row, column)).true()
        }
        else if (pao.column === column && pao.row !== row) {
          should(pao.isMovePatternValid(gameTurn)(row, column)).true()
        }
        else {
          should(pao.isMovePatternValid(gameTurn)(row, column)).false()
        }
      })
    })

    it('can not move when there exist obstacle', function () {
      const randomArea = util.randomArea.bind(null, area.wholeArea)

      util.random(randomArea, 500).forEach(([row, column]) => {
        if (pao.row === row && Math.abs(pao.column - column) > 1) {
          const newChess = new Chess('chess', pao.row, Math.floor((pao.column + column) / 2), Red)
          gameTurn.add(newChess)
          should(pao.isMovePatternValid(gameTurn)(row, column)).false()
          gameTurn._delete(newChess)
        }
        else if (pao.column === column && Math.abs(pao.row - row) > 1) {
          const newChess = new Chess('chess', Math.floor((pao.row + row) / 2), pao.column, Red)
          gameTurn.add(newChess)
          should(pao.isMovePatternValid(gameTurn)(row, column)).false()
          gameTurn._delete(newChess)
        }
      })
    })

    it('can move to opponentChess', function () {
      const opponentChess1 = new Chess('opponentChess1', 9, 1, Black)
      gameTurn.add(opponentChess1)

      should(pao.canMove(gameTurn)(opponentChess1.row, opponentChess1.column)).false()

      const middleChess1 = new Chess('middleChess1', 9, 2, Black)
      gameTurn.add(middleChess1)

      should(pao.canMove(gameTurn)(opponentChess1.row, opponentChess1.column)).true()

      const opponentChess2 = new Chess('opponentChess2', 6, 4, Black)
      gameTurn.add(opponentChess2)

      should(pao.canMove(gameTurn)(opponentChess2.row, opponentChess2.column)).false()

      const middleChess2 = new Chess('middleChess2', 8, 4, Black)
      gameTurn.add(middleChess2)

      should(pao.canMove(gameTurn)(opponentChess2.row, opponentChess2.column)).true()

      const opponentChess3 = new Chess('opponentChess1', 9, 3, Black)
      gameTurn.add(opponentChess3)
      should(pao.canMove(gameTurn)(opponentChess1.row, opponentChess1.column)).false()
      should(pao.canMove(gameTurn)(middleChess1.row, middleChess1.column)).true()
    })

    it('can move the same column or the same row if there is not obstacle', function () {
      const randomArea = util.randomArea.bind(null, area.wholeArea)

      util.random(randomArea, 5).forEach(([row, column]) => {
        if (pao.row === row && Math.abs(pao.column - column) > 1) {
          const newChess = new Chess('chess', pao.row, Math.floor((pao.column + column) / 2), Red)
          gameTurn.add(newChess)
          should(pao.isMovePatternValid(gameTurn)(row, column)).false()
          gameTurn._delete(newChess)
        }
        else if (pao.column === column && Math.abs(pao.row - row) > 1) {
          const newChess = new Chess('chess', Math.floor((pao.row + row) / 2), pao.column, Red)
          gameTurn.add(newChess)
          should(pao.isMovePatternValid(gameTurn)(row, column)).false()
          gameTurn._delete(newChess)
        }
      })
    })
  })
})