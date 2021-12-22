

async function loadImage(url) {
  const img = new Image();
  img.src = url;
  img.crossOrigin = "anonymous";
  return new Promise((resolve, reject) => {
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error("Could not load image at " + url));
  });
}
// https://css-tricks.com/converting-color-spaces-in-javascript/
function rgbToHsl(r,g,b) {
  // Make r, g, and b fractions of 1
  r /= 255;
  g /= 255;
  b /= 255;

  // Find greatest and smallest channel values
  let cmin = Math.min(r,g,b),
      cmax = Math.max(r,g,b),
      delta = cmax - cmin,
      h = 0,
      s = 0,
      l = 0;

  // Calculate hue
  // No difference
  if (delta == 0)
    h = 0;
  // Red is max
  else if (cmax == r)
    h = ((g - b) / delta) % 6;
  // Green is max
  else if (cmax == g)
    h = (b - r) / delta + 2;
  // Blue is max
  else
    h = (r - g) / delta + 4;

  h = Math.round(h * 60);
    
  // Make negative hues positive behind 360°
  if (h < 0)
      h += 360;

  // Calculate lightness
  l = (cmax + cmin) / 2;

  // Calculate saturation
  s = delta == 0 ? 0 : delta / (1 - Math.abs(2 * l - 1));
    
  // Multiply l and s by 100
  s = +(s);
  l = +(l);

  return [h, s, l]
}

class Px {
  constructor(x, y, r, g, b, a) {
    this.color = new Uint8Array(4);
    this.color[0] = r;
    this.color[1] = g;
    this.color[2] = b;
    this.color[3] = a;
    this.position = new Float32Array(2);
    this.position[0] = x;
    this.position[1] = y;
    this.brightness = (r + g + b) / 3;
  }

  changeColor(r, g, b, a) {
    this.color[0] = r;
    this.color[1] = g;
    this.color[2] = b;
    this.color[3] = a;
    this.brightness = (r + g + b) / 3;
  }
  setNewValues(x, y, r, g, b, a) {
    this.newColor = new Uint8Array(4);
    this.newColor[0] = r;
    this.newColor[1] = g;
    this.newColor[2] = b;
    this.newColor[3] = a;
    this.newPosition = new Float32Array(2);
    this.newPosition[0] = x;
    this.newPosition[1] = y;
    this.newBrightness = (r + g + b) / 3;
    this.oldPosition = this.position.copyWithin(0);
    this.oldColor = this.color.copyWithin(0);
  }

  copy() {
    return new Px(this.position[0], this.position[1], this.color[0], this.color[1], this.color[2], this.color[3]);
  }
}

class PxHolder {
  constructor(image, gl, program) {
    const t = this;
    t.gl = gl;
    t.program = program;
    this.width = image.width;
    this.height = image.height;
    this.array = new Array(image.width * image.height);
    const ctx = document.createElement("canvas").getContext("2d");
    ctx.canvas.width = image.width;
    ctx.canvas.height = image.height;
    ctx.drawImage(image, 0, 0);
    const imgData = ctx.getImageData(0, 0, image.width, image.height);
    let offsetX = 0;
    let offsetY = 0;
    let scale = Math.min(
      gl.canvas.width / image.width,
      gl.canvas.height / image.height
    );
    if (scale < 1) {
      offsetX = (gl.canvas.width - image.width * scale) / 2;
      offsetY = (gl.canvas.height - image.height * scale) / 2;
    } else {
      offsetX = (gl.canvas.width - image.width) / 2;
      offsetY = (gl.canvas.height - image.height) / 2;
      scale = 1;
    }
    for (let i = 0; i < image.width; i++) {
      for (let j = 0; j < image.height; j++) {
        const index = (j * image.width + i) * 4;
        const px = new Px(
          scale*(2*i - image.width)/gl.canvas.width,
          scale*(image.height - 2*j)/gl.canvas.height,
          imgData.data[index],
          imgData.data[index + 1],
          imgData.data[index + 2],
          imgData.data[index + 3]
        );
        t.array[j * image.width + i] = px;
      }
    }
    // for (let i = 0; i < this.array.length; i++) {
    //   this.array[i] = new px(
    //     (2*(i % this.width)) / maxSide - 1,
    //     1 - 2*Math.floor(i / this.width) / maxSide,
    //     imgData.data[i * 4],
    //     imgData.data[i * 4 + 1],
    //     imgData.data[i * 4 + 2],
    //     imgData.data[i * 4 + 3]
    //   );
    // }
    // t.array.sort((a, b) => {
    //   return a.brightness - b.brightness;
    // });
    this.resort();
  }

