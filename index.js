// http://ufkkd63d4a84.flexi.koding.io:9966/
var Game = require('crtrdg-gameloop')
var Arrows = require('crtrdg-arrows')
var Keyboard = require('crtrdg-keyboard')
// var play = require('play-audio')

var Player = require('./lib/player.js')
var Ball = require('./lib/ball.js')
var Menu = require('./lib/menu.js')
var Hexagon = require('./lib/hexagon.js')
var Circle = require('./lib/circle.js')
var ColorScheme = require('./lib/colorscheme.js')

var WINNING_SCORE = 10

var colors = new ColorScheme()

colors.rotate(200)

var game = new Game()


var circle = new Circle(
  game.width / 2,
  game.height / 2,
  Math.min(game.width, game.height) * 0.3
)

var ball = new Ball(circle.radius / 80)
ball.startPoint.x = circle.x
ball.startPoint.y = circle.y

var hexagon = new Hexagon(colors.get('hexagon'), circle.x, circle.y, circle.radius * 4 / 3)

var player = new Player(circle.radius / 30, circle.radius / 3)
var player2 = new Player(circle.radius / 30, circle.radius /3)

var menu = new Menu(
  game,
  circle.x,
  circle.y,
  circle.radius / 3
)
menu.color = colors.get('dark')
menu.selectedColor = colors.get('light')

var primaryArrows = new Arrows()

primaryArrows.on('down', function () {
  if (game.state === 'menu') menu.down()
})

primaryArrows.on('up', function () {
  if (game.state === 'menu') menu.up()
})

var keyboard = new Keyboard()

keyboard.on('keydown', function (key) {
  if (game.state === 'menu' && (key === '<enter>' || key === '<space>')) menu.select()
  if (game.state === 'gameover' && key === '<space>') {
    game.init(0)
    game.state = 'menu'
  }
})

game.init = function init (players) {
  player.init()
  player.arrows = primaryArrows
  player.angle = 0 // degree
  player.color = colors.get('dark')
  player.inactiveColor = colors.get('darkInactive')

  player2.init()
  player2.id = 2
  player2.angle = 180
  player2.color = colors.get('light')
  player2.inactiveColor = colors.get('lightInactive')
  player2.arrows = new Arrows()
  player2.arrows.useWASD()

  if (players === 0) {
    player.setBot()
    player.hideScore = true
    player2.hideScore = true
  }
  if (players < 2) {
    player2.setBot()
  }

  ball.reset()
  player2.active = true
  ball.color = player2.color.clone()
}
game.init(0)

function checkWinning (player, player2) {
  if (player2.score === WINNING_SCORE || player.score === WINNING_SCORE) {
    game.state = 'gameover'
    colors.random()
  }
}

game.state = 'menu' // 'menu', 'playing', 'gameover'

game.on('update', function () {
  // player
  player.update(circle, ball)
  player2.update(circle, ball)
  // ball
  if (game.state !== 'gameover') {
    ball.checkPlayerCollision(player, player2)
    ball.checkPlayerCollision(player2, player)
    ball.checkWallCollision(hexagon, [player, player2])
    ball.update()
  }
  if (game.state === 'playing') {
    checkWinning(player, player2)
  }
  // Hexagon
  hexagon.update()
  menu.update()
})

game.on('draw', function (c) {
  // circle.draw(c)
  if (game.state !== 'gameover') {
    ball.draw(c)
    player.draw(c)
    player2.draw(c)
  }
  // }
  hexagon.draw(c)
  if (game.state === 'menu') {
    menu.draw(c)
  }
  if (game.state === 'gameover') {
    var darkPlayerWins = player.score > player2.score
    var endText = darkPlayerWins ? 'Dark player wins' : 'Light player wins'
    let fontSize = circle.radius / 3.5
    c.fillStyle = darkPlayerWins ? colors.get('dark').rgbString() : colors.get('light').rgbString()
    c.font = fontSize + "px 'Open Sans', sans-serif"
    var textSizes = c.measureText(endText)
    c.fillText(endText, circle.x - textSizes.width / 2, circle.y + fontSize * 0.4)
  }
})
