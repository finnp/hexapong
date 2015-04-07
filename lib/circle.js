module.exports = Circle

function Circle(x, y) {
    this.x = x || 200
    this.y = y || 200
    this.radius = 150
}

Circle.prototype.draw = function(c) {
    c.beginPath()
    c.arc(this.x, this.y, this.radius, 0, 2 * Math.PI, false)
    c.lineWidth = 2
    c.strokeStyle = 'white'
    c.stroke()
    c.closePath()
}

Circle.prototype.getCoordinates = function(deg) {
  var q = {}
  q.x = this.x + this.radius * Math.cos(deg * (Math.PI / 180))
  q.y = this.y + this.radius * Math.sin(deg * (Math.PI / 180))
  return q
}
