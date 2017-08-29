// const expect = require('expect.js')


// //todo : knight,king,advisor
// const { State, AlphaBeta, MinMax } = require('./main')
// const { chessesZobrist, redChesses, blackChesses, chessesEval } = require("./pregen")

// const {
//   isInFort,
//   isInBoard,
//   King,
//   Advisor,
//   Bishop,
//   Knight,
//   Rook,
//   Can,
//   Pawn
// } = require("./chess")

// const red = true
// const black = false

// function initialTestState(state) {
//   state.chessboard = [
//     //0
//     [null, null, null, null, null, null, null, null, null],
//     //1
//     [null, null, null, null, null, null, null, null, null],
//     //2
//     [null, null, null, null, null, null, null, null, null],
//     //3
//     [null, null, null, null, null, null, null, null, null],
//     //4
//     [null, null, null, null, null, null, null, null, null],

//     //river

//     //5
//     [null, null, null, null, null, null, null, null, null],
//     //6
//     [null, null, null, null, null, null, null, null, null],
//     //7
//     [null, null, null, null, null, null, null, null, null],
//     //8
//     [null, null, null, null, null, null, null, null, null],
//     //9
//     [null, null, null, null, null, null, null, null, null]
//   ]

//   state.redChesses = []
//   state.blackChesses = []
//   state.chesses = []
//   state.color = red
//   state.addChess = function (chess) {
//     if (chess.color === red) {
//       this.redChesses.push(chess)
//       if (chess.constructor.name === "King") {
//         this.redKing = chess
//       }
//     } else {
//       this.blackChesses.push(chess)
//       if (chess.constructor.name === "King") {
//         this.blackKing = chess
//       }
//     }

//     this.chesses.push(chess)

//     this.chessboard[chess.x][chess.y] = chess
//   }
// }

// function sortMove(mv1, mv2) {
//   return mv1.x > mv2.x ? 1 : mv1.x === mv2.x ? (mv1.y > mv2.y ? 1 : mv1.y === mv2.y ? 0 : -1) : -1
// }

// describe('棋子', function () {
//   let state = new State()

//   beforeEach(function () {
//     initialTestState(state)
//   })

//   describe('bishop', function () {
//     it("attribute is correct", function () {
//       const bishop = new Bishop(9, 2, red)
//       expect(bishop.dead).be(false)
//       expect(bishop.color).be(true)
//       expect(bishop.offensive).be(false)
//     })

//     describe("move", function () {
//       beforeEach(function () {
//         initialTestState(state)
//       })

//       it("can move correct bishop moves", function () {
//         const bishop = new Bishop(9, 2, red)
//         state.addChess(bishop)

//         expect(state.generateMoves().sort(sortMove)).eql([{
//           chess: bishop,
//           x: 7,
//           y: 0
//         }, {
//           chess: bishop,
//           x: 7,
//           y: 4
//         }].sort(sortMove))

//         expect(bishop.canMove(7, 0)(state.chessboard)).be(true)
//         expect(bishop.canMove(7, 4)(state.chessboard)).be(true)
//         expect(bishop.canMove(9, 2)(state.chessboard)).be(false)
//       })

//       it("can move correct bishop moves", function () {
//         const bishop = new Bishop(7, 0, red)
//         state.addChess(bishop)

//         expect(state.generateMoves().sort(sortMove)).eql([{
//           chess: bishop,
//           x: 5,
//           y: 2
//         }, {
//           chess: bishop,
//           x: 9,
//           y: 2
//         }].sort(sortMove))

//         expect(bishop.canMove(5, 2)(state.chessboard)).be(true)
//         expect(bishop.canMove(9, 2)(state.chessboard)).be(true)
//       })

//       it("can move correct bishop moves", function () {
//         const bishop = new Bishop(7, 4, red)
//         state.addChess(bishop)

//         expect(state.generateMoves().sort(sortMove)).eql([{
//           chess: bishop,
//           x: 5,
//           y: 2
//         }, {
//           chess: bishop,
//           x: 9,
//           y: 2
//         }, {
//           chess: bishop,
//           x: 5,
//           y: 6
//         }, {
//           chess: bishop,
//           x: 9,
//           y: 6
//         }].sort(sortMove))

//         expect(bishop.canMove(5, 2)(state.chessboard)).be(true)
//         expect(bishop.canMove(9, 2)(state.chessboard)).be(true)
//         expect(bishop.canMove(5, 6)(state.chessboard)).be(true)
//         expect(bishop.canMove(9, 6)(state.chessboard)).be(true)
//       })

