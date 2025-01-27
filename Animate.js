// Vertex shader program
var VSHADER_SOURCE =
  'attribute vec4 a_Position;\n' +
  'uniform mat4 u_rotateMatrix;\n' +
  'uniform mat4 u_scaleMatrix;\n' +
  'uniform vec4 u_Translation;\n' +
  'attribute vec4 a_Color;\n' +
  'varying vec4 vColor;\n' +
  'void main() {\n' +
  '  gl_Position = u_scaleMatrix * u_rotateMatrix * a_Position + u_Translation;\n' +
  '  vColor = a_Color;\n' +
  '}\n';

// Fragment shader program
var FSHADER_SOURCE =
  'precision mediump float;\n' +
  'varying vec4 vColor;\n' +
  'void main() {\n' +
  '  gl_FragColor = vColor;\n' +
  '}\n';

// Setup the colors for the points
var colorData = [1.0, 1.0, 1.0, 1.0,  //White
                 0.0, 0.0, 1.0, 1.0,  //Blue
                 0.0, 1.0, 1.0, 1.0,  //Cyan
                 0.0, 1.0, 0.0, 1.0,  //Green
                 1.0, 1.0, 0.0, 1.0,  //Yellow
                 1.0, 0.0, 0.0, 1.0,  //Red
                 1.0, 0.0, 1.0, 1.0,  //Magenta
                 0.0, 0.0, 1.0, 1.0]; //Blue

var translation = false;
var rotation = false;
var scaling = false;
var stable = false;

var bgRed = 0.5;
var bgGreen = 0.5;
var bgBlue = 0.5;

