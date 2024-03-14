"use strict";

var canvas;
var gl;
var program;
var index = 0;

var positionsArray = [];
var normalsArray = [];

var projectionMatrix;
var modelViewMatrix;


var rotationMatrix = mat4();

var dx = -9.2;
var dy = -2.0;
var dz = 0.0;
var theta_rot = [0.0, 0.0, 0.0];
var theta_leg = [0.0, -90.0, 90.0, 180.0, 180.0];

var dy_torso = -3.0;
var change = false;
var then = 0;
var animation_started = false;

var instanceMatrix;

var modelViewMatrixLoc;
var m;
var m_torso;

var vertices = [

    vec4( -0.5, -0.5,  0.5, 1.0 ),
    vec4( -0.5,  0.5,  0.5, 1.0 ),
    vec4( 0.5,  0.5,  0.5, 1.0 ),
    vec4( 0.5, -0.5,  0.5, 1.0 ),
    vec4( -0.5, -0.5, -0.5, 1.0 ),
    vec4( -0.5,  0.5, -0.5, 1.0 ),
    vec4( 0.5,  0.5, -0.5, 1.0 ),
    vec4( 0.5, -0.5, -0.5, 1.0 )
];

// Add tree:
var treeVertices = [
    vec4(0.0, 5.0, 0.0, 1.0), //P
    vec4(3.0, 0.0, 3.0, 1.0), //A
    vec4(3.0, 0.0, -3.0, 1.0), //A'
    vec4(-3.0, 0.0, 3.0, 1.0), //B'
    vec4(-3.0, 0.0, -3.0, 1.0), //B
    
    vec4(0.0, 0.0, 0.0, 1.0),
    vec4(6.0, 0.0, 6.0, 1.0),
    vec4(6.0, 0.0, -6.0, 1.0),
    vec4(-6.0, 0.0, 6.0, 1.0),
    vec4(-6.0, 0.0, -6.0, 1.0)
];

var torsoId = 0;
var headId  = 1;
var head1Id = 1;
var head2Id = 10;
var leftUpperArmId = 2;
var leftLowerArmId = 3;
var rightUpperArmId = 4;
var rightLowerArmId = 5;
var leftUpperLegId = 6;
var leftLowerLegId = 7;
var rightUpperLegId = 8;
var rightLowerLegId = 9;
var tailId = 11; // tail added


var torsoHeight = 5.0;
var torsoWidth = 2.0;
var upperArmHeight = 2.0;
var lowerArmHeight = 1.5;
var upperArmWidth  = 1.0;
var lowerArmWidth  = 1.0;
var upperLegWidth  = 1.0;
var lowerLegWidth  = 1.0;
var lowerLegHeight = 1.5;
var upperLegHeight = 2.0;
var headHeight = 2.0;
var headWidth = 1.5;
// tail dimensions:
var tailHeight = 0.8;
var tailWidth = 0.8; 

var numNodes = 12;
var numAngles = 12;
var angle = 0;

var theta = [120, -30, 110, 20, 70, -20, 110, 20, 70, 20, 0, -90];

var stack = [];

var figure = [];

for( var i=0; i<numNodes; i++) figure[i] = createNode(null, null, null, null);

var vBuffer;
var modelViewLoc;

var pointsArray = [];

//Texture:
var image, image2, image3, image4;
var texture;
var texture2;
var texture3;
var texture4;
var texSize = 256;
var texCoordsArray = [];
var texCoord = [
    vec2(0, 0),
    vec2(1, 0),
    vec2(0, 1),
    vec2(1, 1)];

function configureTexture(image1, image2, image3, image4) {
    texture = gl.createTexture();
    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, texture);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGB,
        gl.RGB, gl.UNSIGNED_BYTE, image1);
    gl.generateMipmap(gl.TEXTURE_2D);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER,
                      gl.NEAREST_MIPMAP_LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
    gl.uniform1i(gl.getUniformLocation(program, "uTextureMap1"), 0);
    
    texture2 = gl.createTexture();
    gl.activeTexture(gl.TEXTURE1);
    gl.bindTexture(gl.TEXTURE_2D, texture2);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGB,
        gl.RGB, gl.UNSIGNED_BYTE, image2);
    gl.generateMipmap(gl.TEXTURE_2D);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER,
                      gl.NEAREST_MIPMAP_LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
    gl.uniform1i(gl.getUniformLocation(program, "uTextureMap2"), 1);
    
    texture3 = gl.createTexture();
    gl.activeTexture(gl.TEXTURE2);
    gl.bindTexture(gl.TEXTURE_2D, texture3);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGB,
        gl.RGB, gl.UNSIGNED_BYTE, image3);
    gl.generateMipmap(gl.TEXTURE_2D);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER,
                      gl.NEAREST_MIPMAP_LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
    gl.uniform1i(gl.getUniformLocation(program, "uTextureMap3"), 2);
    
    texture4 = gl.createTexture();
    gl.activeTexture(gl.TEXTURE3);
    gl.bindTexture(gl.TEXTURE_2D, texture4);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGB,
        gl.RGB, gl.UNSIGNED_BYTE, image4);
    gl.generateMipmap(gl.TEXTURE_2D);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER,
                      gl.NEAREST_MIPMAP_LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
    gl.uniform1i(gl.getUniformLocation(program, "uTextureMap4"), 3);
}



