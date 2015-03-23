// http://ufkkd63d4a84.flexi.koding.io:9966/
var Game = require('crtrdg-gameloop')
var Arrows = require('crtrdg-arrows')
var Vec2 = require('vec2')
var insidePolygon = require('point-in-polygon')
var Color = require('color')

var radius = 150

function Player() {
    this.width = 4
    this.height = 40
    this.active = false
    this.color = Color('#ff0000')
    this.id = 1
    this.score = 0
}
Player.prototype.collide = function() {
    // ball
    players.forEach(function(player) {
        player.active = true
    })
    this.active = false
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
    var color = this.color.clone()
    if(!this.active) color.alpha(0.25)
    c.fillStyle = color.rgbString()
    c.fill()
    c.restore()
    c.closePath()
    c.fillStyle = this.color.rgbString()
    c.font = '48px serif'
    c.fillText(this.score, 400, 150 + this.id * 100)
}

function Ball() {
    this.reset()
    this.radius = 2

}
Ball.prototype.reset = function() {
    this.x = 200
    this.y = 200
    this.direction = Math.random()*360
}
Ball.prototype.update = function() {
    var p = getCircleCoordinates(0, 0, 1, this.direction)
    this.x += p.x 
    this.y += p.y
}
Ball.prototype.checkPlayerCollision = function (player) {
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
    
    if(player.active && insidePolygon(ballVector.toArray(), playerVertices)) {
        player.collide()
        resetBallPosition()
        this.direction = 180 - this.direction + 2* player.angle
        this.direction = this.direction % 360
    }
}

Ball.prototype.checkWallCollision = function (){
    
    var cx = this.x 
    var cy = this.y
    var angle =  3
    
    var ballVector = Vec2([cx, cy]).add( Vec2([this.radius, 0]).rotate(this.direction * (Math.PI / 180)) )
    
    if(!insidePolygon(ballVector.toArray(), hexagon)) {
        resetBallPosition()
        
        if(insidePolygon(ballVector.toArray(), [hexagon[0],  [hexagon[0][0],hexagon[1][1]], hexagon[1]])){
            angle = 30
        }
        if(insidePolygon(ballVector.toArray(), [hexagon[1],  [hexagon[1][0],hexagon[1][1]+10], [hexagon[2][0],hexagon[2][1]+10], hexagon[2]])){
            angle = 90
        }
        if(insidePolygon(ballVector.toArray(), [hexagon[2],  [hexagon[3][0],hexagon[2][1]], hexagon[3]])){
            angle = 150
        }
        if(insidePolygon(ballVector.toArray(), [hexagon[3],  [hexagon[3][0],hexagon[4][1]], hexagon[4]])){
            angle = 210
        }
        if(insidePolygon(ballVector.toArray(), [hexagon[4],  [hexagon[4][0],hexagon[4][1]-10], [hexagon[5][0],hexagon[5][1]-10], hexagon[5]])){
            angle = 270
        }
        if(insidePolygon(ballVector.toArray(), [hexagon[5],  [hexagon[0][0],hexagon[5][1]], hexagon[0]])){
            angle = 330
        }
        
        players.forEach(function(player) {
            if(!player.active) player.score++
        })
        
        this.direction = 180 - this.direction + 2*angle
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

var game = new Game({width: 800, height: 600})
var polygonRadius = 200
var hexagon = createHexagon(200, 200, polygonRadius)

var player = new Player()
player.arrows = new Arrows()
player.angle = 0 // degree

var player2 = new Player()
player2.id = 2
player2.arrows = new Arrows()
player2.arrows.useWASD()
player2.angle = 180
player2.color = Color('#0000ff')

var players = [player, player2]

function init() {
    ball.reset()
    players[Math.round(Math.random())].active = true
}
init()

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

function drawPolygon(c, polygon) {
    c.moveTo(polygon[0][0], polygon[0][1]) 
    for(var i = 1; i < polygon.length; i++) c.lineTo(polygon[i][0], polygon[i][1]) 
    c.lineTo(polygon[0][0], polygon[0][1])
}

game.on('update', function() {
// player
    player.update()
    player2.update()
// ball
   ball.checkPlayerCollision(player)
   ball.checkPlayerCollision(player2)
   ball.checkWallCollision() 
   ball.update()
})

game.on('draw', function(c) {
    // circle path 
    c.beginPath()
    c.arc(200, 200, radius, 0, 2 * Math.PI, false)
    c.fillStyle = '#fff'
    c.fill()
    c.lineWidth = 2
    c.strokeStyle = '#aaa'
    c.stroke()
    c.closePath()

    ball.draw(c)
    player.draw(c)
    player2.draw(c)

    // hexagon
    c.beginPath()
    drawPolygon(c, hexagon)
    c.strokeStyle = '#000'
    c.stroke()
    c.closePath()
})