//       it("can move correct bishop moves", function () {
//         const bishop = new Bishop(7, 4, red)
//         const knight = new Knight(8, 3, black)
//         state.addChess(bishop)
//         state.addChess(knight)

//         expect(state.generateMoves().sort(sortMove)).eql([{
//           chess: bishop,
//           x: 5,
//           y: 2
//         }, {
//           chess: bishop,
//           x: 5,
//           y: 6
//         }, {
//           chess: bishop,
//           x: 9,
//           y: 6
//         }].sort(sortMove))

//         expect(bishop.canMove(5, 2)(state.chessboard)).be(true)
//         expect(bishop.canMove(9, 2)(state.chessboard)).be(false)
//         expect(bishop.canMove(5, 6)(state.chessboard)).be(true)
//         expect(bishop.canMove(9, 6)(state.chessboard)).be(true)
//       })

//       it("can move correct bishop moves", function () {
//         const bishop = new Bishop(5, 6, red)
//         state.addChess(bishop)

//         expect(state.generateMoves().sort(sortMove)).eql([{
//           chess: bishop,
//           x: 7,
//           y: 4
//         }, {
//           chess: bishop,
//           x: 7,
//           y: 8
//         }].sort(sortMove))

//         expect(bishop.canMove(7, 4)(state.chessboard)).be(true)
//         expect(bishop.canMove(7, 8)(state.chessboard)).be(true)
//       })

//       it("can move correct bishop moves", function () {
//         const bishop = new Bishop(0, 2, black)
//         state.addChess(bishop)
//         state.switchColor()

//         expect(state.generateMoves().sort(sortMove)).eql([{
//           chess: bishop,
//           x: 2,
//           y: 4
//         }, {
//           chess: bishop,
//           x: 2,
//           y: 0
//         }].sort(sortMove))

//         expect(bishop.canMove(2, 4)(state.chessboard)).be(true)
//         expect(bishop.canMove(2, 0)(state.chessboard)).be(true)
//       })
//     })
//   })

//   describe('pawn', function () {
//     it("attribute is correct", function () {
//       const pawn = new Pawn(5, 0, red)
//       expect(pawn.dead).be(false)
//       expect(pawn.color).be(true)
//       expect(pawn.offensive).be(true)
//     })

//     describe("check", function () {
//       beforeEach(function () {
//         initialTestState(state)
//       })

//       it("is checked", function () {
//         const pawn = new Pawn(3, 3, red)
//         const blackKing = new King(2, 3, black)
//         const redKing = new King(9, 4, red)

//         state.addChess(pawn)
//         state.addChess(redKing)
//         state.addChess(blackKing)

//         expect(state.isChecked()).be(true)
//       })

//       it("is checked", function () {
//         const pawn = new Pawn(2, 2, red)
//         const blackKing = new King(2, 3, black)
//         const redKing = new King(9, 4, red)

//         state.addChess(pawn)
//         state.addChess(redKing)
//         state.addChess(blackKing)

//         expect(state.isChecked()).be(true)
//       })

//       it("is checked", function () {
//         const pawn = new Pawn(2, 4, red)
//         const blackKing = new King(2, 3, black)
//         const redKing = new King(9, 4, red)

//         state.addChess(pawn)
//         state.addChess(redKing)
//         state.addChess(blackKing)

//         expect(state.isChecked()).be(true)
//       })

//       it("is not checked", function () {
//         const pawn = new Pawn(1, 3, red)
//         const blackKing = new King(2, 3, black)
//         const redKing = new King(9, 4, red)

//         state.addChess(pawn)
//         state.addChess(redKing)
//         state.addChess(blackKing)

//         expect(state.isChecked()).be(false)
//       })

//       it("is not checked", function () {
//         const pawn = new Pawn(3, 5, red)
//         const blackKing = new King(2, 3, black)
//         const redKing = new King(9, 4, red)

//         state.addChess(pawn)
//         state.addChess(redKing)
//         state.addChess(blackKing)

//         expect(state.isChecked()).be(false)
//       })

//       it("is not checked", function () {
//         const pawn = new Pawn(1, 5, red)
//         const blackKing = new King(2, 3, black)
//         const redKing = new King(9, 4, red)

//         state.addChess(pawn)
//         state.addChess(redKing)
//         state.addChess(blackKing)

