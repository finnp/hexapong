// http://ufkkd63d4a84.flexi.koding.io:9966/
var Game = require('crtrdg-gameloop')
var Arrows = require('crtrdg-arrows')
var Vec2 = require('vec2')
var insidePolygon = require('point-in-polygon')

var radius = 150

function Player() {
    this.width = 4
    this.height = 40
}
Player.prototype.update = function() {
  if(this.arrows.isDown('left')) this.angle += 2
  if(this.arrows.isDown('right')) this.angle -= 2
  this.angle = this.angle % 360
  // update .x and .y
  var p = getCircleCoordinates(200, 200, radius, this.angle)
  this.x =  p.x - (player.width/2)
  this.y =  p.y - (player.height/2)
}
Player.prototype.draw = function(c) {
    c.save()
    c.beginPath()
    c.translate(this.x + (player.width/2), this.y + (player.height/2))
    c.rotate(deg2rad(this.angle))
    c.rect(- (this.width/2), - (this.height/2),  this.width , this.height)
    c.fillStyle = '#000'
    c.fill()
    c.restore()
    c.closePath()
}

var player = new Player()
player.arrows = new Arrows()
player.angle = 0 // degree

var player2 = new Player()
player2.arrows = new Arrows()
player2.arrows.useWASD()
player2.angle = 180

function Ball() {}
Ball.prototype.update = function() {
    var p = getCircleCoordinates(0, 0, 1, this.direction)
    this.x += p.x 
    this.y += p.y
}
Ball.prototype.checkCollision = function (player) {
    var cx = this.x 
    var cy = this.y
    
    var x = player.x 
    var y = player.y 
    var width = player.width 
    var height = player.height 
    var deg = player.angle
    
    var degRad =  deg2rad(deg)
    
    var ballVector = Vec2([cx, cy]).add( Vec2([this.radius, 0]).rotate(this.direction * (Math.PI / 180)) )

   // https://www.npmjs.com/package/vec2 has a rotate function
    var playerCentre = Vec2([x+width/2,y+height/2])
    var playerVertices = []
    playerVertices[0] = Vec2([-width/2,-height/2]).rotate(degRad).add(playerCentre)
    playerVertices[1] = Vec2([+width/2,-height/2]).rotate(degRad).add(playerCentre)
    playerVertices[2] = Vec2([+width/2,+height/2]).rotate(degRad).add(playerCentre)
    playerVertices[3] = Vec2([-width/2,+height/2]).rotate(degRad).add(playerCentre)
    
    playerVertices = playerVertices.map(function(point){
      return point.toArray()  
    })
    
    if(insidePolygon(ballVector.toArray(), playerVertices)) {
        resetBallPosition()
        this.direction = 180 - this.direction + 2* player.angle
        this.direction = this.direction % 360
    }
    if(!insidePolygon(ballVector.toArray(), hexagon)) {
        resetBallPosition()
        this.direction = 180 + this.direction
        this.direction = this.direction % 360
    }
}

Ball.prototype.draw = function(c) {
    c.save()
    c.beginPath()
    c.arc(this.x, this.y, this.radius, 0, 2 * Math.PI, false)
    c.fillStyle = '#000'
    c.fill()
    c.closePath()    
    c.restore()
}

var ball = new Ball()
ball.x = 200
ball.y = 200
ball.radius = 2
ball.direction = 0

var game = new Game({width: 800, height: 600})
var polygonRadius = 200
var hexagon = createHexagon(200, 200, polygonRadius)



function createHexagon(x, y, r) {
    var points = []
    for(var i = 0; i < 6; i++)
     points.push([r * Math.cos(i * 1/3 * Math.PI) + x, r * Math.sin(i * 1/3 * Math.PI) + y])
    return points
}

function resetBallPosition() {
    var p = getCircleCoordinates(0, 0, 2, (180 + ball.direction) % 360)
    ball.x += p.x 
    ball.y += p.y
}

function deg2rad(deg) {
    return deg * (Math.PI / 180)
}


function getCircleCoordinates(x, y, r, deg) {
  var q = {}
  q.x = x + r * Math.cos(deg * (Math.PI / 180))
  q.y = y + r * Math.sin(deg * (Math.PI / 180))
  return q
}

game.on('update', function() {
// player
    player.update()
    player2.update()
// ball
   ball.checkCollision(player)
   ball.checkCollision(player2)
   ball.update()
})

game.on('draw', function(c) {
    // circle path 
    c.beginPath()
    c.arc(200, 200, radius, 0, 2 * Math.PI, false)
    c.fillStyle = '#fff'
    c.fill()
    c.lineWidth = 2
    c.strokeStyle = '#ff0000'
    c.stroke()
    c.closePath()

    ball.draw(c)
    player.draw(c)
    player2.draw(c)

    // hexagon
    c.beginPath()
    c.moveTo(hexagon[0][0], hexagon[0][1]) 
    for(var i = 1; i < hexagon.length; i++) c.lineTo(hexagon[i][0], hexagon[i][1]) 
    c.lineTo(hexagon[0][0], hexagon[0][1])
    c.strokeStyle = '#000'
    c.stroke()
    c.closePath()
})
