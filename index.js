// http://ufkkd63d4a84.flexi.koding.io:9966/
var Game = require('crtrdg-gameloop')
var Arrows = require('crtrdg-arrows')
var Keyboard = require('crtrdg-keyboard')
var play = require('play-audio')

var Player = require('./lib/player.js')
var Ball = require('./lib/ball.js')
var Menu = require('./lib/menu.js')
var Hexagon = require('./lib/hexagon.js')
var Circle = require('./lib/circle.js')
var ColorScheme = require('./lib/colorscheme.js')


var colors = new ColorScheme()

colors.rotate(200)

var game = new Game()

var player = new Player() 
var player2 = new Player()

var circle = new Circle(game.width/2, game.height/2)
var ball = new Ball()
ball.startPoint.x = circle.x
ball.startPoint.y = circle.y
var hexagon = new Hexagon(colors.get('hexagon'), circle.x, circle.y, 200)

var menu = new Menu(game, circle.x, circle.y)
menu.color = colors.get('dark')
menu.selectedColor = colors.get('light')

var primaryArrows = new Arrows()

primaryArrows.on('down', function () {
    if(game.state === 'menu') menu.down()
})

primaryArrows.on('up', function() {
    if(game.state === 'menu') menu.up()
})

var keyboard = new Keyboard()

keyboard.on('keydown', function (key) {
    if(key === '<enter>' && game.state === 'menu') menu.select()
})

var players = [player, player2]

game.init = function init(players) {
    
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
    ball.color = player2.color.clone()
}
game.init(0)

function checkWinning(player, player2) {
    if(player2.score === 10 || player.score === 10) {
        game.state = 'gameover'
        colors.random()
    }
}

game.state = 'menu' // 'menu', 'playing', 'gameover'

game.on('update', function() {
 // player
    player.update(circle, ball)
    player2.update(circle, ball)
// ball
   ball.checkPlayerCollision(player, player2)
   ball.checkPlayerCollision(player2, player)
   ball.checkWallCollision(hexagon, [player, player2]) 
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
        game.init(0)
    }
})