//         expect(state.isChecked()).be(false)
//       })
//     })

//     describe("move", function () {
//       let pawn
//       beforeEach(function () {
//         pawn = null
//         initialTestState(state)
//       })

//       it("can move correct pawn moves", function () {
//         pawn = new Pawn(5, 0, red)
//         state.addChess(pawn)
//         expect(state.generateMoves()).eql([{
//           chess: pawn,
//           x: 4,
//           y: 0
//         }])

//         expect(pawn.canMove(4, 0)(state.chessboard)).be(true)
//         expect(pawn.canMove(5, 1)(state.chessboard)).be(false)
//         expect(pawn.canMove(4, 1)(state.chessboard)).be(false)
//       })

//       it("can move correct pawn moves", function () {
//         pawn = new Pawn(4, 2, red)
//         state.addChess(pawn)
//         expect(state.generateMoves().sort(sortMove)).eql([{
//           chess: pawn,
//           x: 3,
//           y: 2
//         }, {
//           chess: pawn,
//           x: 4,
//           y: 3
//         }, {
//           chess: pawn,
//           x: 4,
//           y: 1
//         }].sort(sortMove))

//         expect(pawn.canMove(3, 2)(state.chessboard)).be(true)
//         expect(pawn.canMove(4, 3)(state.chessboard)).be(true)
//         expect(pawn.canMove(4, 1)(state.chessboard)).be(true)
//       })

//       it("can move correct pawn moves", function () {
//         pawn = new Pawn(0, 0, red)
//         state.addChess(pawn)
//         expect(state.generateMoves().sort(sortMove)).eql([{
//           chess: pawn,
//           x: 0,
//           y: 1
//         }].sort(sortMove))

//         expect(pawn.canMove(0, 1)(state.chessboard)).be(true)
//       })

//       it("can move correct pawn moves", function () {
//         pawn = new Pawn(4, 0, black)
//         state.addChess(pawn)
//         state.switchColor()

//         expect(state.generateMoves().sort(sortMove)).eql([{
//           chess: pawn,
//           x: 5,
//           y: 0
//         }].sort(sortMove))

//         expect(pawn.canMove(5, 0)(state.chessboard)).be(true)
//       })

//       it("can move correct pawn moves", function () {
//         pawn = new Pawn(6, 2, black)
//         state.addChess(pawn)
//         state.switchColor()
//         expect(state.generateMoves().sort(sortMove)).eql([{
//           chess: pawn,
//           x: 6,
//           y: 1
//         }, {
//           chess: pawn,
//           x: 7,
//           y: 2
//         }, {
//           chess: pawn,
//           x: 6,
//           y: 3
//         }].sort(sortMove))

//         expect(pawn.canMove(6, 1)(state.chessboard)).be(true)
//         expect(pawn.canMove(7, 2)(state.chessboard)).be(true)
//         expect(pawn.canMove(6, 3)(state.chessboard)).be(true)
//       })

//       it("can move correct pawn moves", function () {
//         pawn = new Pawn(9, 2, black)
//         state.addChess(pawn)
//         state.switchColor()
//         expect(state.generateMoves().sort(sortMove)).eql([{
//           chess: pawn,
//           x: 9,
//           y: 1
//         }, {
//           chess: pawn,
//           x: 9,
//           y: 3
//         }].sort(sortMove))

//         expect(pawn.canMove(9, 1)(state.chessboard)).be(true)
//         expect(pawn.canMove(9, 3)(state.chessboard)).be(true)
//       })
//     })
//   })


//   describe("rook", function () {
//     it("attribute is correct", function () {
//       const rook = new Rook(9, 2, red)
//       expect(rook.dead).be(false)
//       expect(rook.color).be(true)
//       expect(rook.offensive).be(true)
//     })

//     describe("move", function () {
//       beforeEach(function () {
//         initialTestState(state)
//       })

//       it("can move correct rook moves", function () {
//         const rook = new Rook(5, 3, red)
//         const chess1 = new Bishop(5, 4, black)
//         const chess2 = new Bishop(5, 1, black)
//         const chess3 = new King(4, 3, red)

//         state.addChess(rook)
//         state.addChess(chess1)
//         state.addChess(chess2)
//         state.addChess(chess3)

