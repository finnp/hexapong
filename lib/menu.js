module.exports = Menu

function Menu (game, x, y, size) {
  this.items = ['1 Player', '2 Player']
  this.selected = 0
  this.x = x
  this.y = y
  this.frame = 0
  this.size = size || 48
  this.game = game
}
Menu.prototype.update = function () {
  this.frame++
  if (this.frame >= 100) this.frame = 0
}
Menu.prototype.draw = function (c) {
  if(isMobile()) {
    let text = 'Tap to start'
    c.fillStyle = this.color.rgbString()
    c.font = this.size + "px 'Open Sans', sans-serif"
    let textMeasurements = c.measureText(text)
    c.fillText(text, this.x - textMeasurements.width / 2, this.y)
  } else {
    this.items.forEach(function (item, i) {
      c.fillStyle = (i === this.selected ? this.selectedColor : this.color).rgbString()
      var fontSize = i === this.selected ? (Math.sin(this.frame * (Math.PI / 50)) - 0.5) * 3 + this.size : this.size
      c.font = fontSize + "px 'Open Sans', sans-serif"
      var text = c.measureText(item)
      c.fillText(item, this.x - text.width / 2, this.y + i * this.size * 2 - this.size/2)
    }.bind(this))
  }
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

function isMobile() {
  return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)
 }
