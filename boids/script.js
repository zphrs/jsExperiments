import BoidManager from './boidsMain.js';
let canvas=null, 
minBoids=1, maxBoids=800, speed=1000, radius = 10,
separation=.1, alignment=.2, cohesion=.1, stubbornness=1, pointerAttraction=1,
maxNeighborDistance=50, maxCloseness=50,
minTouchTime = 50,
canvasWidthAtConfig = 1920,
canvasHeightAtConfig = 1080
window.bm = new BoidManager(canvas, canvasWidthAtConfig, canvasHeightAtConfig,
    minBoids, maxBoids, speed, radius, 
    separation, alignment, cohesion, stubbornness, pointerAttraction, 
    maxNeighborDistance, maxCloseness, 
    minTouchTime)
    