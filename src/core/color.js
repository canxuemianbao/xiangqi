class Red {
  static isForward(chessRow) {
    return function (targetRow) {
      return targetRow - chessRow <= 0
    }
  }
}

class Black {
  static isForward(chessRow) {
    return function (targetRow) {
      return targetRow - chessRow >= 0
    }
  }
}

module.exports={Red,Black}