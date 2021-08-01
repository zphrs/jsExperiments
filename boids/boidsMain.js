/*
TODO:
- Clean up this garbage pile of code to encapsulate it into a module/easy to use API
- Remove unused code chunks.
- Expose the various boid factors in the encapsulation with some sort of api
- expose the MAX_BOIDS constant as well and generate the glsl file dynamically.
- Add the maxNeighborDistance and the maxCloseness as uniforms in the glsl file
- Display a count of the boids
- Display the frame rate
WISH LIST:
- Render with the GPU instead of JS canvas, you can use FrameBuffers to pass the data from one GPU canvas to another
- Make it 3D 
- Add vis to mouse position
- Add a way to adjust the parameters of the boids - use JS + some sort of slider
- add keyboard controls to drag the boids around
- make boids dodge the walls of the canvas
- make boids look like fish or birds
*/
function normalize(...args) {
    let vecLength = Math.sqrt(args.map(e=>e*e).reduce((a, b) => a + b))
    return args.map((x) => x/vecLength)
}

/**
 * @param {HTMLCanvasElement?} canvas canvas element to draw boids to
 * @param {number} xScreenSizeAtConfig the x size of the screen that you set the weights at
 * @param {number} yScreenSizeAtConfig the y size of the screen that you set the weights at
 * @param {number} minBoids minimum number of boids to generate - starting boid count
 * @param {number} maxBoids maximum number of boids to generate
 * @param {number} speed speed of the boids
 * @param {number} radius radius of the boids for drawing
 * @param {number} separation 
 * @param {number} alignment
 * @param {number} cohesion
 * @param {number} stubbornness
 * @param {number} pointerAttraction
 * @param {number} maxNeighborDistance
 * @param {number} maxCloseness
 * @param {number} minTouchTime
 **/
