function drawPolygon(c, polygon) {
    c.beginPath()
    c.moveTo(polygon[0][0], polygon[0][1]) 
    for(var i = 1; i < polygon.length; i++) c.lineTo(polygon[i][0], polygon[i][1]) 
    c.lineTo(polygon[0][0], polygon[0][1])
    c.closePath()
}

module.exports = drawPolygon