//         expect(state.generateMoves().sort(sortMove)).eql([{
//           chess: rook,
//           x: 5,
//           y: 2
//         }, {
//           chess: rook,
//           x: 5,
//           y: 4
//         }, {
//           chess: rook,
//           x: 5,
//           y: 1
//         }, {
//           chess: rook,
//           x: 6,
//           y: 3
//         }, {
//           chess: rook,
//           x: 7,
//           y: 3
//         }, {
//           chess: rook,
//           x: 8,
//           y: 3
//         }, {
//           chess: rook,
//           x: 9,
//           y: 3
//         }].sort(sortMove))

//         expect(rook.canMove(5, 4)(state.chessboard)).be(true)
//         expect(rook.canMove(5, 2)(state.chessboard)).be(true)
//         expect(rook.canMove(5, 1)(state.chessboard)).be(true)
//         expect(rook.canMove(4, 3)(state.chessboard)).be(false)
//         expect(rook.canMove(6, 3)(state.chessboard)).be(true)
//         expect(rook.canMove(9, 3)(state.chessboard)).be(true)
//         expect(rook.canMove(10, 3)(state.chessboard)).be(false)
//       })
//     })
//   })

//   describe("cannon", function () {
//     it("attribute is correct", function () {
//       const can = new Can(7, 1, red)
//       expect(can.dead).be(false)
//       expect(can.color).be(true)
//       expect(can.offensive).be(true)
//     })

//     describe("move", function () {
//       beforeEach(function () {
//         initialTestState(state)
//       })

//       it("can move correct cannon moves", function () {
//         const can = new Can(5, 3, red)
//         const chess1 = new Bishop(5, 4, black)
//         const chess2 = new Bishop(5, 1, black)
//         const chess3 = new King(4, 3, red)

//         state.addChess(can)
//         state.addChess(chess1)
//         state.addChess(chess2)
//         state.addChess(chess3)

//         expect(state.generateMoves().sort(sortMove)).eql([{
//           chess: can,
//           x: 5,
//           y: 2
//         }, {
//           chess: can,
//           x: 6,
//           y: 3
//         }, {
//           chess: can,
//           x: 7,
//           y: 3
//         }, {
//           chess: can,
//           x: 8,
//           y: 3
//         }, {
//           chess: can,
//           x: 9,
//           y: 3
//         }].sort(sortMove))

//         expect(can.canMove(5, 4)(state.chessboard)).be(false)
//         expect(can.canMove(5, 2)(state.chessboard)).be(true)
//         expect(can.canMove(5, 1)(state.chessboard)).be(false)
//         expect(can.canMove(4, 3)(state.chessboard)).be(false)
//         expect(can.canMove(6, 3)(state.chessboard)).be(true)
//         expect(can.canMove(9, 3)(state.chessboard)).be(true)
//         expect(can.canMove(10, 3)(state.chessboard)).be(false)
//       })

//       it("can move correct cannon moves", function () {
//         const can = new Can(5, 3, red)
//         const chess1 = new Bishop(5, 4, black)
//         const chess2 = new Bishop(5, 1, black)
//         const chess3 = new King(4, 3, red)
//         const chess4 = new Bishop(5, 5, black)
//         const chess5 = new Bishop(2, 3, red)


//         state.addChess(can)
//         state.addChess(chess1)
//         state.addChess(chess2)
//         state.addChess(chess3)
//         state.addChess(chess4)
//         state.addChess(chess5)

//         expect(state.generateMoves().sort(sortMove)).eql([{
//           chess: can,
//           x: 5,
//           y: 2
//         }, {
//           chess: can,
//           x: 5,
//           y: 5
//         }, {
//           chess: can,
//           x: 6,
//           y: 3
//         }, {
//           chess: can,
//           x: 7,
//           y: 3
//         }, {
//           chess: can,
//           x: 8,
//           y: 3
//         }, {
//           chess: can,
//           x: 9,
//           y: 3
//         }].sort(sortMove))

//         expect(can.canMove(5, 4)(state.chessboard)).be(false)
//         expect(can.canMove(5, 5)(state.chessboard)).be(true)
//         expect(can.canMove(2, 3)(state.chessboard)).be(false)
//         expect(can.canMove(5, 2)(state.chessboard)).be(true)
//         expect(can.canMove(5, 1)(state.chessboard)).be(false)
//         expect(can.canMove(4, 3)(state.chessboard)).be(false)
//         expect(can.canMove(6, 3)(state.chessboard)).be(true)
//         expect(can.canMove(9, 3)(state.chessboard)).be(true)
//         expect(can.canMove(10, 3)(state.chessboard)).be(false)
//       })
//     })
//   })

