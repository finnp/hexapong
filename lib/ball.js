var Vec2 = require('vec2')
var insidePolygon = require('point-in-polygon')
var deg2rad = require('./helper/deg2rad.js')
var rad2deg = require('./helper/rad2deg.js')

module.exports = Ball

function Ball (radius) {
  this.radius = radius || 2
  this.startPoint = {x: 0, y: 0}
  this.x = this.startPoint.x
  this.y = this.startPoint.y
  this.reset()
  this.tail = []
}
Ball.prototype.reset = function () {
  this.tail = []
  this.x = this.startPoint.x
  this.y = this.startPoint.y
  this.speed = this.radius
  this.direction = Math.random() * 360
}
Ball.prototype.update = function () {
  var diff = 0.0009
  this.tail.push([this.x * (1 - diff + Math.random() * diff * 2), this.y * (1 - diff + Math.random() * diff * 2)])
  if (this.tail.length > 20) this.tail.shift()
  var p = this.moveVector(this.direction)
  this.x += p.x
  this.y += p.y
}
Ball.prototype.moveVector = function (angle) {
  var q = {}
  q.x = this.speed * Math.cos(deg2rad(angle))
  q.y = this.speed * Math.sin(deg2rad(angle))
  return q
}
Ball.prototype.moveBack = function () {
  var p = this.moveVector(this.direction)
  this.x -= p.x
  this.y -= p.y
}
Ball.prototype.checkPlayerCollision = function (player, otherPlayer) {
  var cx = this.x
  var cy = this.y

  var x = player.x
  var y = player.y
  var width = player.width
  var height = player.height
  var deg = player.angle

  var degRad = deg2rad(deg)

  var ballVector = Vec2([cx, cy]).add(Vec2([this.radius, 0]).rotate(this.direction * (Math.PI / 180)))

  // https://www.npmjs.com/package/vec2 has a rotate function
  var playerCentre = Vec2([x + width / 2, y + height / 2])
  var playerVertices = []
  playerVertices[0] = Vec2([-width / 2, -height / 2]).rotate(degRad).add(playerCentre)
  playerVertices[1] = Vec2([+width / 2, -height / 2]).rotate(degRad).add(playerCentre)
  playerVertices[2] = Vec2([+width / 2, +height / 2]).rotate(degRad).add(playerCentre)
  playerVertices[3] = Vec2([-width / 2, +height / 2]).rotate(degRad).add(playerCentre)

  playerVertices = playerVertices.map(function (point) {
    return point.toArray()
  })

  if (player.active && insidePolygon(ballVector.toArray(), playerVertices)) {
    player.collide(otherPlayer)
    this.color = player.color
    this.moveBack()
    this.speed *= 1.05
    this.direction = 180 - this.direction + 2 * player.angle
    this.direction = this.direction % 360
  }
}

Ball.prototype.checkWallCollision = function (hexagon, players) {
  if (!insidePolygon(getDirectionAsArray(this), hexagon.polygon)) {
    this.moveBack()

    this.direction = reflect(this.direction, getAngle(findCollisionLine(this, hexagon.polygon)))
      
    function reflect(incomingAngle, surfaceAngle) {
      return (360 - incomingAngle + 2 * surfaceAngle) % 360
    }
    
    function getAngle([cornerA, cornerB]) {
      return rad2deg(Math.atan2(cornerA[1] - cornerB[1], cornerA[0] - cornerB[0]))
    }
    
    function findCollisionLine(ball, polygon) {
      return polygon
        .map(cornerToLine)
        .reduce(getLineCloserTo(ball))

      function cornerToLine(corner, index) {
        return [corner, hexagon.polygon[(index + 1) % hexagon.polygon.length]]
      }

      function getLineCloserTo(ball) {
        return (line, otherLine) => 
          isLineCloserToPointThanOther(getDirectionAsArray(ball), line, otherLine) ?
            line :
            otherLine
      }
    
      function isLineCloserToPointThanOther(point, line, otherLine) {
        return accumulatedDistanceToLineEnds(point, line) <= accumulatedDistanceToLineEnds(point, otherLine)
      }
    
      function accumulatedDistanceToLineEnds(a, line) {
        return distance(a, line[0]) + distance(a, line[1])
      }
    
      function distance(a, b) {
        return Math.sqrt((a[0]-b[0])**2 + (a[1]-b[1])**2);
      }
    }

    players.forEach(function (player) {
      if (!player.active) {
        player.score++
        hexagon.color = player.inactiveColor
        hexagon.hitTime = 15
      }
    })
  }
}

Ball.prototype.draw = function (c) {
  var radius = this.radius
  var color = this.color.clone()
  c.beginPath()
  c.fillStyle = color.rgbString()
  c.arc(this.x, this.y, radius, 0, 2 * Math.PI, false)
  c.fill()
  c.closePath()

  // color.clearer(0.75)
  var tail = this.tail

  for (var i = tail.length - 1; i >= 0; i--) {
    var p = tail[i]
    c.beginPath()
    c.fillStyle = color.rgbString()
    c.arc(p[0], p[1], radius, 0, 2 * Math.PI, false)
    radius = (-Math.exp((tail.length - i) / tail.length) + this.radius + 1)

    color.clearer(0.018)
    c.fill()
    c.closePath()
  }

// c.restore()
}

function getDirectionAsArray({x, y, radius, direction}) {
  return Vec2([x, y])
    .add(Vec2([radius, 0])
    .rotate(direction * (Math.PI / 180)))
    .toArray()
}