class BoidManager {
    constructor(
        canvas=null, xScreenSizeAtConfig, yScreenSizeAtConfig,
        minBoids=1, maxBoids=5000, speed=500, radius = .5,
        separation=2, alignment=.2, cohesion=.5, stubbornness=2, pointerAttraction=1,
        maxNeighborDistance=50, maxCloseness=50,
        minTouchTime = 50
        ) 
    {
        const t = this;
        t.boidCt = minBoids
        t._minBoidCt = minBoids;
        t._maxBoids = maxBoids;
        t.canvas = canvas
        t._speed = speed
        t._radius = radius
        t._separation = separation
        t._alignment = alignment
        t._cohesion = cohesion
        t._stubbornness = stubbornness
        t._pointerAttraction = pointerAttraction
        t._maxNeighborDistance = maxNeighborDistance
        t.minTouchTime = minTouchTime
        console.log(t._maxNeighborDistance)
        t._maxCloseness = maxCloseness
        if (!t.canvas)
        {
            function mountCanvas()
            {
                // make and mount canvas
                const canvas = document.createElement('canvas')
                canvas.id = 'boids';
                // set canvas to 100% of the window
                canvas.width = window.innerWidth
                canvas.height = window.innerHeight
                canvas.style.position = 'fixed'
                canvas.style.top = 0
                canvas.style.left = 0
                canvas.style.zIndex = 0
                canvas.style.touchAction = 'none'
                // mount canvas
                document.body.prepend(canvas)
                // listen to resize and scale canvas
                window.addEventListener('resize', function() {
                    const oldConfigAreaRatio = t.configAreaRatio
                    canvas.width = window.innerWidth
                    canvas.height = window.innerHeight
                    t.configAreaRatio =  Math.sqrt(t.canvas.width*t.canvas.height/(xScreenSizeAtConfig*yScreenSizeAtConfig))
                    t.radius *= t.configAreaRatio / oldConfigAreaRatio
                    t.separation *= t.configAreaRatio / oldConfigAreaRatio
                    t.alignment *= t.configAreaRatio / oldConfigAreaRatio
                    t.cohesion *= t.configAreaRatio / oldConfigAreaRatio
                    t.stubbornness *= t.configAreaRatio / oldConfigAreaRatio
                    t.pointerAttraction *= t.configAreaRatio / oldConfigAreaRatio
                    t.maxNeighborDistance *= t.configAreaRatio / oldConfigAreaRatio
                    t.maxCloseness *= t.configAreaRatio / oldConfigAreaRatio
                    t.speed *= t.configAreaRatio / oldConfigAreaRatio
                    t.minBoidCt *= t.configAreaRatio / oldConfigAreaRatio
                    t.maxBoids *= t.configAreaRatio / oldConfigAreaRatio
                })
                canvas.width = window.innerWidth
                canvas.height = window.innerHeight
                return canvas;
            }
            t.canvas = mountCanvas()
        }
        t.canvas.width = t.canvas.scrollWidth
        t.canvas.height = t.canvas.scrollHeight
        t.configAreaRatio =  t.canvas.width*t.canvas.height/(xScreenSizeAtConfig*yScreenSizeAtConfig)

        t._minBoidCt *= t.configAreaRatio
        t._maxBoids *= t.configAreaRatio
        t._speed *= t.configAreaRatio
        t._radius *= t.configAreaRatio
        t._separation *= t.configAreaRatio
        t._alignment *= t.configAreaRatio
        t._cohesion *= t.configAreaRatio
        t._stubbornness *= t.configAreaRatio
        t._pointerAttraction *= t.configAreaRatio
        t._maxNeighborDistance *= t.configAreaRatio
        t._maxCloseness *= t.configAreaRatio
        t.ctx = t.canvas.getContext('2d')
        t.boids = []
        for (let i = 0; i < t.boidCt; i++) {
            t.boids.push(new Boid(
                [t.canvas.width*Math.random(), t.canvas.height*Math.random()], 
                normalize(Math.random()-.5, Math.random()-.5), 
                t._speed, 
                t.radius
            ))
        }
        const pointerPos = [-1,-1] // needs to be immutable for initComputeWebgl 
        t._pointerPos = pointerPos; // for manually setting the pointerPos if you so choose
        let mouseOn = false;
        let onAt = 0
        let turnOffTimeout = undefined
        let updatePointerPos = (e) => 
        {
            if (mouseOn)
            {
                if (window.getComputedStyle(t.canvas).position === 'fixed')
                {
                    pointerPos[0] = e.clientX
                    pointerPos[1] = e.clientY
                }
                else   
                {
                    pointerPos[0] = e.pageX - t.canvas.offsetLeft
                    pointerPos[1] = e.pageY - t.canvas.offsetTop
                }
                window.clearTimeout(turnOffTimeout)
            }
            else
            {
                turnOffTimeout = window.setTimeout(() => {
                    pointerPos[0] = -2
                    pointerPos[1] = -2
                }, Math.max(t.minTouchTime - (performance.now() - onAt)), 0)
            }
        }
        window.addEventListener('pointermove', updatePointerPos);
        window.addEventListener('pointerleave', e=>
        {
            mouseOn = false;
            updatePointerPos(e)
        })
        window.addEventListener('pointercancel', e=>
        {
            mouseOn = false;
            updatePointerPos(e)
        })
        window.addEventListener('pointerup', e=>
        {
            mouseOn = false;
            updatePointerPos(e)
        })
        window.addEventListener('pointerdown', e=>
        {
            mouseOn = true;
            onAt = performance.now()
            updatePointerPos(e)
        })
        start()
        async function start() {
            // clear canvas
            t.glHandler = await initComputeWebgl(t.boids, pointerPos)
            console.log(t._maxNeighborDistance)
            t.glHandler.updateWeights(t._separation, t._alignment, t._cohesion, t._stubbornness, t._pointerAttraction, t._maxNeighborDistance, t._maxCloseness)
            let prevTime = performance.now();
            let timeRemovedAt = prevTime;
            let time10LastAdded = prevTime;
            function perFrame(time)
            {
                let dt = (time - prevTime) / 1000
                prevTime = time
                t.ctx.clearRect(0, 0, t.ctx.canvas.width, t.ctx.canvas.height)
                // draw t.boids
                let newDirections = t.glHandler.getNextFrame(t.boids, pointerPos)
                for (var i = 0; i<t.boids.length; i++)
                {
                    const newDir = newDirections.slice(i*2, i*2+2);
                    if (Number.isNaN(newDir[0]) || Number.isNaN(newDir[1]) || !Number.isFinite(newDir[0]) || !Number.isFinite(newDir[1]))
                    {
                        console.log('infinity or NaN output from gpgpu calc')
                        continue;
                    }
                    t.boids[i].direction = newDir
                }
                for (let i = 0; i < t.boids.length; i++) {
                    
                    t.boids[i].update(t.ctx)
                    t.boids[i].draw(t.ctx)
                }
                if (dt>1/40)
                {
                    time10LastAdded = performance.now()
                    if (dt>1/30 && t.boids.length-2 > t._minBoidCt && (time - timeRemovedAt) > 1000) {
                        timeRemovedAt = time
                        for (var i = 0; i<2; i++)
                        {
                            t.boids.pop();
                        }
                        t.glHandler.updateBoidCt(t.boids)
                    }
                }
                if (dt <= 1/45 && (time - time10LastAdded)/1000 > t.boids.length/t._maxBoids && t.boids.length - 8 < t._maxBoids)
                {
                    console.log( (time - time10LastAdded)/1000, t.boids.length/t._maxBoids)
                    time10LastAdded = performance.now()
                    console.log(t.boids.length)
                    for (var i = 0; i<8; i++)
                    {
                        switch(i%4)
                        {
                            case 0: // enter from left
                                t.boids.push(new Boid(
                                    [0, t.canvas.height*Math.random()],
                                    [Math.random()*.5, Math.random()-.5],
                                    t._speed,
                                    t.radius
                                ))
                                break;
                            case 1: // enter from right
                                t.boids.push(new Boid(
                                    [t.canvas.width, t.canvas.height*Math.random()],
                                    [-Math.random()*.5, Math.random()-.5],
                                    t._speed,
                                    t.radius
                                ))
                                break;
                            case 2: // enter from top
                                t.boids.push(new Boid(
                                    [t.canvas.width*Math.random(), 0],
                                    normalize(Math.random()-.5, Math.random()*.5),
                                    t._speed,
                                    t.radius
                                ))
                                break;
                            case 3: // enter from bottom
                                t.boids.push(new Boid(
                                    [t.canvas.width*Math.random(), t.canvas.height],
                                    normalize(Math.random()-.5, -Math.random()*.5),
                                    t._speed,
                                    t.radius
                                ))
                                break;
                        }
                    }
                    t.glHandler.updateBoidCt(t.boids)
                }
                // request new frame
                requestAnimationFrame(perFrame)
            }
            requestAnimationFrame(perFrame)
        }
    }
    set minBoidCt(v) {
        this._minBoidCt = v
        while (this._minBoidCt > this.boids.length) {
            this.boids.push(new Boid(
                [this.canvas.width*Math.random(), this.canvas.height*Math.random()],
                normalize(Math.random()-.5, Math.random()*.5),
                this._speed,
                this._radius
            ))
        }
    }
    get minBoidCt() {
        return this._minBoidCt
    }
    set maxBoids(v) {
        this._maxBoids = v
        while (this._maxBoids < this.boids.length) {
            this.boids.pop()
        }
    }
    get maxBoids() {
        return this._maxBoids
    }
    set separation(v) {
        this._separation = v;
        this.glHandler.updateSeparation(v);
    }
    get separation() {
        return this._separation;
    }
    set alignment(v) {
        this._alignment = v;
        this.glHandler.updateAlignment(v);
    }
    get alignment() {
        return this._alignment;
    }
    set cohesion(v) {
        this._cohesion = v;
        this.glHandler.updateCohesion(v);
    }
    get cohesion() {
        return this._cohesion;
    }
    set stubbornness(v) {
        this._stubbornness = v;
        this.glHandler.updateStubbornness(v);
    }
    get stubbornness() {
        return this._stubbornness;
    }
    set pointerAttraction(v) {
        this._pointerAttraction = v;
        this.glHandler.updatePointerAttraction(v);
    }
    get pointerAttraction() {
        return this._pointerAttraction;
    }
    set maxNeighborDistance(v) {
        this._maxNeighborDistance = v;
        this.glHandler.updateMaxNeighborDistance(v);
    }
    get maxNeighborDistance() {
        return this._maxNeighborDistance;
    }
    set maxCloseness(v) {
        this._maxCloseness = v;
        this.glHandler.updateMaxCloseness(v);
    }
    get maxCloseness() {
        return this._maxCloseness;
    }
    set speed(v) {
        this._speed = v;
        console.log('here')
        this.boids.forEach(b => b.speed = v);
    }
    get speed() {
        return this._speed;
    }
    set radius(v) {
        this._radius = v;
        this.boids.forEach(b => b.radius = v);
    }
    get radius() {
        return this._radius;
    }

}


