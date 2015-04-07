var Vec2 = require('vec2')
var insidePolygon = require('point-in-polygon')
var deg2rad = require('./helper/deg2rad.js')

module.exports = Ball

function Ball() {
    this.radius = 2
    this.startPoint = {x: 0, y: 0}
    this.reset()
    this.tail = []
}
Ball.prototype.reset = function() {
    this.tail = []
    this.x = this.startPoint.x
    this.y = this.startPoint.y
    this.speed = 2
    this.direction = Math.random()*360
}
Ball.prototype.update = function() {
    var diff = 0.0009
    this.tail.push([this.x * (1 - diff + Math.random() * diff * 2), this.y * (1 - diff + Math.random() * diff * 2)])
    if(this.tail.length > 20) this.tail.shift()
    var p = this.moveVector(this.direction)
    this.x += p.x 
    this.y += p.y
}
Ball.prototype.moveVector = function(deg) {
  var q = {}
  q.x = this.speed * Math.cos(deg * (Math.PI / 180))
  q.y = this.speed * Math.sin(deg * (Math.PI / 180))
  return q
}
Ball.prototype.moveBack = function() {
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
        player.collide(otherPlayer)
        this.color = player.color
        this.moveBack()
        this.direction = 180 - this.direction + 2* player.angle
        this.direction = this.direction % 360
    }
}

Ball.prototype.checkWallCollision = function (hexagon, players){
    
    var cx = this.x 
    var cy = this.y
    var angle =  3
    var polygon = hexagon.polygon
    
    var ballVector = Vec2([cx, cy]).add( Vec2([this.radius, 0]).rotate(this.direction * (Math.PI / 180)) )
    
    if(!insidePolygon(ballVector.toArray(), polygon)) {
        this.moveBack()
        
        if(insidePolygon(ballVector.toArray(), [polygon[0],  [polygon[0][0],polygon[1][1]], polygon[1]])){
            angle = 30
        }
        if(insidePolygon(ballVector.toArray(), [polygon[1],  [polygon[1][0],polygon[1][1]+10], [polygon[2][0],polygon[2][1]+10], polygon[2]])){
            angle = 90
        }
        if(insidePolygon(ballVector.toArray(), [polygon[2],  [polygon[3][0],polygon[2][1]], polygon[3]])){
            angle = 150
        }
        if(insidePolygon(ballVector.toArray(), [polygon[3],  [polygon[3][0],polygon[4][1]], polygon[4]])){
            angle = 210
        }
        if(insidePolygon(ballVector.toArray(), [polygon[4],  [polygon[4][0],polygon[4][1]-10], [polygon[5][0],polygon[5][1]-10], polygon[5]])){
            angle = 270
        }
        if(insidePolygon(ballVector.toArray(), [polygon[5],  [polygon[0][0],polygon[5][1]], polygon[0]])){
            angle = 330
        }
        
        players.forEach(function(player) {
            if(!player.active) {
                player.score++
                hexagon.color = player.inactiveColor
                hexagon.hitTime = 15
            }
        })
        
        this.direction = 180 - this.direction + 2*angle
        this.direction = this.direction % 360
    }
}

Ball.prototype.draw = function(c) {
    var radius = this.radius
    var color = this.color.clone()
    c.beginPath()
    c.fillStyle = color.rgbString()
    c.arc(this.x, this.y, radius, 0, 2 * Math.PI, false)
    c.fill()
    c.closePath()

    // color.clearer(0.75)
    var tail = this.tail
    
    for(var i = tail.length - 1; i >= 0; i--) {
        var p = tail[i]
        c.beginPath()
        c.fillStyle = color.rgbString()
        c.arc(p[0], p[1], radius, 0, 2 * Math.PI, false)
        // radius *= 0.95
        radius = (-Math.exp((tail.length - i)/ tail.length) + 3)
        
        color.clearer(0.018)
        c.fill()
        c.closePath()
    }


    // c.restore()
}