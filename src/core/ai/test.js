const {Zobrist,generateZobrist} =  require("./pregen")

function checkTimeConsume(func, time = 100000000) {
  const start = Date.now()

  for (let i = 0; i < time; i++) {
    func(i)
  }

  const end = Date.now()

  console.log("time consume: " + (end - start))
}

let a=10
const func1 = ()=>{
  a=-a
  return a
}

const func2 = ()=>{
  return a
}

checkTimeConsume(func1)
checkTimeConsume(func2)