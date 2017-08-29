// const expect = require('expect.js')
// const { chessesZobrist, Zobrist, redChesses, blackChesses } = require("./pregen")
// const { State } = require("./main")

// describe('zobrist', function () {
//   it("has correct length", function () {
//     redChesses.forEach((chess) => {
//       expect(chessesZobrist.get(chess).length).be(10)
//       Array.from(Array(10)).forEach((item, i) => {
//         expect(chessesZobrist.get(chess)[i].length).be(9)
//       })
//     })

//     blackChesses.forEach((chess) => {
//       expect(chessesZobrist.get(chess).length).be(10)
//       Array.from(Array(10)).forEach((item, i) => {
//         expect(chessesZobrist.get(chess)[i].length).be(9)
//       })
//     })
//   })

//   it("has at most 64 bit numbers", function () {
//     redChesses.forEach((chess) => {
//       expect(chessesZobrist.get(chess).length).be(10)
//       Array.from(Array(10)).forEach((item, i) => {
//         Array.from(Array(9)).forEach((item, j) => {
//           expect(chessesZobrist.get(chess)[i][j].valueOf().length).lessThan(66)
//         })
//       })
//     })

//     blackChesses.forEach((chess) => {
//       expect(chessesZobrist.get(chess).length).be(10)
//       Array.from(Array(10)).forEach((item, i) => {
//         Array.from(Array(9)).forEach((item, j) => {
//           expect(chessesZobrist.get(chess)[i][j].valueOf().length).lessThan(66)
//         })
//       })
//     })
//   })

//   it("should generate correct inital zobrist", function () {
//     const state = new State()
//     state.addChess(redChesses[0])

//     state.generateZobrist()

//     expect(state.zobr.dwZobristLock).eql(chessesZobrist.get(redChesses[0])[redChesses[0].x][redChesses[0].y])
//   })

//   it("should generate correct zobrist", function () {
//     const state = new State()
//     state.initialByFen("rnbakabnr/9/1c5c1/p1p1p1p1p/9/9/P1P1P1P1P/1C5C1/9/RNBAKABNR r - - 0 1")

//     // expect(zobrist).eql(state.zobr.dwZobristLock)
//   })

//   it("should correctly xor other zobrist", function () {
//     expect(new Zobrist(0, 0, 0, 0).xor(new Zobrist(1, 12, 3, 45))).eql(new Zobrist(1, 12, 3, 45))
//   })

//   it("should generate correct zobrist when execute a move", function () {
//     const state = new State()
//     state.addChess(redChesses[0])

//     state.addChess(blackChesses[0])

//     state.generateZobrist()

//     const stateZobrist = state.zobr.dwZobristLock

//     let cancelMove = state.executeMove({
//       chess: redChesses[0],
//       x: blackChesses[0].x,
//       y: blackChesses[0].y,
//     })

//     expect(state.zobr.dwZobristLock).eql(chessesZobrist.get(redChesses[0])[blackChesses[0].x][blackChesses[0].y])

//     cancelMove()

//     expect(state.zobr.dwZobristLock).eql(stateZobrist)

//     cancelMove = state.executeMove({
//       chess: redChesses[0],
//       x: 4,
//       y: 5
//     })

//     expect(state.zobr.dwZobristLock).eql(chessesZobrist.get(redChesses[0])[4][5].xor(chessesZobrist.get(blackChesses[0])[blackChesses[0].x][blackChesses[0].y]))
//     cancelMove()
//     expect(state.zobr.dwZobristLock).eql(stateZobrist)
//   })
// })