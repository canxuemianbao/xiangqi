class HistoryTable {
  constructor() {
    this.clear()
  }

  clear() {
    this.table = Array.from(Array(256)).map(() => Array.from(Array(256)).map(() => 0))
    this.killerMove = []
  }

  sortingMoves(hashMv, ply) {
    return (move1, move2) => {
      //置换表排序
      if (move1 === hashMv) {
        return -1
      } else if (move2 === hashMv) {
        return 1
      }
      else {
        //按杀手1排序
        if (this.killerMove[ply]) {
          if (this.killerMove[ply][0] && this.killerMove[ply][0].equal(move1)) {
            return -1
          } else if (this.killerMove[ply][0] && this.killerMove[ply][0].equal(move2)) {
            return 1
          }

          //按杀手2排序
          if (this.killerMove[ply][1] && this.killerMove[ply][1].equal(move1)) {
            return -1
          } else if (this.killerMove[ply][1] && this.killerMove[ply][1].equal(move2)) {
            return 1
          }
        }

        //mvv/lva排序吃子走法
        if (move1.wvl != null && move2.wvl != null) {
          const gap = move1.wvl - move2.wvl
          return gap > 0 ? -1 : gap === 0 ? 0 : 1
        } else if (move1.wvl != null && move2.wvl == null) {
          return -1
        } else if (move2.wvl != null && move1.wvl == null) {
          return 1
        }

        // 历史表排序不吃子走法
        else {
          const gap = this.table[move1.from][move1.to] - this.table[move2.from][move2.to]
          return gap > 0 ? -1 : gap === 0 ? 0 : 1
        }
      }
    }
  }

  //保存历史表走法，depth是向下的层数，ply是向上的层数
  saveGoodMove(mv, depth, ply) {
    this.table[mv.from][mv.to] += depth

    //防止溢出
    if (this.table[mv.from][mv.to] > 240) {
      this.table.forEach((row, from) => {
        row.forEach((score, to) => {
          this.table[from][to] = score / 4
        })
      })
    }

    if (this.killerMove[ply] != null) {
      this.killerMove[ply] = [mv, this.killerMove[ply][0]]
    } else {
      this.killerMove[ply] = [mv]
    }
  }
}

module.exports = HistoryTable