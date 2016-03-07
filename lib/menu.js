module.exports = Menu

function Menu (game, x, y) {
  this.items = ['1 Player', '2 Player']
  this.selected = 0
  this.x = x
  this.y = y
  this.frame = 0
  this.game = game
}
Menu.prototype.update = function () {
  this.frame++
  if (this.frame >= 100) this.frame = 0
}
Menu.prototype.draw = function (c) {
  this.items.forEach(function (item, i) {
    c.fillStyle = (i === this.selected ? this.selectedColor : this.color).rgbString()
    var size = i === this.selected ? (Math.sin(this.frame * (Math.PI / 50)) - 0.5) * 3 + 48 : 48
    c.font = size + "px 'Open Sans', sans-serif"
    var text = c.measureText(item)
    c.fillText(item, this.x - text.width / 2, this.y + i * 80 - 20)
  }.bind(this))
}
Menu.prototype.up = function () {
  this.selected--
  if (this.selected < 0) this.selected = this.items.length - 1
}
Menu.prototype.down = function () {
  this.selected++
  if (this.selected > this.items.length - 1) this.selected = 0
}
Menu.prototype.select = function () {
  this.game.state = 'playing'
  this.game.init(this.selected + 1)
}
