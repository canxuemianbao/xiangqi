const express = require('express')
const path = require('path')
const bodyParser = require('body-parser')
const moment = require('moment')
const fs = require('fs')

const app = express()

app.use(bodyParser.json())
app.use(express.static(path.resolve('./')))
app.use(bodyParser.urlencoded({ extended: true }))

app.get('/', (req, res) => {
  res.sendFile(path.resolve('./html/index.html'))
})

app.post('/record', (req, res) => {
  const { fileName, record } = req.body
  console.log(record)
  let recordStr = record.reduce((prev, ply) => prev + JSON.stringify(ply) + '\n', '')
  recordStr = recordStr.substring(0, recordStr.length - 1)

  fs.open(path.resolve(`./server/strange/${fileName}`), 'w', () => {
    fs.writeFile(path.resolve(`./server/strange/${fileName}`), recordStr, function (err) {
      if (err) {
        return res.send(err)
      }
      res.send('成功')
    })
  })
})

app.post('/restore', (req, res) => {
  const fileName = req.body.fileName
  fs.readFile(path.resolve(`./server/strange/${fileName}`), 'utf8', (err, data) => {
    if (err) {
      return res.send(err)
    }

    res.send(data.split('\n').map((line) => JSON.parse(line)))
  })
})

app.listen(3000, function () {
  console.log('Example app listening on port 3000!')
})