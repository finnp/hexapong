module.exports = ColorScheme

var Color = require('color')

// TODO: https://github.com/tmcw/relative-luminance

function ColorScheme(hue) {
    hue = hue || Math.round(Math.random() * 360)
    this.hue = hue
    this.colors = {
        background: Color().hsl(hue, 50, 45),
        light: Color().hsl(hue, 100, 83),
        lightInactive: Color().hsl(hue, 55, 62),
        dark: Color().hsl(hue, 100, 17),
        darkInactive: Color().hsl(hue, 72, 29),
        hexagon: Color().hsl(hue, 44, 50)
    }
    document.body.style.backgroundColor = this.colors.background.rgbString()
}

ColorScheme.prototype.get = function(name) {
    return this.colors[name]
}

ColorScheme.prototype.setHue = function(hue) {
    this.hue = hue % 360
    for(var color in this.colors) {
        this.colors[color].hue(hue)
    }
    document.body.style.backgroundColor = this.colors.background.rgbString()
}


ColorScheme.prototype.random = function() {
    this.setHue(Math.round(Math.random() * 360))
}

ColorScheme.prototype.rotate = function(time) {
    // this was for fun, but is actually quite subtle and nice
    setInterval(function() {
        this.setHue(++this.hue)
    }.bind(this), time || 150)
}