//-------------------------------------------

function scale4(a, b, c) {
   var result = mat4();
   result[0] = a;
   result[5] = b;
   result[10] = c;
   return result;
}

//--------------------------------------------


function createNode(transform, render, sibling, child){
    var node = {
    transform: transform,
    render: render,
    sibling: sibling,
    child: child,
    }
    return node;
}


function initNodes(Id) {

    var m = mat4();

    switch(Id) {

    case torsoId:

    m = mult(m_torso, rotate(theta[torsoId], vec3(0.8, 0.8, 0.9) ));
    figure[torsoId] = createNode( m, torso, null, headId );
    break;

    case headId:
    case head1Id:
    case head2Id:


    m = translate(0.0, torsoHeight+0.5*headHeight, 0.0);
	  m = mult(m, rotate(theta[head1Id], vec3(1, 0, 0)))
	  m = mult(m, rotate(theta[head2Id], vec3(0, 1, 0)));
    m = mult(m, translate(0.0, -0.5*headHeight, 0.0));
    figure[headId] = createNode( m, head, leftUpperArmId, null);
    break;


    case leftUpperArmId:

    m = translate(-(torsoWidth+upperArmWidth), 0.9*torsoHeight, 0.0);
	  m = mult(m, rotate(theta[leftUpperArmId], vec3(1, 0, 0)));
    figure[leftUpperArmId] = createNode( m, leftUpperArm, rightUpperArmId, leftLowerArmId );
    break;

    case rightUpperArmId:

    m = translate(torsoWidth+upperArmWidth, 0.9*torsoHeight, 0.0);
	  m = mult(m, rotate(theta[rightUpperArmId], vec3(1, 0, 0)));
    figure[rightUpperArmId] = createNode( m, rightUpperArm, leftUpperLegId, rightLowerArmId );
    break;

    case leftUpperLegId:

    m = translate(-(torsoWidth+upperLegWidth), 0.1*upperLegHeight, 0.0);
	  m = mult(m , rotate(theta[leftUpperLegId], vec3(1, 0, 0)));
    figure[leftUpperLegId] = createNode( m, leftUpperLeg, rightUpperLegId, leftLowerLegId );
    break;

    case rightUpperLegId:

    m = translate(torsoWidth+upperLegWidth, 0.1*upperLegHeight, 0.0);
	  m = mult(m, rotate(theta[rightUpperLegId], vec3(1, 0, 0)));
    figure[rightUpperLegId] = createNode( m, rightUpperLeg, tailId, rightLowerLegId );
    break;

    case leftLowerArmId:

    m = translate(0.0, upperArmHeight, 0.0);
    m = mult(m, rotate(theta[leftLowerArmId], vec3(1, 0, 0)));
    figure[leftLowerArmId] = createNode( m, leftLowerArm, null, null );
    break;

    case rightLowerArmId:

    m = translate(0.0, upperArmHeight, 0.0);
    m = mult(m, rotate(theta[rightLowerArmId], vec3(1, 0, 0)));
    figure[rightLowerArmId] = createNode( m, rightLowerArm, null, null );
    break;

    case leftLowerLegId:

    m = translate(0.0, upperLegHeight, 0.0);
    m = mult(m, rotate(theta[leftLowerLegId],vec3(1, 0, 0)));
    figure[leftLowerLegId] = createNode( m, leftLowerLeg, null, null );
    break;

    case rightLowerLegId:

    m = translate(0.0, upperLegHeight, 0.0);
    m = mult(m, rotate(theta[rightLowerLegId], vec3(1, 0, 0)));
    figure[rightLowerLegId] = createNode( m, rightLowerLeg, null, null );
    break;
    
    // create node for the tail:
    case tailId:
    
    m = translate((-0.5*torsoWidth+upperLegWidth), 0.0, 0.5*torsoWidth-0.5*tailHeight);
    m = mult(m, rotate(theta[tailId], vec3(1, 0, 0)));
    figure[tailId] = createNode(m, tail, null, null);
    break;

    }

}

function traverse(Id) {

   if(Id == null) return;
   stack.push(modelViewMatrix);
   modelViewMatrix = mult(modelViewMatrix, figure[Id].transform);
   figure[Id].render();
   if(figure[Id].child != null) traverse(figure[Id].child);
    modelViewMatrix = stack.pop();
   if(figure[Id].sibling != null) traverse(figure[Id].sibling);
}

function torso() {

    instanceMatrix = mult(modelViewMatrix, translate(0.0, 0.5*torsoHeight, 0.0) );
    instanceMatrix = mult(instanceMatrix, scale( torsoWidth, torsoHeight, torsoWidth));
    gl.uniformMatrix4fv(modelViewMatrixLoc, false, flatten(instanceMatrix) );
    gl.uniform1i( gl.getUniformLocation(program, "textBody"), true);
    gl.uniform1i( gl.getUniformLocation(program, "textLeaf"), false);
    gl.uniform1i( gl.getUniformLocation(program, "textLog"), false);
    for(var i =0; i<6; i++) gl.drawArrays(gl.TRIANGLE_FAN, 4*i, 4);
}

