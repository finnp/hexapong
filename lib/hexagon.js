var drawPolygon = require('./helper/drawpolygon.js')

module.exports = Hexagon

function Hexagon(baseColor, x, y, radius) {
    this.baseColor = baseColor
    this.color = this.baseColor
    this.hitTime = 0 // for blinking
    this.polygon = []
    this.radius = radius
    this.x = x
    this.y = y
    for(var i = 0; i < 6; i++)
        this.polygon.push([this.radius * Math.cos(i * 1/3 * Math.PI) + x, this.radius * Math.sin(i * 1/3 * Math.PI) + y])
}

Hexagon.prototype.update = function() {
    this.hitTime--
    if(this.hitTime === 0) {
        this.color = this.baseColor
    }
}

Hexagon.prototype.draw = function(c) {
    c.save()
    c.beginPath()
    drawPolygon(c, this.polygon)
    c.strokeStyle = this.color.rgbString()
    c.lineWidth = 5
    c.stroke()
    c.closePath()
    c.restore()
}
