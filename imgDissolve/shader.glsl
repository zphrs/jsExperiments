precision mediump float;
 
// the texCoords passed in from the vertex shader.
varying vec4 v_color;
 
void main() {
  // Look up a color from the texture.
  gl_FragColor = vec4(v_color.rgba);
  // gl_FragColor = vec4(v_texCoord.x, v_texCoord.y, 0.0, 1.0);
}