function head() {

    instanceMatrix = mult(modelViewMatrix, translate(0.0, 0.5 * headHeight, 0.0 ));
	  instanceMatrix = mult(instanceMatrix, scale(headWidth, headHeight, headWidth) );
    gl.uniformMatrix4fv(modelViewMatrixLoc, false, flatten(instanceMatrix) );
    gl.uniform1i( gl.getUniformLocation(program, "textBody"), false);
    gl.uniform1i( gl.getUniformLocation(program, "textLeaf"), false);
    gl.uniform1i( gl.getUniformLocation(program, "textLog"), false);
    for(var i =0; i<6; i++) gl.drawArrays(gl.TRIANGLE_FAN, 4*i, 4);
}

function leftUpperArm() {

    instanceMatrix = mult(modelViewMatrix, translate(0.0, 0.5 * upperArmHeight, 0.0) );
	  instanceMatrix = mult(instanceMatrix, scale(upperArmWidth, upperArmHeight, upperArmWidth) );
    gl.uniformMatrix4fv(modelViewMatrixLoc, false, flatten(instanceMatrix) );
    gl.uniform1i( gl.getUniformLocation(program, "textBody"), true);
    gl.uniform1i( gl.getUniformLocation(program, "textLeaf"), false);
    gl.uniform1i( gl.getUniformLocation(program, "textLog"), false);
    for(var i =0; i<6; i++) gl.drawArrays(gl.TRIANGLE_FAN, 4*i, 4);
}

function leftLowerArm() {

    instanceMatrix = mult(modelViewMatrix, translate(0.0, 0.5 * lowerArmHeight, 0.0) );
	  instanceMatrix = mult(instanceMatrix, scale(lowerArmWidth, lowerArmHeight, lowerArmWidth) );
    gl.uniformMatrix4fv(modelViewMatrixLoc, false, flatten(instanceMatrix) );
    gl.uniform1i( gl.getUniformLocation(program, "textBody"), true);
    gl.uniform1i( gl.getUniformLocation(program, "textLeaf"), false);
    gl.uniform1i( gl.getUniformLocation(program, "textLog"), false);
    for(var i =0; i<6; i++) gl.drawArrays(gl.TRIANGLE_FAN, 4*i, 4);
}

function rightUpperArm() {
    

    instanceMatrix = mult(modelViewMatrix, translate(0.0, 0.5 * upperArmHeight, 0.0) );
	  instanceMatrix = mult(instanceMatrix, scale(upperArmWidth, upperArmHeight, upperArmWidth) );
    gl.uniformMatrix4fv(modelViewMatrixLoc, false, flatten(instanceMatrix) ); 
    gl.uniform1i( gl.getUniformLocation(program, "textBody"), true);
    gl.uniform1i( gl.getUniformLocation(program, "textLeaf"), false);
    gl.uniform1i( gl.getUniformLocation(program, "textLog"), false);
    for(var i =0; i<6; i++) gl.drawArrays(gl.TRIANGLE_FAN, 4*i, 4);
}

function rightLowerArm() {

    instanceMatrix = mult(modelViewMatrix, translate(0.0, 0.5 * lowerArmHeight, 0.0) );
  	instanceMatrix = mult(instanceMatrix, scale(lowerArmWidth, lowerArmHeight, lowerArmWidth) );
    gl.uniformMatrix4fv(modelViewMatrixLoc, false, flatten(instanceMatrix) );
    gl.uniform1i( gl.getUniformLocation(program, "textBody"), true);
    gl.uniform1i( gl.getUniformLocation(program, "textLeaf"), false);
    gl.uniform1i( gl.getUniformLocation(program, "textLog"), false);
    for(var i =0; i<6; i++) gl.drawArrays(gl.TRIANGLE_FAN, 4*i, 4);
}

function  leftUpperLeg() {

    instanceMatrix = mult(modelViewMatrix, translate(0.0, 0.5 * upperLegHeight, 0.0) );
	  instanceMatrix = mult(instanceMatrix, scale(upperLegWidth, upperLegHeight, upperLegWidth) );
    gl.uniformMatrix4fv(modelViewMatrixLoc, false, flatten(instanceMatrix) );
    gl.uniform1i( gl.getUniformLocation(program, "textBody"), true);
    gl.uniform1i( gl.getUniformLocation(program, "textLeaf"), false);
    gl.uniform1i( gl.getUniformLocation(program, "textLog"), false);
    for(var i =0; i<6; i++) gl.drawArrays(gl.TRIANGLE_FAN, 4*i, 4);
}

function leftLowerLeg() {

    instanceMatrix = mult(modelViewMatrix, translate( 0.0, 0.5 * lowerLegHeight, 0.0) );
  	instanceMatrix = mult(instanceMatrix, scale(lowerLegWidth, lowerLegHeight, lowerLegWidth) );
    gl.uniformMatrix4fv(modelViewMatrixLoc, false, flatten(instanceMatrix) );
    gl.uniform1i( gl.getUniformLocation(program, "textBody"), true);
    gl.uniform1i( gl.getUniformLocation(program, "textLeaf"), false);
    gl.uniform1i( gl.getUniformLocation(program, "textLog"), false);
    for(var i =0; i<6; i++) gl.drawArrays(gl.TRIANGLE_FAN, 4*i, 4);
}

