function setup() {
    width = document.documentElement.clientWidth
    height = document.documentElement.clientHeight
    createCanvas( width, height) ;
    frameRate(30);
    bgColor = color(21, 21, 34)
    lineColor = color(91, 98, 246)
    realValue = []
    wave = []
    n = int(width/150) - 1
    middle = 200 // Hz 
    screenMiddle = height/2
    easing = 0.1
}

function windowResized() {
    width = document.documentElement.clientWidth
    height = document.documentElement.clientHeight
    n = int(width/150) - 1
    screenMiddle = height/2
    resizeCanvas(width, height);
  }

function draw() {

    let gradient = drawingContext.createLinearGradient(0, int(height+middle/1.5)/2-400, 10, int(height+middle/1.5)/2+200)
    gradient.addColorStop(0,lineColor)
    gradient.addColorStop(1,bgColor)
    drawingContext.fillStyle = gradient

    background(bgColor)
    last = realValue[0]
    realValue.unshift(getFreq())
    beginShape()
    stroke(lineColor)
    //noFill()
    wave = parseArray(realValue, middle)
    for (var i = 0; i < wave.length; i++){
        vertex((-i-1)*n+wave.length*n, screenMiddle - wave[i])
    }

    vertex(-1, height)
    vertex(wave.length*n, height)

    endShape()
    fill(lineColor) 
    ellipse((wave.length-1)*n,screenMiddle - wave[0],7.5)
    
    if (realValue.length > 150){
        realValue.pop()
    }
    middle = getMiddle(realValue)
}

function getMiddle(array){
    return lerp(array[0], array[10], 0.5)
}

function parseArray(array, middle){
    // Move up or down the audio line
    var newArray = []
    for (var i = 0; i < array.length; i++){
        newArray.push(array[i] - middle)
    }
    return newArray
}



function getFreq(){
    if (MAIN_FREQ ===  undefined || realValue[0] === NaN){
        return 0
    }
    let dx = MAIN_FREQ - realValue[0];
    return realValue[0] + dx * easing;
}