// Boid class
function Boid(pos, direction, speed, radius) {
    this.pos = pos
    this.direction = direction
    this.speed = speed
    this.radius = radius
    this.coord = new Uint32Array(2)
}
Boid.prototype.draw = function(ctx) {
    // TODO: Render direction to framebuffer and then use direction in another gpgpu calc to 
    // get the positions of the boids, and then draw them properly with WebGL - takes a lot of time
    // to getPixels and then draw them in javascipt, better to do almost all of it on gpu
    const t = this;
    if (Number.isNaN(t.pos[0]) || Number.isNaN(t.pos[1])) {
        console.log('frick')
        t.pos[0] = 0
        t.pos[1] = 0
        return;
    }
    const size = Math.max(t.radius, 1)
    function drawTrail()
    {
        ctx.beginPath()
        ctx.moveTo(t.pos[0], t.pos[1])
        ctx.lineTo(t.pos[0] - t.direction[0]*size*1.5, t.pos[1]  - t.direction[1]*size*1.5)
        // ctx.strokeStyle = '#FFF'
        ctx.strokeStyle = '#8334eb'
        ctx.lineWidth = size
        ctx.stroke()
    }
    function drawHead()
    {
        
        ctx.beginPath()
        ctx.moveTo(t.pos[0], t.pos[1])
        ctx.lineTo(t.pos[0] - t.direction[0]*size, t.pos[1]  - t.direction[1]*size)
        ctx.strokeStyle = '#AD7CEE'
        // ctx.strokeStyle = '#FFF'
        ctx.lineWidth = size
        ctx.stroke()
    }
    drawTrail()
    // drawHead()
}
Boid.prototype.update = function(ctx)
{
    if (Number.isNaN(this.direction[0]) || Number.isNaN(this.direction[1])) {
        console.log('frick for direction before norming')
        this.direction[0] = 0
        this.direction[1] = 1
        // return;
    }
    this.direction = normalize(this.direction).map(e=>e+Math.random()*0.01-0.005) // add a bit of noise
    function normalize(direction)
    {
        let length = Math.sqrt(direction[0]*direction[0] + direction[1]*direction[1])
        if (length === 0 || !Number.isFinite(length))
        {
            // console.log('direction is 0, 0')
            return [0, 1]
        }
        return [direction[0]/length, direction[1]/length]
    }
    if (Number.isNaN(this.direction[0]) || Number.isNaN(this.direction[1])) {
        console.log('frick for direction')
        this.direction[0] = 0
        this.direction[1] = 1
        return;
    }
    this.pos = this.pos.map((x, i) => x+this.direction[i]*this.speed*(1/60)*Math.min(ctx.canvas.width,ctx.canvas.height)/2000)
    if (this.pos[0] > ctx.canvas.width)
    {
        this.pos[0] -= ctx.canvas.width
    }
    else if (this.pos[0] < 0)
    {
        this.pos[0] += ctx.canvas.width
    }
    if (this.pos[1] > ctx.canvas.height)
    {
        this.pos[1] -= ctx.canvas.height
    }
    else if (this.pos[1] < 0)
    {
        this.pos[1] += ctx.canvas.height
    }

}