function rightUpperLeg() {

    instanceMatrix = mult(modelViewMatrix, translate(0.0, 0.5 * upperLegHeight, 0.0) );
  	instanceMatrix = mult(instanceMatrix, scale(upperLegWidth, upperLegHeight, upperLegWidth) );
    gl.uniformMatrix4fv(modelViewMatrixLoc, false, flatten(instanceMatrix) );
    gl.uniform1i( gl.getUniformLocation(program, "textBody"), true);
    gl.uniform1i( gl.getUniformLocation(program, "textLeaf"), false);
    gl.uniform1i( gl.getUniformLocation(program, "textLog"), false);
    for(var i =0; i<6; i++) gl.drawArrays(gl.TRIANGLE_FAN, 4*i, 4);
}

function rightLowerLeg() {

    instanceMatrix = mult(modelViewMatrix, translate(0.0, 0.5 * lowerLegHeight, 0.0) );
  	instanceMatrix = mult(instanceMatrix, scale(lowerLegWidth, lowerLegHeight, lowerLegWidth) )
    gl.uniformMatrix4fv(modelViewMatrixLoc, false, flatten(instanceMatrix) );
    gl.uniform1i( gl.getUniformLocation(program, "textBody"), true);
    gl.uniform1i( gl.getUniformLocation(program, "textLeaf"), false);
    gl.uniform1i( gl.getUniformLocation(program, "textLog"), false);
    for(var i =0; i<6; i++) gl.drawArrays(gl.TRIANGLE_FAN, 4*i, 4);
}

// tail fct:
function tail() {

    instanceMatrix = mult(modelViewMatrix, translate(0.0, 0.5 * tailHeight, 0.0) );
  	instanceMatrix = mult(instanceMatrix, scale(tailWidth, tailHeight, tailWidth) )
    gl.uniformMatrix4fv(modelViewMatrixLoc, false, flatten(instanceMatrix) );
    gl.uniform1i( gl.getUniformLocation(program, "textBody"), true);
    gl.uniform1i( gl.getUniformLocation(program, "textLeaf"), false);
    gl.uniform1i( gl.getUniformLocation(program, "textLog"), false);
    for(var i =0; i<6; i++) gl.drawArrays(gl.TRIANGLE_FAN, 4*i, 4);
}

function quad(a, b, c, d) {
     pointsArray.push(vertices[a]);
     texCoordsArray.push(texCoord[0]);
     
     pointsArray.push(vertices[b]);
     texCoordsArray.push(texCoord[1]);
     
     pointsArray.push(vertices[c]);
     texCoordsArray.push(texCoord[2]);
     
     pointsArray.push(vertices[d]);
     texCoordsArray.push(texCoord[3]);
}


function cube()
{
    quad( 1, 0, 3, 2 );
    quad( 2, 3, 7, 6 );
    quad( 3, 0, 4, 7 );
    quad( 6, 5, 1, 2 );
    quad( 4, 5, 6, 7 );
    quad( 5, 4, 0, 1 );
}

function triangle(va, vb, vc) {
    
     pointsArray.push(va)
     texCoordsArray.push(texCoord[0]);
     
     pointsArray.push(vb);
     texCoordsArray.push(texCoord[1]);
     
     pointsArray.push(vc);
     texCoordsArray.push(texCoord[2]);

     index += 3;
}

