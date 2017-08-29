const should = require('should')

const { Chess, Bing, Shuai, Shi, Che, Xiang, Ma, Pao } = require('../core/chess')
const GameTurn = require('../core/gameTurn')
const { ComradeError, FinishError, NotYourRoundError } = require('../core/error')

const util = require('./util')

const Color = require('../core/color')
const Red = Color.Red
const Black = Color.Black

describe('gameTurn test', function () {
  let gameTurn = new GameTurn(Red)

  beforeEach(function () {
    gameTurn = new GameTurn(Red)
  })

  it('can add chess', function () {
    should(gameTurn.color).equal(Red)
    should(gameTurn.arrayFormChesses).length(0)
    should(gameTurn._currentChesses).length(0)
    should(gameTurn._lastChesses).length(0)
    const red_shuai = new Shuai('red_shuai', 9, 4, Red)

    gameTurn.add(red_shuai)
    should(gameTurn._currentShuai).equal(red_shuai)
    should(gameTurn.arrayFormChesses).length(1)
    should(gameTurn._currentChesses).length(1)
    should(gameTurn._lastChesses).length(0)

    const black_shuai = new Shuai('black_shuai', 0, 4, Black)
    gameTurn.add(black_shuai)
    should(gameTurn._lastShuai).equal(black_shuai)
    should(gameTurn._currentShuai).equal(red_shuai)
    should(gameTurn.arrayFormChesses).length(2)
    should(gameTurn._currentChesses).length(1)
    should(gameTurn._lastChesses).length(1)
  })

  it('can not add chess because of the same color in the same position', function () {
    const chess1 = new Chess('chess', 9, 4, Red)
    const chess2 = new Chess('chess', 9, 4, Red)
    gameTurn.add(chess1)
    should(() => gameTurn.add(chess2)).throw()
  })

  it('can get correct color', function () {
    should(gameTurn.color).equal(Red)
    should(gameTurn._nextColor).equal(Black)
    should(gameTurn._lastColor).equal(Black)

    gameTurn.turnColor()
    should(gameTurn.color).equal(Black)
    should(gameTurn._nextColor).equal(Red)
    should(gameTurn._lastColor).equal(Red)
  })

  it('can not get update gameTurn because it is not your turn', function () {
    should(() => gameTurn.update(new Chess('chess1', 4, 5, Black), new Chess('chess2', 4, 6, Black))).throw(NotYourRoundError)
  })

  it('is is checkmated', function () {
    const red_pao_1 = new Pao('red_pao_1', 7, 4, Red)
    const red_pao_2 = new Pao('red_pao_2', 6, 4, Red)
    const red_shuai = new Shuai('red_shuai', 9, 4, Red)

    gameTurn.add(red_pao_1)
    gameTurn.add(red_pao_2)
    gameTurn.add(red_shuai)

    const black_shi_1 = new Shi('black_shi_1', 0, 3, Black)
    const black_shi_2 = new Shi('black_shi_2', 0, 5, Black)
    const black_shuai = new Shuai('black_shuai', 0, 4, Black)

    gameTurn.add(black_shi_1)
    gameTurn.add(black_shi_2)

    gameTurn.add(black_shuai)

    gameTurn.color=Black
    should(gameTurn.isCheckmated).true()
  })

  it('is is checkmated', function () {
    const red_shi_1 = new Shuai('red_shi_1', 9, 3, Red)
    const red_shi_2 = new Shuai('red_shi_2', 9, 5, Red)
    const red_shuai = new Shuai('red_shuai', 9, 4, Red)

    gameTurn.add(red_shi_1)
    gameTurn.add(red_shi_2)

    gameTurn.add(red_shuai)

    const black_pao_1 = new Pao('black_pao_1', 9, 7, Black)
    const black_pao_2 = new Pao('black_pao_2', 9, 6, Black)
    const black_che_1 = new Pao('black_che_1', 8, 6, Black)
    const black_shi_1 = new Shi('black_shi_1', 0, 3, Black)
    const black_shi_2 = new Shi('black_shi_2', 1, 4, Black)
    const black_shuai = new Shuai('black_shuai', 0, 4, Black)

    gameTurn.add(black_pao_1)
    gameTurn.add(black_pao_2)

    gameTurn.add(black_shi_1)
    gameTurn.add(black_shi_2)

    gameTurn.add(black_shuai)

    gameTurn.color=Red
    should(gameTurn.isCheckmated).true()
  })  

  it('is is not checkmated', function () {
    const red_pao_1 = new Pao('red_pao_1', 7, 4, Red)
    const red_pao_2 = new Pao('red_pao_2', 5, 3, Red)
    const red_shuai = new Shuai('red_shuai', 9, 4, Red)

    gameTurn.add(red_pao_1)
    gameTurn.add(red_pao_2)
    gameTurn.add(red_shuai)

    const black_shi_1 = new Shi('black_shi_1', 0, 3, Black)
    const black_shi_2 = new Shi('black_shi_2', 0, 5, Black)
    const black_shuai = new Shuai('black_shuai', 0, 4, Black)

    gameTurn.add(black_shi_1)
    gameTurn.add(black_shi_2)

    gameTurn.add(black_shuai)

    gameTurn.color=Black
    should(gameTurn.isCheckmated).false()
  })
})