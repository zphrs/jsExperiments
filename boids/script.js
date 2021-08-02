import BoidManager from './boidsMain.js';
function normalize(...args) {
    let vecLength = Math.sqrt(args.map(e=>e*e).reduce((a, b) => a + b))
    return args.map((x) => x/vecLength)
}
let canvas=null, 
minBoids=1, maxBoids=1500, absoluteMaxBoids = 10000, speed=500, radius = 10,
separation=.2, alignment=1, cohesion=.8, stubbornness=8, pointerAttraction=4,
maxNeighborDistance=50, maxCloseness=50,
minTouchTime = 50,
canvasWidthAtConfig = 1920,
canvasHeightAtConfig = 1080

const visCanvas = document.createElement('canvas')
const controlForm = document.getElementById('controls')
const collapse = document.getElementById('collapse')

// set up vis canvas - the white circle
visCanvas.className = 'visCanvas'
let showAlignment = false, showSeparation = false, showCohesion = false;
document.body.prepend(visCanvas)

let bm = new BoidManager(canvas, canvasWidthAtConfig, canvasHeightAtConfig,
    minBoids, maxBoids, absoluteMaxBoids, speed, radius, 
    separation, alignment, cohesion, stubbornness, pointerAttraction, 
    maxNeighborDistance, maxCloseness, 
    minTouchTime)

visCanvas.width = bm.maxNeighborDistance*3;
visCanvas.height = bm.maxNeighborDistance*3;


// set up click listener for collapse 
collapse.addEventListener('click', () => {
    controlForm.classList.toggle('collapsed')
    if (controlForm.classList.contains('collapsed')) {
        controlForm.style.display = 'none'
        visCanvas.style.backgroundColor = 'transparent'
        visCanvas.style.backdropFilter = 'blur(0px)'
        visCanvas.style.setProperty('-webkit-backdrop-filter', 'blur(0px)')
    } else {
        controlForm.style.display = 'block'
        visCanvas.style.backgroundColor = ''
        visCanvas.style.backdropFilter = ''
        visCanvas.style.setProperty('-webkit-backdrop-filter', '')
    }
    collapse.firstChild.innerText = controlForm.classList.contains('collapsed') ? 'expand_more' : 'expand_less'
})

// set up listeners for the controls
function updateAlignment(e) {
    bm.alignment = controlForm.elements[0].value
    e.stopImmediatePropagation();
}
controlForm.elements[0].addEventListener('pointermove', updateAlignment)
controlForm.elements[0].addEventListener('pointerdown', updateAlignment)


controlForm.elements[1].addEventListener('change', () => {
    showAlignment = controlForm.elements[1].checked
})
function updateCohesion(e) {
    bm.cohesion = controlForm.elements[2].value
    console.log(bm.cohesion)
    e.stopImmediatePropagation();
}
controlForm.elements[2].addEventListener('pointermove', updateCohesion)
controlForm.elements[2].addEventListener('pointerdown', updateCohesion)


controlForm.elements[3].addEventListener('change', () => {
    showCohesion = controlForm.elements[3].checked
})
function updateSeparation(e) {
    bm.separation = controlForm.elements[4].value
    e.stopImmediatePropagation();
}
controlForm.elements[4].addEventListener('pointermove', updateSeparation) 
controlForm.elements[4].addEventListener('pointerdown', updateSeparation)
controlForm.elements[5].addEventListener('change', () => {
    showSeparation = controlForm.elements[5].checked
})


