// 希尔排序
var SHELL_STEP = [0, 1, 4, 13, 40, 121, 364, 1093];
function shellSort(mvs, vls) {
  var stepLevel = 1;
  while (SHELL_STEP[stepLevel] < mvs.length) {
    stepLevel++;
  }
  stepLevel--;
  while (stepLevel > 0) {
    var step = SHELL_STEP[stepLevel];
    for (var i = step; i < mvs.length; i++) {
      var mvBest = mvs[i];
      var vlBest = vls[i];
      var j = i - step;
      while (j >= 0 && vlBest > vls[j]) {
        mvs[j + step] = mvs[j];
        vls[j + step] = vls[j];
        j -= step;
      }
      mvs[j + step] = mvBest;
      vls[j + step] = vlBest;
    }
    stepLevel--;
  }
}

class MoveSort {
  constructor(pos, historyTable) {
    this.mvs = [];										// 走法数组，存储当前局面所有走法
    this.vls = [];										// 在历史表中，每个走法对应的分值
    this.pos = pos;
    this.historyTable = historyTable;
    this.index = 0;

    var mvsAll = pos.generateMoves(null);					// 生成全部走法
    for (var i = 0; i < mvsAll.length; i++) {
      var mv = mvsAll[i]
      if (!pos.makeMove(mv)) {
        continue;
      }
      pos.undoMakeMove();
      this.mvs.push(mv);

      this.vls.push(historyTable[pos.historyIndex(mv)]);	// 获取历史表中，该走法的值
    }
    shellSort(this.mvs, this.vls);						// 根据历史表的分值，对走法进行排序
  }

  // 获得一步排序后的走法。如果走法已经全部获取，则返回0
  next() {
    while (this.index < this.mvs.length) {
      var mv = this.mvs[this.index];
      this.index++;
      return mv;
    }
    return 0;
  }
}

module.exports = MoveSort