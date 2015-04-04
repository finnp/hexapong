// http://ufkkd63d4a84.flexi.koding.io:9966/
var Game = require('crtrdg-gameloop')
var Arrows = require('crtrdg-arrows')
var Keyboard = require('crtrdg-keyboard')
var Vec2 = require('vec2')
var insidePolygon = require('point-in-polygon')
var Color = require('color')
var play = require('play-audio')

// var sounds = [
//     play('sound.wav').preload(),
//     play('sound.wav').preload(),
//     play('sound.wav').preload(),
//     play('sound.wav').preload(),
//     play('sound.wav').preload()
// ]

// var soundI = 0
function hitSound() {
    // sounds[soundI++].play()
    // soundI = soundI % sounds.length
}


function Menu(game, x, y){
    this.items = ['1 Player', '2 Player']
    this.selected = 0
    this.color = Color('#550000')
    this.selectedColor = Color('#FFAAAA')
    this.x = x
    this.y = y
    this.frame = 0
    this.game = game
}
Menu.prototype.update = function() {
    this.frame++
    if (this.frame >= 100) this.frame = 0
}
Menu.prototype.draw = function(c) {
    this.items.forEach(function(item, i) {
        c.fillStyle = (i === this.selected ? this.selectedColor : this.color).rgbString()
        var size = i === this.selected ? (Math.sin(this.frame * (Math.PI / 50)) - 0.5) * 3 + 48 : 48
        c.font = size + "px 'Open Sans', sans-serif"
        var text = c.measureText(item)
        c.fillText(item, this.x - text.width / 2, this.y + i * 80 - 20)
    }.bind(this))
}
Menu.prototype.up = function() {
    this.selected--
    if(this.selected < 0) this.selected = this.items.length - 1
}
Menu.prototype.down = function() {
    this.selected++
    if(this.selected > this.items.length - 1) this.selected = 0
}
Menu.prototype.select = function() {
    this.game.state = "playing"
    init(this.selected + 1)

}

function Hexagon(x, y, radius) {
    this.baseColor = Color('#B84848')
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
    c.beginPath()
    drawPolygon(c, hexagon.polygon)
    c.strokeStyle = this.color.rgbString()
    c.lineWidth = 5
    c.stroke()
    c.closePath()
}

function Circle(x, y) {
    this.x = x || 200
    this.y = y || 200
    this.radius = 150
    this.color = Color('#aaa')
}

Circle.prototype.draw = function(c) {
    c.beginPath()
    c.arc(this.x, this.y, this.radius, 0, 2 * Math.PI, false)
    c.lineWidth = 2
    c.strokeStyle = this.color.rgbString()
    c.stroke()
    c.closePath()
}

Circle.prototype.getCoordinates = function(deg) {
  var q = {}
  q.x = this.x + this.radius * Math.cos(deg * (Math.PI / 180))
  q.y = this.y + this.radius * Math.sin(deg * (Math.PI / 180))
  return q
}

function Player() {
    this.width = 4
    this.height = 40
    this.active = false
    this.color = Color('#ff0000')
    this.id = 1
    this.bot = false
    this.init()
}
Player.prototype.init = function() {
    this.score = 0
    this.active = false
    this.bot = false
    this.hideScore = false
}
Player.prototype.setBot = function() {
    this.bot = true
}
Player.prototype.collide = function() {
    // ball
    players.forEach(function(player) {
        player.active = true
    })
    this.active = false
}
Player.prototype.update = function(circle, ball) {
  if(this.bot){
    var botSpeed = 1.8
    if(this.active) {
         var l = circle.getCoordinates(this.angle-botSpeed)
        var m = circle.getCoordinates(this.angle)
        var r = circle.getCoordinates(this.angle+botSpeed)
        if( distance(l, ball) > distance(m, ball) ){
             if( distance(r, ball) < distance(m, ball) ){
                this.angle = this.angle+botSpeed
             }
        }else{
            if(distance(l, ball) >= distance(r, ball)){
                this.angle = this.angle+botSpeed
            }else{
                this.angle = this.angle-botSpeed
            }
        }   
    }
  }else{
    if(this.arrows.isDown('left')) this.angle += 2
    if(this.arrows.isDown('right')) this.angle -= 2
  }
  
  this.angle = this.angle % 360

  // update .x and .y
  var p = circle.getCoordinates(this.angle)
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
    // if(!this.active) color.alpha(0.25)
    if(!this.active) color = this.inactiveColor 
    c.fillStyle = color.rgbString()
    c.fill()
    c.restore()
    c.closePath()
    // score
    if(!this.hideScore) {
        c.fillStyle = this.color.rgbString()
        c.font = "48px 'Open Sans', sans-serif" //'48px Verdana, Geneva, sans-serif'
        c.fillText(this.score, 400, 150 + this.id * 100)   
    }
}