  resort() {
    // this.array.sort((a, b) => {
    //   return a.brightness - b.brightness;
    //   });

    this.array.sort((a, b) => {
      return (
        a.brightness - b.brightness
      );
    });
  }

  bufferToOld() {
    const t = this;
    const positionBuffer = t.gl.createBuffer();
    const positionLoc = t.gl.getAttribLocation(t.program, "a_position");
    t.gl.enableVertexAttribArray(positionLoc);

    t.gl.bindBuffer(t.gl.ARRAY_BUFFER, positionBuffer);
    const positionArray = new Float32Array(t.array.length * 2);
    for (let i = 0; i < t.array.length; i++) {
      positionArray[i * 2] = t.array[i].position[0];
      positionArray[i * 2 + 1] = t.array[i].position[1];
    }
    t.gl.bufferData(t.gl.ARRAY_BUFFER, positionArray, t.gl.STATIC_DRAW);
    t.gl.vertexAttribPointer(positionLoc, 2, t.gl.FLOAT, false, 0, 0);
    
    const colorBuffer = t.gl.createBuffer();
    const colorLoc = t.gl.getAttribLocation(t.program, "a_color");
    t.gl.enableVertexAttribArray(colorLoc);
    t.gl.bindBuffer(t.gl.ARRAY_BUFFER, colorBuffer);
    const colorArray = new Uint8Array(t.array.length * 4);
    for (let i = 0; i < t.array.length; i++) {
      colorArray[i * 4] = t.array[i].color[0];
      colorArray[i * 4 + 1] = t.array[i].color[1];
      colorArray[i * 4 + 2] = t.array[i].color[2];
      colorArray[i * 4 + 3] = t.array[i].color[3];
    }
    t.gl.bufferData(t.gl.ARRAY_BUFFER, colorArray, t.gl.STATIC_DRAW);
    t.gl.vertexAttribPointer(colorLoc, 4, t.gl.UNSIGNED_BYTE, true, 0, 0);
  }

  bufferToNew() {
    const t = this;
    const positionBuffer = t.gl.createBuffer();
    const positionLoc = t.gl.getAttribLocation(t.program, "a_newPosition");
    t.gl.enableVertexAttribArray(positionLoc);

    t.gl.bindBuffer(t.gl.ARRAY_BUFFER, positionBuffer);
    const positionArray = new Float32Array(t.array.length * 2);
    for (let i = 0; i < t.array.length; i++) {
      positionArray[i * 2] = t.array[i].position[0];
      positionArray[i * 2 + 1] = t.array[i].position[1];
    }
    t.gl.bufferData(t.gl.ARRAY_BUFFER, positionArray, t.gl.STATIC_DRAW);
    t.gl.vertexAttribPointer(positionLoc, 2, t.gl.FLOAT, false, 0, 0);
    
    const colorBuffer = t.gl.createBuffer();
    const colorLoc = t.gl.getAttribLocation(t.program, "a_newColor");
    t.gl.enableVertexAttribArray(colorLoc);
    t.gl.bindBuffer(t.gl.ARRAY_BUFFER, colorBuffer);
    const colorArray = new Uint8Array(t.array.length * 4);
    for (let i = 0; i < t.array.length; i++) {
      colorArray[i * 4] = t.array[i].color[0];
      colorArray[i * 4 + 1] = t.array[i].color[1];
      colorArray[i * 4 + 2] = t.array[i].color[2];
      colorArray[i * 4 + 3] = t.array[i].color[3];
    }
    t.gl.bufferData(t.gl.ARRAY_BUFFER, colorArray, t.gl.STATIC_DRAW);
    t.gl.vertexAttribPointer(colorLoc, 4, t.gl.UNSIGNED_BYTE, true, 0, 0);
  }
}

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
/**
 * 
 * @param {string} fragmentShader 
 * @param {number} width 
 * @param {number} height 
 * @description does all initialization to render
 * a single image except for running 
 * `gl.texImage2D()`.
 */
