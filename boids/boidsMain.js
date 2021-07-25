let boidCt = 2000;
function normalize(...args) {
    let vecLength = Math.sqrt(args.map(e=>e*e).reduce((a, b) => a + b))
    return args.map((x) => x/vecLength)
}
window.addEventListener('load', function() {
    let canvas = document.getElementById('boids')
    if (!canvas)
    {
        // make and mount canvas
        canvas = document.createElement('canvas')
        canvas.id = 'boids';
        // set canvas to 100% of the window
        canvas.width = window.innerWidth
        canvas.height = window.innerHeight
        canvas.style.position = 'absolute'
        canvas.style.top = 0
        canvas.style.left = 0
        canvas.style.zIndex = 0
        canvas.style.pointerEvents = 'none'
        // mount canvas
        document.body.appendChild(canvas)
        // listen to resize and scale canvas
        window.addEventListener('resize', function() {
            canvas.width = window.innerWidth
            canvas.height = window.innerHeight
        })
    }
    // get context
    let ctx = canvas.getContext('2d')
    // set canvas size to canvas size
    canvas.width = canvas.scrollWidth
    canvas.height = canvas.scrollHeight
    // create boids
    let boids = []
    for (let i = 0; i < boidCt; i++) {
        boids.push(new Boid([canvas.width*Math.random(), canvas.height*Math.random()], normalize(Math.random()-.5, Math.random()-.5), 200, 2))
    }
    // start animation
    start(ctx, boids)
})
async function start(ctx, boids) {
    // clear canvas
    let prevTime = 0;
    let boidsXSorted = boids.slice()
    let glHandler = await initComputeWebgl(boids)
    function perFrame(time)
    {
        insertSortX(boidsXSorted)
        let dt = (time - prevTime) / 1000
        prevTime = time
        ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height)
        // draw boids
        let newDirections = glHandler.getNextFrame(boidsXSorted)
        console.log(newDirections)
        for (var i = 0; i<boidsXSorted.length; i++)
        {
            boidsXSorted[i].direction = newDirections.slice(i*2, i*2+2)
        }
        for (let i = 0; i < boids.length; i++) {
            
            boidsXSorted[i].draw(ctx)
            boidsXSorted[i].update(ctx)
        }
        // request new frame
        requestAnimationFrame(perFrame)
    }
    requestAnimationFrame(perFrame)
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
    const t = this;
    function drawTrail()
    {
        ctx.beginPath()
        ctx.moveTo(t.pos[0], t.pos[1])
        ctx.lineTo(t.pos[0] - t.direction[0]*t.radius*25, t.pos[1]  - t.direction[1]*t.radius*25)
        ctx.strokeStyle = '#8334eb'
        ctx.lineWidth = t.radius*2
        ctx.stroke()
    }
    function drawCircle()
    {
        
        ctx.beginPath()
        ctx.arc(t.pos[0], t.pos[1], t.radius, 0, 2 * Math.PI)
        ctx.fillStyle = '#fff'
        ctx.fill()
    }
    drawTrail()
    drawCircle()
}
Boid.prototype.update = function(ctx)
{
    this.direction = normalize(this.direction)
    function normalize(direction)
    {
        let length = Math.sqrt(direction[0]*direction[0] + direction[1]*direction[1])
        if (length == 0)
        {
            console.log('direction is 0, 0')
            return [0, 1]
        }
        return [direction[0]/length, direction[1]/length]
    }
    this.pos = this.pos.map((x, i) => x+this.direction[i]*this.speed*(1/60))
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

function insertSortX(boidsByX)
{
    // sort by x
    for (let i = 1; i < boidsByX.length; i++) {
        let j = i
        while (j > 0 && boidsByX[j-1].pos[0] > boidsByX[j].pos[0]) {
            let temp = boidsByX[j]
            boidsByX[j] = boidsByX[j-1]
            boidsByX[j-1] = temp
            j--
        }
    }
}



// compute shader def for boids
async function initComputeWebgl(boids)
{
    const vs = `
    attribute vec4 position;
    void main() {
        gl_Position = position;
    }
    `;
    // import fragment shader from posDirCalc.glsl
    const fs = await (await fetch('../posDirCalc.glsl')).text();
    // output needs width of 2 because each rgb pixel stores one 32 bit float, and we have 2 floats for x and y direction
    const dstWidth = 2;
    let dstHeight = boidCt;
    
    // make a canvas to return the new vector with 
    const canvas = document.createElement('canvas');
    canvas.width = dstWidth;
    canvas.height = dstHeight;
    
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
    let srcHeight = boidCt;
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
    gl.uniform1f(separationLoc, .8);
    gl.uniform1f(alignmentLoc, 0.1);
    gl.uniform1f(cohesionLoc, 0.000005);
    gl.uniform1f(stubbornnessLoc, .6);
    gl.drawArrays(gl.TRIANGLES, 0, 6);  // draw 2 triangles (6 vertices)
    
    // get the result
    const results = new Uint8Array(dstWidth * dstHeight * 4); // 4 because rgba
    gl.readPixels(0, 0, dstWidth, dstHeight, gl.RGBA, gl.UNSIGNED_BYTE, results);
    // convert the results to a float32 array
    const result = new Float32Array(results.buffer);
    
    // print the results
    let out = function() {};
    out.getNextFrame = (boids) =>
    {
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
        if (boids.length<10000)
        {
            boids.push(new Boid([canvas.width*Math.random(), canvas.height*Math.random()], normalize(0, 1), 10, 5))
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

