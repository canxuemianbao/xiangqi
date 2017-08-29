const Color = require('../core/color')
const should = require('should')
const Red = Color.Red
const Black = Color.Black

describe('color test', function () {
  it('should return true when color is red and target row is lower than or equal current row', function () {
    should(Red.isForward(5)(4)).be.true()
    should(Red.isForward(4)(4)).be.true()
  })

  it('should return false when color is red and target row is higher than current row', function () {
    should(Red.isForward(4)(5)).be.false()
  })

  it('should return true when color is red and target row is higher than or equal current row', function () {
    should(Black.isForward(4)(5)).be.true()
    should(Black.isForward(4)(4)).be.true()
  })

  it('should return true when color is red and target row is lower than current row', function () {
    should(Black.isForward(4)(3)).be.false()
  })
})