function makeFragHolder(fragmentShader, width, height) {
  const vs = `
    attribute vec4 a_color;
    varying vec4 v_color;
    attribute vec4 a_newColor;
    attribute vec2 a_position;
    attribute vec2 a_newPosition;
    uniform float u_time;
    uniform float u_scale;
    const float MAX_DIST = 2.0;

    void main() {
      v_color = mix(a_color, a_newColor, 2.0*max(0.0, u_time - 0.5));
      gl_PointSize = 1.0;
      gl_Position = vec4(
        mix(
          a_position, 
          a_newPosition, 
          min(
            u_time / min(
              max(
                length(
                  a_newPosition - a_position
                ) 
                / MAX_DIST, 0.1
              ), 2.0
            ), 
            1.0
          )
        ), 
        0, 1);
    }
  `;
  const canvas = document.createElement("canvas");

  canvas.width = width;
  canvas.height = height;

  const gl = canvas.getContext("webgl");
  const program = createProgram(gl, vs, fragmentShader);

  gl.useProgram(program);

  return {gl, program};
}

async function transitionBetweenPxHolders(holders, time, totalTime) {
  // figure out offset of holders array based on time
  const promise = new Promise((resolve, reject) => {
    const timePerHolder = totalTime / (holders.length - 1);
    const offset = time % timePerHolder;
    const index = Math.floor(time / timePerHolder);
    const t = offset / timePerHolder;
    
    const pxHolder1 = holders[index];
    const pxHolder2 = holders[index + 1];
    pxHolder2.bufferToNew();
    const timeLoc = pxHolder2.gl.getUniformLocation(pxHolder2.program, "u_time");
    pxHolder2.gl.uniform1f(timeLoc, 0);
    // clear the screen
    pxHolder2.gl.clearColor(0, 0, 0, 0);
    pxHolder2.gl.clear(pxHolder2.gl.COLOR_BUFFER_BIT);
    pxHolder1.bufferToOld();
    console.log(pxHolder1.array.length, pxHolder2.array.length)

    let startTime = performance.now();

    function draw(time) {
      let timeDiff = (time - startTime) * 0.0005;
      // console.log(timeDiff);
      if (timeDiff > 1) {
        timeDiff = 1;
        resolve();
      }
      pxHolder2.gl.uniform1f(timeLoc, timeDiff/1);
      pxHolder2.gl.clearColor(0, 0, 0, 0);
      pxHolder2.gl.clear(pxHolder2.gl.COLOR_BUFFER_BIT);
      pxHolder1.gl.drawArrays(pxHolder1.gl.POINTS, 0, pxHolder1.array.length);
      if (timeDiff < 1) {
        requestAnimationFrame(draw);
      }
    }
    requestAnimationFrame(draw);
  });
}

