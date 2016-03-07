var deg2rad = require('./helper/deg2rad.js')

module.exports = Player

function Player () {
  this.width = 4
  this.height = 40
  this.active = false
  this.id = 1
  this.bot = false
  this.init()
}
Player.prototype.init = function () {
  this.score = 0
  this.active = false
  this.bot = false
  this.hideScore = false
}
Player.prototype.setBot = function () {
  this.bot = true
}
Player.prototype.collide = function (otherPlayer) {
  // ball
  otherPlayer.active = true
  this.active = false
}
Player.prototype.update = function (circle, ball) {
  if (this.bot) {
    var botSpeed = 1.8
    if (this.active) {
      var l = circle.getCoordinates(this.angle - botSpeed)
      var m = circle.getCoordinates(this.angle)
      var r = circle.getCoordinates(this.angle + botSpeed)
      if (distance(l, ball) > distance(m, ball)) {
        if (distance(r, ball) < distance(m, ball)) {
          this.angle = this.angle + botSpeed
        }
      } else {
        if (distance(l, ball) >= distance(r, ball)) {
          this.angle = this.angle + botSpeed
        } else {
          this.angle = this.angle - botSpeed
        }
      }
    }
  } else {
    if (this.arrows.isDown('left')) this.angle += 2
    if (this.arrows.isDown('right')) this.angle -= 2
  }

  this.angle = this.angle % 360

  // update .x and .y
  var p = circle.getCoordinates(this.angle)
  this.x = p.x - (this.width / 2)
  this.y = p.y - (this.height / 2)
}
Player.prototype.draw = function (c) {
  c.save()
  c.beginPath()
  c.translate(this.x + (this.width / 2), this.y + (this.height / 2))
  c.rotate(deg2rad(this.angle))
  c.rect(- (this.width / 2), - (this.height / 2), this.width , this.height)
  var color = this.color.clone()
  // if(!this.active) color.alpha(0.25)
  if (!this.active) color = this.inactiveColor
  c.fillStyle = color.rgbString()
  c.fill()
  c.restore()
  c.closePath()
  // score
  if (!this.hideScore) {
    c.fillStyle = this.color.rgbString()
    c.font = "48px 'Open Sans', sans-serif" // '48px Verdana, Geneva, sans-serif'
    c.fillText(this.score, 400, 150 + this.id * 100)
  }
}

// functions

function distance (p1, p2) {
  return Math.sqrt(Math.pow((p1.x - p2.x), 2) + Math.pow((p1.y - p2.y), 2))
}