const ctx = visCanvas.getContext('2d')
bm.canvas.addEventListener('draw', (e) => {
    if (!bm?.boids[0]?.pos[0]) return;
    ctx.clearRect(0, 0, visCanvas.width, visCanvas.height);
    // draw boids onto vis canvas
    let xStart = bm.boids[0].pos[0] - bm.maxNeighborDistance,
    yStart = bm.boids[0].pos[1] - bm.maxNeighborDistance;
    ctx.globalAlpha = 1
    ctx.save();
    ctx.beginPath();
    ctx.arc(visCanvas.width/2, visCanvas.height/2, bm.maxNeighborDistance, 0, Math.PI * 2);
    ctx.clip();
    ctx.drawImage(bm.canvas, xStart, yStart, bm.maxNeighborDistance*2, bm.maxNeighborDistance*2, visCanvas.width/2-bm.maxNeighborDistance, visCanvas.height/2 - bm.maxNeighborDistance, bm.maxNeighborDistance*2, bm.maxNeighborDistance*2)
    ctx.restore();

    let canvasOffset = [bm.boids[0].pos[1] - visCanvas.width/2, bm.boids[0].pos[0] - visCanvas.height/2]
    visCanvas.style.top = canvasOffset[0] + 'px'
    visCanvas.style.left = canvasOffset[1] + 'px'
    // find boids within bm.maxNeighborDistance
    let boidsWithin = bm.boids.slice(1).filter(b => 
        {
            b.distFrom0 = Math.sqrt(Math.pow(b.pos[0] - bm.boids[0].pos[0], 2) + Math.pow(b.pos[1] - bm.boids[0].pos[1], 2))
            return b.distFrom0 < bm.maxNeighborDistance
        })
    let boidsTooClose = boidsWithin.filter(b =>b.distFrom0 < bm.maxCloseness)
    if (showAlignment) // if showAlignment
    {
        // calculate average of boidsWithin velocities
        let avgVX = 0, avgVY = 0
        boidsWithin.forEach(b => {
            avgVX += b.direction[0]
            avgVY += b.direction[1]
            ctx.strokeStyle = '#00f'
            ctx.lineWidth = 1
            ctx.beginPath()
            let localBPos = [b.pos[0] - bm.boids[0].pos[0] + visCanvas.width/2, b.pos[1] - bm.boids[0].pos[1] + visCanvas.height/2]
            ctx.moveTo(...localBPos)
            ctx.lineTo(...b.direction.map((e, i)=>e*10+localBPos[i]))
            ctx.stroke()
        })
        avgVX /= boidsWithin.length
        avgVY /= boidsWithin.length
        // draw a line going from center to average velocity
        ctx.beginPath();
        ctx.lineWidth = 5;
        ctx.moveTo(visCanvas.width/2, visCanvas.height/2);
        ctx.lineTo(avgVX*bm.alignment*visCanvas.width/2+visCanvas.width/2, avgVY*bm.alignment*visCanvas.height+visCanvas.height/2);
        ctx.strokeStyle = '#0000ff';
        ctx.stroke();
    }
    if (showSeparation) // if showSeparation
    {
        let avgRepulsion = [0, 0]
        // draw lines from center to all boidsWithin
        ctx.lineWidth = 1;
        boidsTooClose.forEach(b => {
            ctx.strokeStyle = '#ff0000'
            ctx.beginPath();
            ctx.globalAlpha = b.distFrom0 / bm.maxCloseness
            let localBPos = [b.pos[0] - bm.boids[0].pos[0] + visCanvas.width/2, b.pos[1] - bm.boids[0].pos[1] + visCanvas.height/2]
            let vecNormed = normalize(...localBPos.map(e => visCanvas.width/2 - e))
            let normed = normalize(vecNormed[0]*bm.maxCloseness/b.distFrom0, vecNormed[1]*bm.maxCloseness/b.distFrom0)
            avgRepulsion[0], avgRepulsion[1] += normed[0], normed[1]
            ctx.moveTo(...localBPos);
            ctx.lineTo(...(vecNormed.map((e, i) =>10*e*bm.maxCloseness/b.distFrom0 + localBPos[i])));
            ctx.stroke();
        })
        // draw line from center to center+avgRepulsion
        ctx.strokeStyle = '#ff0000'
        ctx.lineWidth = 5;
        ctx.beginPath();
        ctx.moveTo(visCanvas.width/2, visCanvas.height/2);
        ctx.lineTo(visCanvas.width/2 + avgRepulsion[0]*visCanvas.width/2*bm.separation, visCanvas.height/2 + avgRepulsion[1]*visCanvas.height/2*bm.separation);
        ctx.stroke();
        ctx.lineWidth = 1;
    }
    if (showCohesion) // if showCohesion
    {
        // calculate average of boidsWithin positions
        let avgX = 0, avgY = 0
        boidsWithin.forEach(b => {
            avgX += b.pos[0]
            avgY += b.pos[1]
        })
        avgX /= boidsWithin.length
        avgY /= boidsWithin.length
        let direction = [avgX - bm.boids[0].pos[0], avgY - bm.boids[0].pos[1]]
        let normedDirection = normalize(...direction)
        let localAvgPos = [normedDirection[0]*visCanvas.width/2*bm.cohesion + visCanvas.width/2, normedDirection[1]*visCanvas.height/2*bm.cohesion + visCanvas.height/2]
        localAvgPos = [direction[0] + visCanvas.width/2, direction[1] + visCanvas.height/2]
        // draw line from center to average
        ctx.beginPath()
        ctx.moveTo(visCanvas.width/2, visCanvas.height/2)
        ctx.lineTo(...localAvgPos)
        ctx.strokeStyle = '#00ff00'
        ctx.lineWidth = 5
        ctx.stroke()
        
    }
})
bm.canvas.addEventListener('resize', () => {
    visCanvas.width = bm.maxNeighborDistance*3;
    visCanvas.height = bm.maxNeighborDistance*3;
})