// maybe do insertSort eventually to sort boids before shader, but tried it and it was buggy.



// compute shader def for boids
async function initComputeWebgl(boids, pointerPos)
{
    const vs = `
    attribute vec4 position;
    void main() {
        gl_Position = position;
    }
    `;
    // import fragment shader from posDirCalc.glsl
    const fs = await (await fetch('./posDirCalc.glsl')).text();
    // output needs width of 2 because each rgb pixel stores one 32 bit float, and we have 2 floats for x and y direction
    const dstWidth = 2;
    let dstHeight = boids.length;
    
    // make a canvas to return the new vector with 
    const canvasContainer = document.createElement('div')
    const canvas = document.createElement('canvas');
    canvas.width = dstWidth;
    canvas.height = dstHeight;
    canvasContainer.appendChild(canvas);
    document.body.appendChild(canvasContainer);
    canvas.style.height = 'calc(100% - 20px)';
    canvas.style.width = 'calc(100% - 20px)';
    canvas.style.boxSizing = 'border-box';
    canvasContainer.className = 'glass';
    canvas.style.position = 'absolute';
    canvas.style.filter = 'opacity(.25)';
    canvasContainer.style.height = 100 + '%';
    canvasContainer.style.boxSizing = 'border-box';

    
    const gl = canvas.getContext('webgl');
    function createShader(gl, type, source) {
        var shader = gl.createShader(type);
        gl.shaderSource(shader, source);
        gl.compileShader(shader);
        var success = gl.getShaderParameter(shader, gl.COMPILE_STATUS);
        if (success) {
        return shader;
        }
        console.warn(gl.getShaderInfoLog(shader));
        gl.deleteShader(shader);
    }
    function createProgram(gl, vertexShader, fragmentShader) {
        var program = gl.createProgram();
        vertexShader = createShader(gl, gl.VERTEX_SHADER, vertexShader);
        fragmentShader = createShader(gl, gl.FRAGMENT_SHADER, fragmentShader);
        gl.attachShader(program, vertexShader);
        gl.attachShader(program, fragmentShader);
        gl.linkProgram(program);
        var success = gl.getProgramParameter(program, gl.LINK_STATUS);
        if (success) {
        return program;
        }
    
        console.log(gl.getProgramInfoLog(program));
        gl.deleteProgram(program);
    }

    const program = createProgram(gl, vs, fs);
    const positionLoc = gl.getAttribLocation(program, 'position');
    const srcTexLoc = gl.getUniformLocation(program, 'boids');
    const srcDimensionsLoc = gl.getUniformLocation(program, 'srcDimensions');
    const separationLoc = gl.getUniformLocation(program, 'separation');
    const alignmentLoc = gl.getUniformLocation(program, 'alignment');
    const cohesionLoc = gl.getUniformLocation(program, 'cohesion');
    const stubbornnessLoc = gl.getUniformLocation(program, 'stubbornness');
    const pointerPosLoc = gl.getUniformLocation(program, 'pointerPos');
    const pointerAttractionLoc = gl.getUniformLocation(program, 'pointerAttraction');
    const maxHeighborDistanceLoc = gl.getUniformLocation(program, 'maxNeighborDistance');
    const maxClosenessLoc = gl.getUniformLocation(program, 'maxCloseness');
    
    // setup a full canvas clip space quad
    const buffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([
    -1, -1,
    1, -1,
    -1,  1,
    -1,  1,
    1, -1,
    1,  1,
    ]), gl.STATIC_DRAW);
    
    // setup our attributes to tell WebGL how to pull
    // the data from the buffer above to the position attribute
    gl.enableVertexAttribArray(positionLoc);
    gl.vertexAttribPointer(
        positionLoc,
        2,         // size (num components)
        gl.FLOAT,  // type of data in buffer
        false,     // normalize
        0,         // stride (0 = auto)
        0,         // offset
    );
    
    // create our source texture
    const srcWidth = 1; // 1 RGBA pixel with r as x position, g as y position, b as xRotationVector, a as yRotationVector
    let srcHeight = boids.length;
    const tex = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, tex);

    gl.pixelStorei(gl.UNPACK_ALIGNMENT, 1); // see https://webglfundamentals.org/webgl/lessons/webgl-data-textures.html
    gl.getExtension('OES_texture_float'); //lets us use float textures
    gl.texImage2D(
        gl.TEXTURE_2D,
        0,                // mip level
        gl.RGBA,     // internal format
        srcWidth,         // width
        srcHeight,        // height
        0,                // border
        gl.RGBA,     // format
        gl.FLOAT,         // type
        new Float32Array(boids.map(e => [...e.pos, ...e.direction]).flat())
    )
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    
    gl.useProgram(program);
    gl.uniform1i(srcTexLoc, 0);  // tell the shader the src texture is on texture unit 0
    gl.uniform2f(srcDimensionsLoc, srcWidth, srcHeight);
    let out = function() {};
    out.updateSeparation = (v) => {
        gl.uniform1f(separationLoc, v);
    };
    out.updateAlignment = (v) => {
        gl.uniform1f(alignmentLoc, v);
    };
    out.updateCohesion = (v) => {
        gl.uniform1f(cohesionLoc, v);
    };
    out.updateStubbornness = (v) => {
        gl.uniform1f(stubbornnessLoc, v);
    };
    out.updatePointerAttraction = (v) => {
        gl.uniform1f(pointerAttractionLoc, v);
    };
    out.updateMaxNeighborDistance = (v) => {
        gl.uniform1f(maxHeighborDistanceLoc, v);
    };
    out.updateMaxCloseness = (v) => {
        gl.uniform1f(maxClosenessLoc, v);
    };
    out.updateWeights = (separation, alignment, cohesion, stubbornness, pointerAttraction, maxNeighborDistance, maxCloseness) => {
        console.log(separation, alignment, cohesion, stubbornness, pointerAttraction, maxNeighborDistance, maxCloseness);
        out.updateSeparation(separation);
        out.updateAlignment(alignment);
        out.updateCohesion(cohesion);
        out.updateStubbornness(stubbornness);
        out.updatePointerAttraction(pointerAttraction);
        out.updateMaxNeighborDistance(maxNeighborDistance);
        out.updateMaxCloseness(maxCloseness);
    }
    out.updateWeights(0, 0, 0, 0, 0, 0);
    gl.uniform2f(pointerPosLoc, pointerPos[0], pointerPos[1]);
    gl.drawArrays(gl.TRIANGLES, 0, 6);  // draw 2 triangles (6 vertices)
    
    // get the result
    const results = new Uint8Array(dstWidth * dstHeight * 4); // 4 because rgba
    gl.readPixels(0, 0, dstWidth, dstHeight, gl.RGBA, gl.UNSIGNED_BYTE, results);
    // convert the results to a float32 array
    const result = new Float32Array(results.buffer);
    
    // print the results
    let boidCt = boids.length;
    out.getNextFrame = (boids, pointerPos) =>
    {
        if (boidCt !== boids.length) {
            out.updateBoidCt(boids);
        }
        // gl.bindTexture(gl.TEXTURE_2D, tex);
        // gl.pixelStorei(gl.UNPACK_ALIGNMENT, 1); // see https://webglfundamentals.org/webgl/lessons/webgl-data-textures.html
        gl.texImage2D(
            gl.TEXTURE_2D,
            0,                // mip level
            gl.RGBA,     // internal format
            srcWidth,         // width
            srcHeight,        // height
            0,                // border
            gl.RGBA,     // format
            gl.FLOAT,         // type
            new Float32Array(boids.map(e => [...e.pos, ...e.direction]).flat())
        )
        gl.uniform2f(pointerPosLoc, pointerPos[0], pointerPos[1]);
        gl.drawArrays(gl.TRIANGLES, 0, 6);  // draw 2 triangles (6 vertices)
        // get the result
        const results = new Uint8Array(dstWidth * dstHeight * 4); // 4 because rgba
        gl.readPixels(0, 0, dstWidth, dstHeight, gl.RGBA, gl.UNSIGNED_BYTE, results);
        // convert the results to a float32 array
        const result = new Float32Array(results.buffer);
        // console.log([...results].map(e=>Math.round(Number(e)/2.55)/100), result);
        return result;
    }
    out.updateBoidCt = (boids)=>
    {
        boidCt = boids.length;
        console.log(boids.length)
        if (boids.length<10000)
        {
            srcHeight = boids.length;
            dstHeight = boids.length;
            canvas.height = boids.length;
            gl.uniform2f(srcDimensionsLoc, srcWidth, srcHeight);
            gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);
        }
        else
        {
            throw "boid count too high"
        }
    }
    return out;
}
export default BoidManager;