async function initWebgl(firstImg) {
  const imgType = typeof firstImg;
  switch (imgType) {
    case "string":
      firstImg = await loadImage(firstImg);
      break;
    case "object":
      // check if object is htmlimageelement
      if (firstImg.tagName !== "IMG") {
        throw new Error("first argument must be a string or an image element");
      }
      break;
    default:
      throw new Error("first argument must be a string or an image element");
  }
  const fs = await fetch("./shader.glsl").then(res => res.text());
  const {gl, program} = makeFragHolder(
    fs
  );

  document.body.appendChild(gl.canvas);
  gl.canvas.width = gl.canvas.parentElement.clientWidth;
  gl.canvas.height = gl.canvas.parentElement.clientHeight;

  let pxHolder = new PxHolder(firstImg, gl, program);

  let out = function () {};

  out.resize = function () {
    const boundingRect = gl.canvas.parentElement.getBoundingClientRect();
    const newWidth = boundingRect.width;
    const newHeight = boundingRect.height;

    gl.clearColor(0, 0, 0, 0);
    gl.clear(gl.COLOR_BUFFER_BIT);
    gl.canvas.width = newWidth;
    gl.canvas.height = newHeight;
    gl.viewport(0, 0, newWidth, newHeight);
    gl.drawArrays(gl.POINTS, 0, pxHolder.array.length);
  };

  out.transitionImg = async function (img) {
    const imgType = typeof img;
    switch (imgType) {
      case "string":
        img = await loadImage(img);
        break;
      case "object":
        // check if object is htmlimageelement
        if (img.tagName !== "IMG") {
          throw new Error(
            "first argument must be a string or an image element"
          );
        }
        break;
      default:
        throw new Error("first argument must be a string or an image element");
    }
    currentImg = img;
    console.log("transitioning");
    const newPxHolder = new PxHolder(img, gl, program);
    const lengthDiff = pxHolder.array.length - newPxHolder.array.length;
    console.log(lengthDiff);
    if (lengthDiff > 0) {
      // pad the new array with the old array
      for (let i = 0; i<lengthDiff; i++)
      {
        // newPxHolder.array.push(newPxHolder.array[Math.floor(Math.random() * newPxHolder.array.length)]);
        const copied = newPxHolder.array[Math.floor(Math.random() * newPxHolder.array.length)].copy();
        copied.deleteMe = true;
        newPxHolder.array.push(copied);
      }
    }
    else {
      for (let i = 0; i<-lengthDiff; i++)
      {
        pxHolder.array.push(pxHolder.array[Math.floor(Math.random() * pxHolder.array.length)]);
      }
      pxHolder.resort();
    }
    await transitionBetweenPxHolders([pxHolder, newPxHolder], 0, 1);
    pxHolder = newPxHolder;
    if (lengthDiff > 0) {
      pxHolder.array = pxHolder.array.filter(px => !px.deleteMe);
    }
  };
  return out;
}
let lastImageSeed = Math.round(Math.random() * 100000);
let lastImageUrl = `https://picsum.photos/seed/${lastImageSeed}/${100*Math.floor(2+Math.random()*3)}/${100*Math.floor(2+Math.random()*3)}`;

let timeout = null;
let lastResize = performance.now();
function onResize(webgl) {
  const now = performance.now();
  if (timeout) {
    clearTimeout(timeout);
  }
  timeout = window.setTimeout(async () => {
    if (now - lastResize > 250) {
      lastResize = now;
      await webgl.transitionImg(lastImageUrl);
    }
  }, 250);
  window.requestAnimationFrame(webgl.resize);
}


initWebgl(lastImageUrl).then(function (webgl) {
  window.addEventListener("resize", (e) => {
    onResize(webgl);
    window.requestAnimationFrame(webgl.resize);
  });
  // add resize observer to body
  const resizeObserver = new ResizeObserver(async () => {
    onResize(webgl);
    window.requestAnimationFrame(webgl.resize);
  });
  resizeObserver.observe(document.body);

  document.body.addEventListener('click', ()=>{
    console.log('clicked');
    lastImageSeed = Math.round(Math.random() * 100000);
    lastImageUrl = lastImageUrl = `https://picsum.photos/seed/${lastImageSeed}/${100*Math.floor(2+Math.random()*3)}/${100*Math.floor(2+Math.random()*3)}`;
    webgl.transitionImg(lastImageUrl);
  })
});
