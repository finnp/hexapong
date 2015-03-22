// http://ufkkd63d4a84.flexi.koding.io:9966/
var Raphael = require('raphael')
var Arrows = require('crtrdg-arrows')
var Vec2 = require('vec2')
var insidePolygon = require('point-in-polygon')

var paper = Raphael(0, 0, 800, 600) // http://raphaeljs.com/reference.html

var radius = 150
var ballRadius = 2
var ballDirection = 0

var arrows = new Arrows()

var circle = paper.circle(200, 200, radius)
circle.attr('fill', '#fff')
circle.attr('stroke-width', '2px')
circle.attr('stroke', '#ff0000')

var ball = paper.circle(200, 200, ballRadius)
ball.attr('fill', '#000')

var playerLength = 40
var playerDegree = 0
var playerWidth = 2 //
var p = getCircleCoordinates(200, 200, radius, playerDegree)


var player = paper.rect(p.x, p.y, playerWidth, playerLength)
player.attr('fill', '#000')


var polygonRadius = 200

var hexagonPolygon = createHexagon(200, 200, polygonRadius)
var hexagon = paper.path(polygonPath(hexagonPolygon))
hexagon.attr('stroke-width', '2px')

function createHexagon(x, y, r) {
    var points = []
    for(var i = 0; i < 6; i++)
     points.push([r * Math.cos(i * 1/3 * Math.PI) + x, r * Math.sin(i * 1/3 * Math.PI) + y])
    return points
}


function setPlayerPosition(deg) {
  var p = getCircleCoordinates(200, 200, radius, deg)
  player.attr('x', p.x - (playerWidth/2))
  player.attr('y', p.y - (playerLength/2))
} 

function updateBallPosition() {
    var p = getCircleCoordinates(0, 0, 1, ballDirection)
    ball.attr('cx', ball.attr('cx') + p.x)
    ball.attr('cy', ball.attr('cy') + p.y)
}

function resetBallPosition() {
    var p = getCircleCoordinates(0, 0, 2, (180 + ballDirection) % 360)
    ball.attr('cx', ball.attr('cx') + p.x)
    ball.attr('cy', ball.attr('cy') + p.y)
}

function deg2rad(deg) {
    return deg * (Math.PI / 180)
}

function printVector(v) {
    var p = v.toJSON()
    var corner = paper.circle(p.x, p.y, 2)
    corner.attr('fill', '#00ff00')
}

function checkBallCollision(cx, cy, x, y, width, height, deg) {
    var degRad =  deg2rad(deg)
    
    var ballVector = Vec2([cx, cy]).add( Vec2([ballRadius, 0]).rotate(ballDirection * (Math.PI / 180)) )
    
    // printVector(ballVector)

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
        ballDirection = 180 - ballDirection + 2* playerDegree
        ballDirection = ballDirection % 360
    }
    if(!insidePolygon(ballVector.toArray(), hexagonPolygon)) {
        resetBallPosition()
        ballDirection = 180 + ballDirection
        ballDirection = ballDirection % 360
    }
    
}

function polygonPath(p) {
    var path = ''
    path += 'M' + p[0].join(',')
    for(var i = 1; i < p.length; i++) {
        path += 'L' + p[i].join(',')
    }
    path += 'L' + p[0].join(',')
    return path
}

function getCircleCoordinates(x, y, r, deg) {
  var q = {}
  q.x = x + r * Math.cos(deg * (Math.PI / 180))
  q.y = y + r * Math.sin(deg * (Math.PI / 180))
  return q
}


// gameloop
function gameloop() {
// player
  if(arrows.isDown('left')) playerDegree += 2
  if(arrows.isDown('right')) playerDegree -= 2
  playerDegree = playerDegree % 360
  setPlayerPosition(playerDegree)
  player.transform('r' + playerDegree)
// ball
  checkBallCollision(
      ball.attr('cx'),
      ball.attr('cy'),
      player.attr('x'),
      player.attr('y'),
      playerWidth, //??
      playerLength, //??
      playerDegree
    )
   updateBallPosition()
  
  requestAnimationFrame(gameloop)
}

requestAnimationFrame(gameloop)