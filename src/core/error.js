class FinishError extends Error{
  constructor(){
    super('正在被将军')
  }
}

class PosError extends Error{
  constructor(){
    super('不能在这个位置')
  }
}

class ComradeError extends Error{
  constructor(){
    super('不能吃同样颜色的棋子')
  }
}

class CannotMoveError extends Error{
  constructor(){
    super('不能移动到这个位置')
  }
}

class NotYourRoundError extends Error{
  constructor(){
    super('不是你的回合')
  }
}

module.exports={
  FinishError,
  PosError,
  ComradeError,
  CannotMoveError,
  NotYourRoundError
}