function pyramid(p, va, vb, vc, vd) {

     triangle(p, va, vb);
     triangle(vc, p, vb);
     triangle(p, vd, vc);
     triangle(p, va, vd);
     triangle(va, vb, vc);
     triangle(va, vc, vd)
}     
window.onload = function init() {

    canvas = document.getElementById( "gl-canvas" );

    gl = canvas.getContext('webgl2');
    if (!gl) { alert( "WebGL 2.0 isn't available" ); }

    gl.viewport( 0, 0, canvas.width, canvas.height );
    gl.clearColor( 1.0, 1.0, 1.0, 1.0 );

    //
    //  Load shaders and initialize attribute buffers
    //
    program = initShaders( gl, "vertex-shader", "fragment-shader");

    gl.useProgram( program);

    instanceMatrix = mat4();

    projectionMatrix = ortho(-10.0,10.0,-10.0, 10.0,-10.0,10.0);
    modelViewMatrix = mat4();
    
    // Initialize 
    m_torso = translate(dx, dy, dz);
    
    gl.uniformMatrix4fv(gl.getUniformLocation( program, "modelViewMatrix"), false, flatten(modelViewMatrix)  );
    gl.uniformMatrix4fv( gl.getUniformLocation( program, "projectionMatrix"), false, flatten(projectionMatrix)  );

    modelViewMatrixLoc = gl.getUniformLocation(program, "modelViewMatrix")
    

    cube();
    pyramid(treeVertices[0], treeVertices[1], treeVertices[2], treeVertices[3], treeVertices[4]);
    pyramid(treeVertices[5], treeVertices[6], treeVertices[7], treeVertices[8], treeVertices[9]);
    cube();
    
 
    vBuffer = gl.createBuffer();

    gl.bindBuffer( gl.ARRAY_BUFFER, vBuffer );
    gl.bufferData(gl.ARRAY_BUFFER, flatten(pointsArray), gl.STATIC_DRAW);

    var positionLoc = gl.getAttribLocation( program, "aPosition" );
    gl.vertexAttribPointer( positionLoc, 4, gl.FLOAT, false, 0, 0 );
    gl.enableVertexAttribArray( positionLoc );
    
    var tBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, tBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, flatten(texCoordsArray), gl.STATIC_DRAW);

    var texCoordLoc = gl.getAttribLocation(program, "aTexCoord");
    gl.vertexAttribPointer(texCoordLoc, 2, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(texCoordLoc);
    
    // Initialize a texture
          
    
    image = document.getElementById("BODYTEXTURE"); 
    image2 = document.getElementById("HEADTEXTURE");  
    image3 = document.getElementById("LEAFTEXTURE");
    image4 = document.getElementById("LOGTEXTURE");
    configureTexture(image, image2, image3, image4);

        document.getElementById("slider0").onchange = function(event) {
        theta[torsoId ] = event.target.value;
        initNodes(torsoId);
    };
        document.getElementById("slider1").onchange = function(event) {
        theta[head1Id] = event.target.value;
        initNodes(head1Id);
    };

    document.getElementById("slider2").onchange = function(event) {
         theta[leftUpperArmId] = event.target.value;
         initNodes(leftUpperArmId);
    };
    document.getElementById("slider3").onchange = function(event) {
         theta[leftLowerArmId] =  event.target.value;
         initNodes(leftLowerArmId);
    };

        document.getElementById("slider4").onchange = function(event) {
        theta[rightUpperArmId] = event.target.value;
        initNodes(rightUpperArmId);
    };
    document.getElementById("slider5").onchange = function(event) {
         theta[rightLowerArmId] =  event.target.value;
         initNodes(rightLowerArmId);
    };
        document.getElementById("slider6").onchange = function(event) {
        theta[leftUpperLegId] = event.target.value;
        initNodes(leftUpperLegId);
    };
    document.getElementById("slider7").onchange = function(event) {
         theta[leftLowerLegId] = event.target.value;
         initNodes(leftLowerLegId);
    };
    document.getElementById("slider8").onchange = function(event) {
         theta[rightUpperLegId] =  event.target.value;
         initNodes(rightUpperLegId);
    };
        document.getElementById("slider9").onchange = function(event) {
        theta[rightLowerLegId] = event.target.value;
        initNodes(rightLowerLegId);
    };
    document.getElementById("slider10").onchange = function(event) {
         theta[head2Id] = event.target.value;
         initNodes(head2Id);
    };
    
    document.getElementById("StartAnimation").onclick = function() {
        change = true;
   };
    for(i=0; i<numNodes; i++) initNodes(i);

    render();
}