//   describe("advisor", function () {
//     it("attribute is correct", function () {
//       const advisor = new Advisor(9, 2, red)
//       expect(advisor.dead).be(false)
//       expect(advisor.color).be(true)
//       expect(advisor.offensive).be(false)
//     })

//     describe("move", function () {
//       beforeEach(function () {
//         initialTestState(state)
//       })

//       it("can move correct advisor moves", function () {
//         const advisor = new Advisor(9, 3, red)

//         state.addChess(advisor)


//         expect(state.generateMoves().sort(sortMove)).eql([{
//           chess: advisor,
//           x: 8,
//           y: 4
//         }].sort(sortMove))

//         expect(advisor.canMove(8, 4)(state.chessboard)).be(true)
//       })

//       it("can move correct advisor moves", function () {
//         const advisor = new Advisor(1, 4, black)

//         state.addChess(advisor)
//         state.switchColor()


//         expect(state.generateMoves().sort(sortMove)).eql([{
//           chess: advisor,
//           x: 0,
//           y: 3
//         }, {
//           chess: advisor,
//           x: 0,
//           y: 5
//         }, {
//           chess: advisor,
//           x: 2,
//           y: 3
//         }, {
//           chess: advisor,
//           x: 2,
//           y: 5
//         }].sort(sortMove))

//         expect(advisor.canMove(0, 3)(state.chessboard)).be(true)
//         expect(advisor.canMove(0, 5)(state.chessboard)).be(true)
//         expect(advisor.canMove(2, 3)(state.chessboard)).be(true)
//         expect(advisor.canMove(2, 5)(state.chessboard)).be(true)
//       })
//     })
//   })

//   it("can generate chessboard by fen", function () {
//     state.initialByFen("3akabR1/9/2n1b4/p1R1p3p/6P2/9/P1P5P/4C4/4c4/2B1KAB2/ r - - 0 1")
//     expect(state.fen()).be("3akabR1/9/2n1b4/p1R1p3p/6P2/9/P1P5P/4C4/4c4/2B1KAB2/ r - - 0 1")
//   })

//   it("can generate chessboard by fen", function () {
//     state.initialByFen("rnbakabnr/9/1c5c1/p1p1p1p1p/9/9/P1P1P1P1P/1C5C1/9/RNBAKABNR/ r - - 0 1")

//     expect(state.fen()).be("rnbakabnr/9/1c5c1/p1p1p1p1p/9/9/P1P1P1P1P/1C5C1/9/RNBAKABNR/ r - - 0 1")
//   })

//   it("can generate same number moves", function () {
//     state.initialByFen("rnbakabnr/9/1c5c1/p1p1p1p1p/9/9/P1P1P1P1P/1C5C1/9/RNBAKABNR/ r - - 0 1")

//     expect(state.blackChesses.length).be(state.redChesses.length)

//     let redArray = []
//     let blackArray = []

//     let redMoves = state.generateMoves().length
//     state.switchColor()
//     let blackMoves = state.generateMoves().length

//     expect(redMoves).be(blackMoves)
//   })

//   describe("all move nums", function () {
//     let get = chessesZobrist.get
//     let evaluate = state.evaluate

//     before(function () {
//       let zobristArray = chessesZobrist.get(redChesses[0])
//       chessesZobrist.get = () => zobristArray

//       let evalArray = chessesEval.get(redChesses[0])
//       chessesEval.get = () => evalArray
//     })

//     after(function () {
//       chessesZobrist.get = get
//       state.evaluate = evaluate
//     })

//     beforeEach(function () {
//       initialTestState(state)
//     })


//     it("can pass perft", function () {
//       let blackAdvisor1 = new Advisor(0, 3, black)
//       state.addChess(blackAdvisor1)
//       let blackKing = new King(0, 4, black)
//       state.addChess(blackKing)
//       let blackAdvisor2 = new Advisor(0, 5, black)
//       state.addChess(blackAdvisor2)
//       let blackBishop1 = new Bishop(0, 6, black)
//       state.addChess(blackBishop1)
//       let redRook1 = new Rook(0, 7, red)
//       state.addChess(redRook1)

//       let blackKnight1 = new Knight(2, 2, black)
//       state.addChess(blackKnight1)
//       let blackBishop2 = new Bishop(2, 4, black)
//       state.addChess(blackBishop2)

