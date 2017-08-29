const expect = require('expect.js')
const { State, AlphaBeta, search } = require("./main")
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

describe("evaluate", function () {
  it("can get correct value", function () {
    expect(chessesEval.get(redRooks[0])[0][0]).be(206)
  })

  it("can get correct value", function () {
    expect(chessesEval.get(blackRooks[0])[0][0]).be(194)
    expect(chessesEval.get(blackRooks[0])[9][0]).be(206)
  })

  it("has correct eval", function () {
    const state = new State()
    state.initialByFen("rnbakabnr/9/1c5c1/p1p1p1p1p/9/9/P1P1P1P1P/1C5C1/9/RNBAKABNR w - - 0 1")

    expect(state.evaluate()).be(0)

    state.executeMove({
      chess: redCans[0],
      x: 0,
      y: 1
    })

    expect(state.evaluate()).be(-89)

    state.executeMove({
      chess: blackRooks[0],
      x: 0,
      y: 1
    })


    const state2 = new State()
    state2.initialByFen("1rbakabnr/9/1c5c1/p1p1p1p1p/9/9/P1P1P1P1P/7C1/9/RNBAKABNR/ r - - 0 2")
    expect(state2.evaluate()).be(state.evaluate())
  })

  it('', function () {
    const state = new State()
    state.initialByFen("rnbakabnr/9/1c5c1/p1p1p1p1p/9/9/P1P1P1P1P/1C5C1/9/RNBAKABNR w - - 0 1")

    state.executeMove({
      chess: redAdvisors[0],
      x: 8,
      y: 4
    })
    console.log(state.evaluate())
  })
})