var render = function(now) {
        if (change == true && !animation_started) {
          then = 0.001 * now;
          animation_started = true;
        }
        gl.clear( gl.COLOR_BUFFER_BIT );
        traverse(torsoId);
        instanceMatrix = mult(modelViewMatrix, translate(0.8, 7.0, 3.0) );
	      instanceMatrix = mult(instanceMatrix, scale(0.6, 0.6, 0.6) )
        gl.uniformMatrix4fv(modelViewMatrixLoc, false, flatten(instanceMatrix) );
        gl.uniform1i( gl.getUniformLocation(program, "textBody"), false);
        gl.uniform1i( gl.getUniformLocation(program, "textLeaf"), true);
        gl.uniform1i( gl.getUniformLocation(program, "textLog"), false);
       
        for( var i=0; i<index; i+=3)
          gl.drawArrays(gl.TRIANGLES, 24+i, 3);
        instanceMatrix = mult(modelViewMatrix, translate(0.8, 4.0, 3.0) );
	      instanceMatrix = mult(instanceMatrix, scale(1.0, 1.0, 1.0) )
        gl.uniformMatrix4fv(modelViewMatrixLoc, false, flatten(instanceMatrix) );
        gl.uniform1i( gl.getUniformLocation(program, "textBody"), false);
        gl.uniform1i( gl.getUniformLocation(program, "textLeaf"), true);
        gl.uniform1i( gl.getUniformLocation(program, "textLog"), false);
       
        for( var i=0; i<index; i+=3)
          gl.drawArrays(gl.TRIANGLES, 24+i, 3);
        instanceMatrix = mult(modelViewMatrix, translate(0.8, -1.4, 1.5) );
	      instanceMatrix = mult(instanceMatrix, scale(1.0, 11.0, 1.0) )
        gl.uniformMatrix4fv(modelViewMatrixLoc, false, flatten(instanceMatrix) );
        gl.uniform1i( gl.getUniformLocation(program, "textBody"), false);
        gl.uniform1i( gl.getUniformLocation(program, "textLeaf"), false);
        gl.uniform1i( gl.getUniformLocation(program, "textLog"), true);
      
        for(var i =0; i<6; i++) gl.drawArrays(gl.TRIANGLE_FAN, 4*i, 4);
        requestAnimationFrame(render);
        
       
        
        now *= 0.001; // convert to sec
        var deltaTime = now - then;
        if (change == true) {
           if ( deltaTime < 2.0 && dx < 2.0) {
		        dx = -9.2 +6.1*deltaTime;
		        dy = -2 -0.75*deltaTime;
		        figure[torsoId].transform = mult(translate(dx, dy, dz), rotate(theta[torsoId], vec3(0.8, 0.8, 0.9) ));
		        if (deltaTime <= 0.5) {

		          theta[rightUpperLegId] = 70 + 120*deltaTime; //increase 60°
		          theta[rightLowerLegId] = 20 - 120*deltaTime;
		          figure[rightUpperLegId].transform = rotate(theta[rightUpperLegId], vec3(1.0, 0.0, 0.0));
		          figure[rightLowerLegId].transform = mult(translate(0.0, upperLegHeight, 0.0), rotate(theta[rightLowerLegId], vec3(1.0, 0.0, 0.0)));
		          theta[leftUpperLegId] = 110 - 120*deltaTime;
		          theta[leftLowerLegId] = -20 + 120*deltaTime;
		          figure[leftUpperLegId].transform = rotate(theta[leftUpperLegId], vec3(1.0, 0.0, 0.0));
		          figure[leftLowerLegId].transform = mult(translate(0.0, upperLegHeight, 0.0), rotate(theta[leftLowerLegId], vec3(1.0, 0.0, 0.0)));
		          theta[rightUpperArmId] = 70 + 120*deltaTime;
		          theta[rightLowerArmId] = 20 - 120*deltaTime;
		          figure[rightUpperArmId].transform = mult(translate(0.75*torsoWidth, 0.90*torsoHeight, 0.0), rotate(theta[rightUpperArmId], vec3(1.0, 0.0, 0.0)));
		         figure[rightLowerArmId].transform = mult(translate(0.0, upperArmHeight, 0.0), rotate(theta[rightLowerArmId], vec3(1.0, 0.0, 0.0)));
		         theta[leftUpperArmId] = 110 - 120*deltaTime;
		         theta[leftLowerArmId] = -20 + 120*deltaTime;
		         figure[leftUpperArmId].transform = mult(translate(-0.75*torsoWidth, 0.90*torsoHeight, 0.0), rotate(theta[leftUpperArmId], vec3(1.0, 0.0, 0.0)));
		         figure[leftLowerArmId].transform = mult(translate(0.0, upperArmHeight, 0.0), rotate(theta[leftLowerArmId], vec3(1.0, 0.0, 0.0)));
		        }
		        if (deltaTime > 0.5 && deltaTime < 1.0) {
		        
		          theta[rightUpperLegId] = 130 - 120*(deltaTime - 0.5);
		          theta[rightLowerLegId] = -40 + 120*(deltaTime - 0.5);
		          figure[rightUpperLegId].transform = rotate(theta[rightUpperLegId], vec3(1.0, 0.0, 0.0));
		          figure[rightLowerLegId].transform = mult(translate(0.0, upperLegHeight, 0.0), rotate(theta[rightLowerLegId], vec3(1.0, 0.0, 0.0)));
		          theta[leftUpperLegId] = 50 + 120*(deltaTime - 0.5);
		          theta[leftLowerLegId] = 40 - 120*(deltaTime - 0.5);
		          figure[leftUpperLegId].transform = rotate(theta[leftUpperLegId], vec3(1.0, 0.0, 0.0));
		          figure[leftLowerLegId].transform = mult(translate(0.0, upperLegHeight, 0.0), rotate(theta[leftLowerLegId], vec3(1.0, 0.0, 0.0)));
		          theta[rightUpperArmId] = 130 - 120*(deltaTime - 0.5);
		          theta[rightLowerArmId] = -40 + 120*(deltaTime - 0.5);
		          figure[rightUpperArmId].transform = mult(translate(0.75*torsoWidth, 0.90*torsoHeight, 0.0), rotate(theta[rightUpperArmId], vec3(1.0, 0.0, 0.0)));
		          figure[rightLowerArmId].transform = mult(translate(0.0, upperArmHeight, 0.0), rotate(theta[rightLowerArmId], vec3(1.0, 0.0, 0.0)));
		          theta[leftUpperArmId] = 50 + 120*(deltaTime - 0.5);
		          theta[leftLowerArmId] = 40 - 120*(deltaTime - 0.5);
		          figure[leftUpperArmId].transform = mult(translate(-0.75*torsoWidth, 0.90*torsoHeight, 0.0), rotate(theta[leftUpperArmId], vec3(1.0, 0.0, 0.0)));
		          figure[leftLowerArmId].transform = mult(translate(0.0, upperArmHeight, 0.0), rotate(theta[leftLowerArmId], vec3(1.0, 0.0, 0.0)));
		        }
		        if (deltaTime >= 1.0 && deltaTime < 1.5) {
		          // slows down as approaching the tree:
		          theta[rightUpperLegId] = 70 + 80*(deltaTime - 1.0); //increase 40°
		          theta[rightLowerLegId] = 20 - 80*(deltaTime - 1.0);
		          figure[rightUpperLegId].transform = rotate(theta[rightUpperLegId], vec3(1.0, 0.0, 0.0));
		          figure[rightLowerLegId].transform = mult(translate(0.0, upperLegHeight, 0.0), rotate(theta[rightLowerLegId], vec3(1.0, 0.0, 0.0)));
		          theta[leftUpperLegId] = 110 - 80*(deltaTime - 1.0);
		          theta[leftLowerLegId] = -20 + 80*(deltaTime - 1.0);
		          figure[leftUpperLegId].transform = rotate(theta[leftUpperLegId], vec3(1.0, 0.0, 0.0));
		          figure[leftLowerLegId].transform = mult(translate(0.0, upperLegHeight, 0.0), rotate(theta[leftLowerLegId], vec3(1.0, 0.0, 0.0)));
		          theta[rightUpperArmId] = 70 + 80*(deltaTime - 1.0);
		          theta[rightLowerArmId] = 20 - 80*(deltaTime - 1.0);
		          figure[rightUpperArmId].transform = mult(translate(0.75*torsoWidth, 0.90*torsoHeight, 0.0), rotate(theta[rightUpperArmId], vec3(1.0, 0.0, 0.0)));
		         figure[rightLowerArmId].transform = mult(translate(0.0, upperArmHeight, 0.0), rotate(theta[rightLowerArmId], vec3(1.0, 0.0, 0.0)));
		         theta[leftUpperArmId] = 110 - 80*(deltaTime - 1.0);
		         theta[leftLowerArmId] = -20 + 80*(deltaTime - 1.0);
		         figure[leftUpperArmId].transform = mult(translate(-0.75*torsoWidth, 0.90*torsoHeight, 0.0), rotate(theta[leftUpperArmId], vec3(1.0, 0.0, 0.0)));
		         figure[leftLowerArmId].transform = mult(translate(0.0, upperArmHeight, 0.0), rotate(theta[leftLowerArmId], vec3(1.0, 0.0, 0.0)));
		        }
		         
		        if (deltaTime >= 1.5 && deltaTime < 2.0) {
		        
		         theta[rightUpperLegId] = 110 - 80*(deltaTime - 1.5);
		          theta[rightLowerLegId] = -20 + 80*(deltaTime - 1.5);
		          figure[rightUpperLegId].transform = rotate(theta[rightUpperLegId], vec3(1.0, 0.0, 0.0));
		          figure[rightLowerLegId].transform = mult(translate(0.0, upperLegHeight, 0.0), rotate(theta[rightLowerLegId], vec3(1.0, 0.0, 0.0)));
		          theta[leftUpperLegId] = 70 + 80*(deltaTime - 1.5);
		          theta[leftLowerLegId] = 20 - 80*(deltaTime - 1.5);
		          figure[leftUpperLegId].transform = rotate(theta[leftUpperLegId], vec3(1.0, 0.0, 0.0));
		          figure[leftLowerLegId].transform = mult(translate(0.0, upperLegHeight, 0.0), rotate(theta[leftLowerLegId], vec3(1.0, 0.0, 0.0)));
		          theta[rightUpperArmId] = 110 - 80*(deltaTime - 1.5);
		          theta[rightLowerArmId] = -20 + 80*(deltaTime - 1.5);
		          figure[rightUpperArmId].transform = mult(translate(0.75*torsoWidth, 0.90*torsoHeight, 0.0), rotate(theta[rightUpperArmId], vec3(1.0, 0.0, 0.0)));
		          figure[rightLowerArmId].transform = mult(translate(0.0, upperArmHeight, 0.0), rotate(theta[rightLowerArmId], vec3(1.0, 0.0, 0.0)));
		          theta[leftUpperArmId] = 70 + 80*(deltaTime - 1.5);
		          theta[leftLowerArmId] = 20 - 80*(deltaTime - 1.5);
		          figure[leftUpperArmId].transform = mult(translate(-0.75*torsoWidth, 0.90*torsoHeight, 0.0), rotate(theta[leftUpperArmId], vec3(1.0, 0.0, 0.0)));
		          figure[leftLowerArmId].transform = mult(translate(0.0, upperArmHeight, 0.0), rotate(theta[leftLowerArmId], vec3(1.0, 0.0, 0.0)));
		        }
		       
	        }
	  
	        if (deltaTime >= 2.0 && deltaTime < 3.3) {
	         // action: 1.3 sec:
	          theta[rightUpperArmId] = 110;
		        theta[rightLowerArmId] = -20;
		        figure[rightUpperArmId].transform = mult(translate(0.75*torsoWidth, 0.90*torsoHeight, 0.0), rotate(theta[rightUpperArmId], vec3(1.0, 0.0, 0.0)));
		        figure[rightLowerArmId].transform = mult(translate(0.0, upperArmHeight, 0.0), rotate(theta[rightLowerArmId], vec3(1.0, 0.0, 0.0)));
		        theta[leftUpperArmId] = 110;
		        theta[leftLowerArmId] = -20;
		        figure[leftUpperArmId].transform = mult(translate(-0.75*torsoWidth, 0.90*torsoHeight, 0.0), rotate(theta[leftUpperArmId], vec3(1.0, 0.0, 0.0)));
		        figure[leftLowerArmId].transform = mult(translate(0.0, upperArmHeight, 0.0), rotate(theta[leftLowerArmId], vec3(1.0, 0.0, 0.0)));
	          theta_rot[2] = 0.0 - 69*(deltaTime - 2.0); //rotate -90°
	          figure[torsoId].transform = mult(mult(translate(2.3, -3.0, 0.0), rotate(theta_rot[2], vec3(0.0, 0.0, 1.0))),  rotate(theta[torsoId], vec3(0.8, 0.8, 0.9) ));
	          theta_leg[1] = -90 - 69*(deltaTime - 2.0);
	          theta_leg[2] = 90 + 69*(deltaTime - 2.0);
	          figure[leftUpperLegId].transform = mult(rotate(theta_leg[1], vec3(-1.0, 0.0, 0.0)),  translate(-0.5 * upperLegHeight, 0.0, 0.0));
	          figure[rightUpperLegId].transform = mult(rotate(theta_leg[2], vec3(1.0, 0.0, 0.0)), translate(0.5 * upperLegHeight, 0.0, 0.0));
          }
          
           if (deltaTime >= 3.3 && deltaTime < 4.0) {
             // action: 0.7 sec:
             theta_leg[3] = 180 - 64.3*(deltaTime - 3.3); //rotates -45°
	           theta_leg[4] = 180 + 64.3*(deltaTime - 3.3); //rotates +45°
	           
	           dy_torso = -3.0 - (deltaTime - 3.3);
             figure[leftUpperLegId].transform = mult(rotate(theta_leg[3], vec3(1.0, 0.0, 0.0)),  translate(-0.5 * upperLegHeight, 0.0, 0.0));
	           figure[rightUpperLegId].transform = mult(rotate(theta_leg[4], vec3(-1.0, 0.0, 0.0)), translate(0.5 * upperLegHeight, 0.0, 0.0));
             figure[torsoId].transform = mult(mult(translate(2.3, dy_torso, 0.0), rotate(theta_rot[2], vec3(0.0, 0.0, 1.0))),  rotate(theta[torsoId], vec3(0.8, 0.8, 0.9) ));
             
          }
   
          if ( deltaTime >= 4.0 && deltaTime < 4.4 ) {
             // action: 0.4 sec:
             theta_leg[3] = 135 + 112.5*(deltaTime - 4.0);
	           theta_leg[4] = 225 - 112.5*(deltaTime - 4.0);
	           
	           dy_torso = -3.7 + 1.75*(deltaTime - 4.0);
             figure[leftUpperLegId].transform = mult(rotate(theta_leg[3], vec3(1.0, 0.0, 0.0)),  translate(-0.5 * upperLegHeight, 0.0, 0.0));
	           figure[rightUpperLegId].transform = mult(rotate(theta_leg[4], vec3(-1.0, 0.0, 0.0)), translate(0.5 * upperLegHeight, 0.0, 0.0));
             figure[torsoId].transform = mult(mult(translate(2.3, dy_torso, 0.0), rotate(theta_rot[2], vec3(0.0, 0.0, 1.0))),  rotate(theta[torsoId], vec3(0.8, 0.8, 0.9) ));
             
          } 
          
           if ( deltaTime >= 4.4 && deltaTime < 5.1 ) {
             // action: 0.7 sec:
             theta_leg[3] = 180 - 64.3*(deltaTime - 4.4);
	           theta_leg[4] = 180 + 64.3*(deltaTime - 4.4);
	           
	           dy_torso = -3.0 -(deltaTime - 4.4);
             figure[leftUpperLegId].transform = mult(rotate(theta_leg[3], vec3(1.0, 0.0, 0.0)),  translate(-0.5 * upperLegHeight, 0.0, 0.0));
	           figure[rightUpperLegId].transform = mult(rotate(theta_leg[4], vec3(-1.0, 0.0, 0.0)), translate(0.5 * upperLegHeight, 0.0, 0.0));
             figure[torsoId].transform = mult(mult(translate(2.3, dy_torso, 0.0), rotate(theta_rot[2], vec3(0.0, 0.0, 1.0))),  rotate(theta[torsoId], vec3(0.8, 0.8, 0.9) ));
             
          } 
          
          if ( deltaTime >= 5.1 && deltaTime < 5.6 ) {
             //action: 0.5 sec:
             theta_leg[3] = 135 + 90*(deltaTime - 5.1);
	           theta_leg[4] = 225 - 90*(deltaTime - 5.1);
	           
	           dy_torso = -3.7 + 1.4*(deltaTime - 5.1);
             figure[leftUpperLegId].transform = mult(rotate(theta_leg[3], vec3(1.0, 0.0, 0.0)),  translate(-0.5 * upperLegHeight, 0.0, 0.0));
	           figure[rightUpperLegId].transform = mult(rotate(theta_leg[4], vec3(-1.0, 0.0, 0.0)), translate(0.5 * upperLegHeight, 0.0, 0.0));
             figure[torsoId].transform = mult(mult(translate(2.3, dy_torso, 0.0), rotate(theta_rot[2], vec3(0.0, 0.0, 1.0))),  rotate(theta[torsoId], vec3(0.8, 0.8, 0.9) ));
             
          } 
                  
  }
}