function Ball() {
    this.radius = 2
    this.startPoint = {x: 0, y: 0}
    this.color = Color('#fff')
    this.reset()
}
Ball.prototype.reset = function() {
    this.x = this.startPoint.x
    this.y = this.startPoint.y
    this.speed = 2
    this.direction = Math.random()*360
}
Ball.prototype.update = function() {
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
        hitSound()
        this.color = player.color
        this.moveBack()
        this.direction = 180 - this.direction + 2* player.angle
        this.direction = this.direction % 360
    }
}

Ball.prototype.checkWallCollision = function (hexagon){
    
    var cx = this.x 
    var cy = this.y
    var angle =  3
    var polygon = hexagon.polygon
    
    var ballVector = Vec2([cx, cy]).add( Vec2([this.radius, 0]).rotate(this.direction * (Math.PI / 180)) )
    
    if(!insidePolygon(ballVector.toArray(), polygon)) {
        this.moveBack()
        hitSound()
        
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
                hexagon.color = player.inactiveColor.clone()
                hexagon.hitTime = 15
            }
        })
        
        this.direction = 180 - this.direction + 2*angle
        this.direction = this.direction % 360
    }
}

Ball.prototype.draw = function(c) {
    c.save()
    c.beginPath()
    c.arc(this.x, this.y, this.radius, 0, 2 * Math.PI, false)
    c.fillStyle = this.color.rgbString()
    c.fill()
    c.closePath()    
    c.restore()
}

var game = new Game()


var player = new Player() 
var player2 = new Player()

var circle = new Circle(game.width/2, game.height/2)
var ball = new Ball()
ball.startPoint.x = circle.x
ball.startPoint.y = circle.y
var hexagon = new Hexagon(circle.x, circle.y, 200)

var menu = new Menu(game, circle.x, circle.y)

var primaryArrows = new Arrows()

primaryArrows.on('down', function () {
    if(game.state === 'menu') menu.down()
})

primaryArrows.on('up', function() {
    if(game.state === 'menu') menu.up()
})

primaryArrows.on('right', function() {
    
})

var keyboard = new Keyboard()

keyboard.on('keydown', function (key) {
    if(key === '<enter>' && game.state === 'menu') menu.select()
})

var players = [player, player2]

function init(players) {
    player.init()
    player.arrows = primaryArrows
    player.angle = 0 // degree
    player.color = Color('#550000')
    player.inactiveColor = Color('#801515')

    player2.init()
    player2.id = 2
    player2.angle = 180
    player2.color = Color('#FFAAAA')
    player2.inactiveColor = Color('#D46A6A')
    player2.arrows = new Arrows()
    player2.arrows.useWASD()

    if(players === 0) {
        player.setBot()
        player.hideScore = true
        player2.hideScore = true
    }
    if(players < 2) {
        player2.setBot()
    }

    ball.reset()
    player2.active = true
}
init(0)

function distance(p1,p2){
    return Math.sqrt(Math.pow((p1.x - p2.x), 2) + Math.pow((p1.y - p2.y), 2))
}

function deg2rad(deg) {
    return deg * (Math.PI / 180)
}

function checkWinning(player, player2) {
    if(player.score === 10) game.state = 'gameover'
    if(player2.score === 10) game.state = 'gameover'
}

function drawPolygon(c, polygon) {
    c.beginPath()
    c.moveTo(polygon[0][0], polygon[0][1]) 
    for(var i = 1; i < polygon.length; i++) c.lineTo(polygon[i][0], polygon[i][1]) 
    c.lineTo(polygon[0][0], polygon[0][1])
    c.closePath()
}

game.state = 'menu' // 'menu', 'playing', 'gameover'

game.on('update', function() {
 // player
    player.update(circle, ball)
    player2.update(circle, ball)
// ball
   ball.checkPlayerCollision(player)
   ball.checkPlayerCollision(player2)
   ball.checkWallCollision(hexagon) 
   ball.update()
if(game.state === 'playing') {
   checkWinning(player, player2)
}
// Hexagon
   hexagon.update()
   menu.update()
})

game.on('draw', function(c) {

    //circle.draw(c)
    // if(game.state !== 'menu') {
        ball.draw(c)
        player.draw(c)
        player2.draw(c)
    // }
    hexagon.draw(c)
    if(game.state === 'menu') {
        menu.draw(c)
    }
    if(game.state === 'gameover') {
        if(player.score > player2.score) {
            alert('Dark player wins')
            game.state = 'menu'
        } else {
            alert('Light player wins')
            game.state = 'menu'
        }
        init(0)
    }
})
