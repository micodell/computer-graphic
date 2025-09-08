
function main() {
    //GET CANVAS
    var CANVAS = document.getElementById("myCanvas");

    CANVAS.width = window.innerWidth;
    CANVAS.height = window.innerHeight;

    ///BSPLINE
    function generateBSpline(controlPoint, m, degree) {
        var curves = [];
        var knotVector = []


        var n = controlPoint.length / 2;


        // Calculate the knot values based on the degree and number of control points
        for (var i = 0; i < n + degree + 1; i++) {
            if (i < degree + 1) {
                knotVector.push(0);
            } else if (i >= n) {
                knotVector.push(n - degree);
            } else {
                knotVector.push(i - degree);
            }
        }


        var basisFunc = function (i, j, t) {
            if (j == 0) {
                if (knotVector[i] <= t && t < (knotVector[(i + 1)])) {
                    return 1;
                } else {
                    return 0;
                }
            }


            var den1 = knotVector[i + j] - knotVector[i];
            var den2 = knotVector[i + j + 1] - knotVector[i + 1];


            var term1 = 0;
            var term2 = 0;


            if (den1 != 0 && !isNaN(den1)) {
                term1 = ((t - knotVector[i]) / den1) * basisFunc(i, j - 1, t);
            }


            if (den2 != 0 && !isNaN(den2)) {
                term2 = ((knotVector[i + j + 1] - t) / den2) * basisFunc(i + 1, j - 1, t);
            }


            return term1 + term2;
        }


        for (var t = 0; t < m; t++) {
            var x = 0;
            var y = 0;


            var u = (t / m * (knotVector[controlPoint.length / 2] - knotVector[degree])) + knotVector[degree];


            //C(t)
            for (var key = 0; key < n; key++) {


                var C = basisFunc(key, degree, u);
                x += (controlPoint[key * 2] * C);
                y += (controlPoint[key * 2 + 1] * C);
            }
            curves.push(x);
            curves.push(y);


        }
        return curves;
    }

    function generateCubicBezier(controlPoints, numSegments) {
        var curvePoints = [];
        
        var p0x = controlPoints[0];
        var p0y = controlPoints[1];
        var p1x = controlPoints[2];
        var p1y = controlPoints[3];
        var p2x = controlPoints[4];
        var p2y = controlPoints[5];
        var p3x = controlPoints[6];
        var p3y = controlPoints[7];

        for (var i = 0; i <= numSegments; i++) {
            var t = i / numSegments;
            
            // Cubic Bézier formula: B(t) = (1-t)³P₀ + 3(1-t)²tP₁ + 3(1-t)t²P₂ + t³P₃
            var c0 = Math.pow(1 - t, 3);
            var c1 = 3 * Math.pow(1 - t, 2) * t;
            var c2 = 3 * (1 - t) * Math.pow(t, 2);
            var c3 = Math.pow(t, 3);

            var x = c0 * p0x + c1 * p1x + c2 * p2x + c3 * p3x;
            var y = c0 * p0y + c1 * p1y + c2 * p2y + c3 * p3y;
            
            curvePoints.push(x, y);
        }
        return curvePoints;
    }



    //INIT WEBGL
    /** @type {WebGLRenderingContext} */
    var GL;
    try {
        GL = CANVAS.getContext("webgl", { antialias: true });
    } catch (e) {
        alert("WebGL context cannot be initialized");
        return false;
    }

    //INIT SHADERS: berupa teks
    var shader_vertex_source = `
        attribute vec2 position;
 
        void main(void) {
            gl_Position = vec4(position, 0., 1.);
        }`;

    var shader_fragment_source = `
        precision mediump float;
        uniform vec3 uColor;
        void main(void) {
            gl_FragColor = vec4(uColor, 1.);
        }`;


    //SHADER COMPILER: menjadikan object
    var compile_shader = function (source, type, typeString) {
        var shader = GL.createShader(type);
        GL.shaderSource(shader, source);
        GL.compileShader(shader);
        if (!GL.getShaderParameter(shader, GL.COMPILE_STATUS)) {
            alert("ERROR IN " + typeString + " SHADER: " + GL.getShaderInfoLog(shader));
            return false;
        }
        return shader;
    };
    var shader_vertex = compile_shader(shader_vertex_source, GL.VERTEX_SHADER, "VERTEX");
    var shader_fragment = compile_shader(shader_fragment_source, GL.FRAGMENT_SHADER, "FRAGMENT");

    //PROGRAM SHADER: mengaktifkan shader
    var SHADER_PROGRAM = GL.createProgram();
    GL.attachShader(SHADER_PROGRAM, shader_vertex);
    GL.attachShader(SHADER_PROGRAM, shader_fragment);

    GL.linkProgram(SHADER_PROGRAM);

    var _position = GL.getAttribLocation(SHADER_PROGRAM, "position");

    GL.enableVertexAttribArray(_position);

    GL.useProgram(SHADER_PROGRAM);
    var uniform_color = GL.getUniformLocation(SHADER_PROGRAM, "uColor");

    // POINTS:
    var bSpline_controlPoint = [
        -1.0, -1.0,
        -1.0, 1.0,
        1.0, 1.0,
        1.0, -1.0
    ];

    var bezier_controlPoints = [
        -1.0, -1.0,
        -1.0, 1.0,
        1.0, 1.0,
        1.0, -1.0
    ];


    var bSpline_vertex = generateBSpline(bSpline_controlPoint, 20, 2);
    var curve_vertex = generateCubicBezier(bezier_controlPoints, 20);


    var SPLINE_VERTEX = GL.createBuffer();
    GL.bindBuffer(GL.ARRAY_BUFFER, SPLINE_VERTEX);
    GL.bufferData(GL.ARRAY_BUFFER,
        new Float32Array(bSpline_vertex),
        GL.STATIC_DRAW);

    var CURVE_VERTEX = GL.createBuffer();
    GL.bindBuffer(GL.ARRAY_BUFFER, CURVE_VERTEX);
    GL.bufferData(GL.ARRAY_BUFFER,
        new Float32Array(curve_vertex),
        GL.STATIC_DRAW);


    GL.clearColor(0.0, 0.0, 0.0, 0.0);

    var animate = function () {
        GL.viewport(0, 0, CANVAS.width, CANVAS.height);
        GL.clear(GL.COLOR_BUFFER_BIT);

       
        GL.bindBuffer(GL.ARRAY_BUFFER, CURVE_VERTEX);
       
        GL.vertexAttribPointer(_position, 2, GL.FLOAT, false, 4 * 2, 0);

        GL.uniform3f(uniform_color, 1, 0, 0);
        GL.drawArrays(GL.LINE_STRIP, 0, curve_vertex.length / 2);

        GL.flush();
        window.requestAnimationFrame(animate);
    };
    animate();
}
window.addEventListener('load', main);