function main(){
  // Retrieve <canvas> element
  var canvas = document.getElementById('spinning_shape');
  var transButton = document.getElementById('translate');
  var rotateButton = document.getElementById('rotate');
  var scaleButton = document.getElementById('scale');

  // Get the rendering context for WebGL
  var gl = getWebGLContext(canvas);
  if(!gl) {
    console.log('Failed to get the rendering context for WebGL');
    return;
  }

  // Initialize shaders
  if (!initShaders(gl, VSHADER_SOURCE, FSHADER_SOURCE)) {
    console.log('Failed to intialize shaders.');
    return;
  }

  transButton.addEventListener("click", () => {
    transButton.classList.toggle('clicked');
  })
  rotateButton.addEventListener("click", () => {
    rotateButton.classList.toggle('clicked');
  })
  scaleButton.addEventListener("click", () => {
    scaleButton.classList.toggle('clicked');
  })

  // Setup array to hold points of the shape
  var vertexData = [];

  //The first point will be the center of the shape
  var x_pos = 0.0;
  var y_pos = 0.0;

  //Store the centerpoint
  vertexData.push(x_pos);
  vertexData.push(y_pos);

  //Calculate the outer vertices. To complete the
  //shape, TRIANGLE_FAN must return to the first
  //vertex. Therefore, this loop runs for [vertices+1]
  //iterations, calculating the same values for the
  //first and last vertices
  for(var i=0; i<7; i++){

    //Angle offset between points
    point = i * Math.PI / 3;

    //Set x- and y-coordinate for point.
    y_pos = Math.sin(point);
    x_pos = Math.cos(point);

    //Store the vertices
    vertexData.push(x_pos);
    vertexData.push(y_pos);
  }

  var vertices = new Float32Array(vertexData);

  //Creat a buffer object for vertices
  var vertexBuffer = gl.createBuffer();
  if(!vertexBuffer) {
    console.log('Failed to create buffer object');
    return;
  }

  //Bind the buffer object to target
  gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
  //Write data into the buffer object
  gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STATIC_DRAW);

  var a_Position = gl.getAttribLocation(gl.program, 'a_Position');
  if(a_Position < 0){
    console.log('Failed to get the storage location of a_Position');
    return;
  }

  //Assign the buffer object to a_Position
  gl.vertexAttribPointer(a_Position, 2, gl.FLOAT, false, 0,0);
  //Enable the assignmetn to a_Position variable
  gl.enableVertexAttribArray(a_Position);

  var colors = new Float32Array(colorData);

  //Creat a buffer object for colors
  var colorBuffer = gl.createBuffer();
  if(!colorBuffer) {
    console.log('Failed to create buffer object');
    return;
  }

  //Bind the buffer object to target
  gl.bindBuffer(gl.ARRAY_BUFFER, colorBuffer);
  //Write data into the buffer object
  gl.bufferData(gl.ARRAY_BUFFER, colors, gl.STATIC_DRAW);

  var a_Color = gl.getAttribLocation(gl.program, 'a_Color');
  if(a_Color < 0){
    console.log('Failed to get the storage location of a_Color');
    return;
  }

  //Assign the buffer object to a_Color
  gl.vertexAttribPointer(a_Color, 4, gl.FLOAT, false, 0,0);
  //Enable the assignmetn to a_Color variable
  gl.enableVertexAttribArray(a_Color);

  // Animation frame
  requestAnimationFrame(rotatePoints);

  function rotatePoints(clock){
    // scale the time step
    clock *= 0.1;

    // Convert time to rotation angle
    var radian = degToRad(clock % 360);

    // The sin and cos values of a time
    // dependent angle wil be combined with
    // the x- and y-coordinate values of the
    // shape vertices through various matrix
    // transformations
    var cB = Math.cos(radian);
    var sB = Math.sin(radian);

    // The rotation matrix will make the
    // outter vertices rotate around the
    // shape's centerpoint
    // Matrix for no rotation
    if(!rotation){
      var rotateMatrix = new Float32Array([
          1.0,  0.0,  0.0,  0.0,
          0.0,  1.0,  0.0,  0.0,
          0.0,  0.0,  1.0,  0.0,
          0.0,  0.0,  0.0,  1.0
      ]);
    }
    else{
    //Matrix for active rotation
      var rotateMatrix = new Float32Array([
          cB,   -sB,  0.0,  0.0,
          sB,   cB,   0.0,  0.0,
          0.0,  0.0,  1.0,  0.0,
          0.0,  0.0,  0.0,  1.0
      ]); 
    }

    // Pass the rotation matrix to the vertex shader
    var u_rotateMatrix = gl.getUniformLocation(gl.program, 'u_rotateMatrix');
    if (!u_rotateMatrix) {
      console.log('Failed to get the storage location of u_rotateMatrix');
      return;
    }
    gl.uniformMatrix4fv(u_rotateMatrix, false, rotateMatrix);

    // The translation values will move the shape
    // around the canvas. +sin and +cos will move
    // the shape in a clockwise motion through time
    x_trans = cB / 3;
    y_trans = sB / 3;

    // Pass the translation distance to the vertex shader
    var u_Translation = gl.getUniformLocation(gl.program, 'u_Translation');
    if (!u_Translation) {
      console.log('Failed to get the storage location of u_Translation');
      return;
    }
    if(!translation){
      gl.uniform4f(u_Translation, 0.0, 0.0, 0.0, 0.0); //Vector for no translation
    }
    else{
      gl.uniform4f(u_Translation, x_trans, y_trans, 0.0, 0.0); //Vector for active translation
    }

    // The scale will grow or shrink the shape.
    // Using cos on a time dependant angle will
    // casue the behaviour oscillate between
    // growing and shrinking through time
    var Sc = 1/(2 + (Math.cos(radian * 4) / 3));

    //Matrix for static scaling
    if(!scaling){
      var scaleMatrix = new Float32Array([
          0.5,  0.0,  0.0,  0.0,
          0.0,  0.5,  0.0,  0.0,
          0.0,  0.0,  1.0,  0.0,
          0.0,  0.0,  0.0,  1.0
      ]);
    }
    //Matrix for active scaling
    else{
      var scaleMatrix = new Float32Array([
          Sc,   0.0,  0.0,  0.0,
          0.0,  Sc,   0.0,  0.0,
          0.0,  0.0,  1.0,  0.0,
          0.0,  0.0,  0.0,  1.0
      ]);
    }

    // Pass the scale matrix to the vertex shader
    var u_scaleMatrix = gl.getUniformLocation(gl.program, 'u_scaleMatrix');
    if (!u_scaleMatrix) {
      console.log('Failed to get the storage location of u_scaleMatrix');
      return;
    }
    gl.uniformMatrix4fv(u_scaleMatrix, false, scaleMatrix);

    if(!stable){
      bgRed = (cB + 1) / 2;
      bgGreen = (sB + 1) / 2;
      bgBlue = (cB * sB) + 0.5;
    }

    // Specify the color for clearing <canvas>
    gl.clearColor(bgRed, bgGreen, bgBlue, 1.0);

    // Clear canvas
    gl.clear(gl.COLOR_BUFFER_BIT);
    // Draw the shape
    gl.drawArrays(gl.TRIANGLE_FAN, 0, 8);

    requestAnimationFrame(rotatePoints);
  }
}

function degToRad(n){
  return n * Math.PI / 180;
}

function translationSwitch(){
  translation = !translation;
}

function rotationSwitch(){
  rotation = !rotation;
}

function scalingSwitch(){
  scaling = !scaling;
}

function stableSwitch(){
  stable = !stable;
}