//       let blackPawn1 = new Pawn(3, 0, black)
//       state.addChess(blackPawn1)
//       let redRook2 = new Rook(3, 2, red)
//       state.addChess(redRook2)
//       let blackPawn2 = new Pawn(3, 4, black)
//       state.addChess(blackPawn2)
//       let blackPawn3 = new Pawn(3, 8, black)
//       state.addChess(blackPawn3)

//       let redPawn1 = new Pawn(4, 6, red)
//       state.addChess(redPawn1)

//       let redPawn2 = new Pawn(6, 0, red)
//       state.addChess(redPawn2)
//       let redPawn3 = new Pawn(6, 2, red)
//       state.addChess(redPawn3)
//       let redPawn4 = new Pawn(6, 8, red)
//       state.addChess(redPawn4)

//       let redCan1 = new Can(7, 4, red)
//       state.addChess(redCan1)

//       let blackCan1 = new Can(8, 4, black)
//       state.addChess(new Can(8, 4, black))

//       let redBishop1 = new Bishop(9, 2, red)
//       state.addChess(redBishop1)
//       let redKing = new King(9, 4, red)
//       state.addChess(redKing)
//       let redAdvisor1 = new Advisor(9, 5, red)
//       state.addChess(redAdvisor1)
//       let redBishop2 = new Bishop(9, 6, red)
//       state.addChess(redBishop2)

//       let array = []
//       redRook1.generateMoves(array)(state.chessboard)
//       expect(array.length).be(11)

//       array = []
//       redRook2.generateMoves(array)(state.chessboard)
//       expect(array.length).be(7)

//       array = []
//       redPawn1.generateMoves(array)(state.chessboard)
//       expect(array.length).be(3)

//       array = []
//       redPawn2.generateMoves(array)(state.chessboard)
//       expect(array.length).be(1)

//       array = []
//       redPawn3.generateMoves(array)(state.chessboard)
//       expect(array.length).be(1)

//       array = []
//       redPawn4.generateMoves(array)(state.chessboard)
//       expect(array.length).be(1)

//       array = []
//       redCan1.generateMoves(array)(state.chessboard)
//       expect(array.length).be(12)

//       array = []
//       redBishop1.generateMoves(array)(state.chessboard)
//       expect(array.length).be(1)

//       array = []
//       redKing.generateMoves(array)(state.chessboard)
//       expect(array.length).be(2)

//       array = []
//       redAdvisor1.generateMoves(array)(state.chessboard)
//       expect(array.length).be(1)

//       array = []
//       redBishop2.generateMoves(array)(state.chessboard)
//       expect(array.length).be(1)

//       expect(state.generateMoves().length).be(41)
//       expect(state.fen()).be("3akabR1/9/2n1b4/p1R1p3p/6P2/9/P1P5P/4C4/4c4/2B1KAB2/ r - - 0 1")
//       expect(MinMax(state, 1, true).time).be(41)
//       expect(MinMax(state, 2, true).time).be(792)
//       expect(MinMax(state, 3, true).time).be(33531)
//       expect(MinMax(state, 4, true).time).be(721197)
//     })

//     it("can pass perft", function () {
//       state.initialByFen("rnbakabnr/9/1c5c1/p1p1p1p1p/9/9/P1P1P1P1P/1C5C1/9/RNBAKABNR/ r - - 0 1")
//       expect(MinMax(state, 1, true).time).be(44)
//       expect(MinMax(state, 2, true).time).be(1920)
//       expect(MinMax(state, 3, true).time).be(79666)
//       // expect(MinMax(state, 4, true).time).be(3290240)
//     })

//     it("can pass perft", function () {
//       state.initialByFen("3akabR1/9/2n1b4/p1R1p3p/6P2/9/P1P5P/4C4/4c4/2B1KAB2/ r - - 0 1")
//       expect(state.fen()).be("3akabR1/9/2n1b4/p1R1p3p/6P2/9/P1P5P/4C4/4c4/2B1KAB2/ r - - 0 1")
//       expect(MinMax(state, 1, true).time).be(41)
//       expect(MinMax(state, 2, true).time).be(792)
//       expect(MinMax(state, 3, true).time).be(33531)
//     })
//   })

//   // it("consuming how much time", function () {
//   //   let start = Date.now()

//   //   console.log("move: " + JSON.stringify(AlphaBeta(14, checkmatedValue - 100, checkmatedValue + 100)))

//   //   let end = Date.now()

//   //   console.log("time consume: " + (end - start))
//   // })
// })