var drawPolygon = require('./helper/drawpolygon.js')
let rad2deg = require('./helper/rad2deg.js')

const ROTATION_RATE_IN_DEG =  0.00005

module.exports = Hexagon

function Hexagon (baseColor, x, y, radius) {
  this.baseColor = baseColor
  this.color = this.baseColor
  this.hitTime = 0 // for blinking
  this.polygon = []
  this.radius = radius
  this.x = x
  this.y = y
  this.rotation = 0
  for (var i = 0; i < 6; i++)
    this.polygon.push(calculateCornerPosition(i, this))
}

Hexagon.prototype.update = function () {
  this.hitTime--
  if (this.hitTime === 0) {
    this.color = this.baseColor
  }

  this.rotation = (this.rotation + ROTATION_RATE_IN_DEG) % 360

  this.polygon = this.polygon
    .map((_, i) => calculateCornerPosition(i, this))
}

Hexagon.prototype.draw = function (c) {
  c.save()
  c.beginPath()
  drawPolygon(c, this.polygon)
  c.strokeStyle = this.color.rgbString()
  c.lineWidth = this.radius / 40
  c.stroke()
  c.closePath()
  c.restore()
}

function calculateCornerPosition(index, hexagon) {
  return [
    hexagon.radius * Math.cos(index * 1 / 3 * Math.PI + rad2deg(hexagon.rotation)) + hexagon.x,
    hexagon.radius * Math.sin(index * 1 / 3 * Math.PI + rad2deg(hexagon.rotation)) + hexagon.y
  ]
}
