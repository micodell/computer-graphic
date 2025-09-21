function main() {
    // --- CANVAS AND WEBGL CONTEXT SETUP ---

    // Get the canvas element from the HTML document by its ID.
    var CANVAS = document.getElementById("myCanvas");

    // Set the canvas dimensions to match the browser window's size.
    CANVAS.width = window.innerWidth;
    CANVAS.height = window.innerHeight;

    // --- MOUSE AND KEYBOARD EVENT HANDLING ---

    var drag = false; // Flag to check if the mouse is being dragged.
    var x_prev, y_prev; // Stores the previous mouse coordinates.
    var dX = 0, dY = 0; // Stores the change in rotation angles.
    var THETA = 0, PHI = 0; // Rotation angles for the scene.
    var FRICTION = 0.15; // Damping factor to slow down rotation when not dragging.
    var SPEED = 0.05; // Rotation speed when using keyboard controls.

    // Function to handle the 'mousedown' event.
    var mouseDown = function (e) {
        drag = true;
        x_prev = e.pageX, y_prev = e.pageY; // Store the initial mouse position.
        e.preventDefault(); // Prevent default browser action (e.g., text selection).
        return false;
    };

    // Function to handle the 'mouseup' event.
    var mouseUp = function (e) {
        drag = false; // Stop dragging when the mouse button is released.
    };

    // Function to handle the 'mousemove' event.
    var mouseMove = function (e) {
        if (!drag) return false; // Only run if the mouse is being dragged.
        // Calculate the change in mouse position and convert it to rotation angles.
        dX = (e.pageX - x_prev) * 2 * Math.PI / CANVAS.width;
        dY = (e.pageY - y_prev) * 2 * Math.PI / CANVAS.height;
        THETA += dX; // Update the horizontal rotation angle.
        PHI += dY;   // Update the vertical rotation angle.
        x_prev = e.pageX, y_prev = e.pageY; // Store the new mouse position.
        e.preventDefault();
    };

    // Add the mouse event listeners to the canvas.
    CANVAS.addEventListener("mousedown", mouseDown, false);
    CANVAS.addEventListener("mouseup", mouseUp, false);
    CANVAS.addEventListener("mouseout", mouseUp, false); // Also stop dragging if the mouse leaves the canvas.
    CANVAS.addEventListener("mousemove", mouseMove, false);

    // Function to handle keyboard input for rotation.
    var keyDown = function (e) {
        if (e.key === 'w') { // Rotate up
            dY -= SPEED;
        } else if (e.key === 'a') { // Rotate left
            dX -= SPEED;
        } else if (e.key === 's') { // Rotate down
            dY += SPEED;
        } else if (e.key === 'd') { // Rotate right
            dX += SPEED;
        }
    }
    // Add the keydown event listener to the window.
    window.addEventListener("keydown", keyDown, false);


    // Initialize the WebGL rendering context.
    /** @type {WebGLRenderingContext} */
    var GL;
    try {
        // Get the WebGL context from the canvas, with antialiasing enabled.
        GL = CANVAS.getContext("webgl", {
            antialias: true
        });
    } catch (e) {
        alert("WebGL context cannot be initialized");
        return false;
    }

    // --- SHADERS ---

    var shader_vertex_source = `
        attribute vec3 position;
        attribute vec3 color;
        uniform mat4 Pmatrix, Vmatrix, Mmatrix;
        varying vec3 vColor;
        void main(void) {
            gl_Position = Pmatrix * Vmatrix * Mmatrix * vec4(position, 1.);
            vColor = color;
        }`;

    var shader_fragment_source = `
        precision mediump float;
        varying vec3 vColor;
        void main(void) {
            gl_FragColor = vec4(vColor, 1.);
        }`;

    // --- SHADER COMPILATION AND PROGRAM LINKING ---

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

    var SHADER_PROGRAM = GL.createProgram();
    GL.attachShader(SHADER_PROGRAM, shader_vertex);
    GL.attachShader(SHADER_PROGRAM, shader_fragment);
    GL.linkProgram(SHADER_PROGRAM);

    var _position = GL.getAttribLocation(SHADER_PROGRAM, "position");
    var _color = GL.getAttribLocation(SHADER_PROGRAM, "color");
    var _Pmatrix = GL.getUniformLocation(SHADER_PROGRAM, "Pmatrix");
    var _Vmatrix = GL.getUniformLocation(SHADER_PROGRAM, "Vmatrix");
    var _Mmatrix = GL.getUniformLocation(SHADER_PROGRAM, "Mmatrix");

    GL.enableVertexAttribArray(_position);
    GL.enableVertexAttribArray(_color);
    GL.useProgram(SHADER_PROGRAM);


    function generateSphere(a, b, c, stack, step) {
        var vertices = [];
        var faces = [];
        for (var i = 0; i <= stack; i++) {
            for (var j = 0; j <= step; j++) {
                var u = i / stack * Math.PI - (Math.PI / 2);
                var v = j / step * 2 * Math.PI - Math.PI;
                var x = a * Math.cos(v) * Math.cos(u);
                var y = b * Math.sin(u);
                var z = c * Math.sin(v) * Math.cos(u);
                vertices.push(x, y, z);
                vertices.push(...[x, y, z].map(val => val / 2 + 0.5));
            }
        }
        for (var i = 0; i < stack; i++) {
            for (var j = 0; j < step; j++) {
                var p1 = i * (step + 1) + j;
                var p2 = p1 + 1;
                var p3 = p1 + (step + 1);
                var p4 = p3 + 1;
                faces.push(p1, p2, p4);
                faces.push(p1, p4, p3);
            }
        }
        return {
            vertices,
            faces
        };
    }

    function generateEllipsoid(a, b, c, stack, step) {
        var vertices = [];
        var faces = [];
        for (var i = 0; i <= stack; i++) {
            for (var j = 0; j <= step; j++) {
                var u = i / stack * Math.PI - (Math.PI / 2);
                var v = j / step * 2 * Math.PI - Math.PI;
                var x = a * Math.cos(v) * Math.cos(u);
                var y = b * Math.sin(u);
                var z = c * Math.sin(v) * Math.cos(u);
                vertices.push(x, y, z);
                vertices.push(...[x, y, z].map(val => val / 2 + 0.5));
            }
        }
        for (var i = 0; i < stack; i++) {
            for (var j = 0; j < step; j++) {
                var p1 = i * (step + 1) + j;
                var p2 = p1 + 1;
                var p3 = p1 + (step + 1);
                var p4 = p3 + 1;
                faces.push(p1, p2, p4);
                faces.push(p1, p4, p3);
            }
        }
        return {
            vertices,
            faces
        };
    }

    function generateHyperboloidOneSheet(a, c, height, stack, step) {
        var vertices = [];
        var faces = [];
        for (var i = 0; i <= stack; i++) {
            var u = (i / stack) * height - (height / 2); // Ketinggian dari -h/2 ke h/2
            for (var j = 0; j <= step; j++) {
                var v = (j / step) * 2 * Math.PI; // Sudut putaran
                
                var radius = a * Math.sqrt(1 + (u*u)/(c*c));
                
                var y = radius * Math.cos(v);
                var z = radius * Math.sin(v);
                var x = u;
                
                vertices.push(x, y, z);
                vertices.push(...[x, y, z].map(val => val / 2 + 0.5));
            }
        }
        for (var i = 0; i < stack; i++) {
            for (var j = 0; j < step; j++) {
                var p1 = i * (step + 1) + j, p2 = p1 + 1, p3 = p1 + (step + 1), p4 = p3 + 1;
                faces.push(p1, p2, p4); faces.push(p1, p4, p3);
            }
        }
        return { vertices, faces };
    }

    function generateBSpline3D(controlPoints, m, degree) {
        var curves = [];
        var knotVector = []
        var n = controlPoints.length; // changed

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


        for (var t_step = 0; t_step <= m; t_step++) {
            var x = 0;
            var y = 0;
            var z = 0;
            var u = (t_step / m * (knotVector[n] - knotVector[degree])) + knotVector[degree];

            if (t_step === m) {
                u = knotVector[n];
            }

            //C(t)
            for (var key = 0; key < n; key++) {
                var C = basisFunc(key, degree, u);
                x += (controlPoints[key][0] * C);
                y += (controlPoints[key][1] * C);
                z += (controlPoints[key][2] * C);
            }
            curves.push(x);
            curves.push(y);
            curves.push(z);
        }
        return curves;
    }

    function generateSplineTube(controlPoints, pathSegments, tubeRadius, tubeSegments) {
        var vertices = [];
        var faces = [];
        
        // 1. Dapatkan titik-titik jalur spline
        var pathPointsRaw = generateBSpline3D(controlPoints, pathSegments, 2);
        var pathPoints = [];
        for(var i=0; i < pathPointsRaw.length; i+=3) {
            pathPoints.push([pathPointsRaw[i], pathPointsRaw[i+1], pathPointsRaw[i+2]]);
        }

        // 2. Buat vertex untuk setiap segmen pipa
        var up = [0, 1, 0]; // Vektor "atas" acuan awal

        for (var i = 0; i < pathPoints.length; i++) {
            var p = pathPoints[i];

            // Hitung frame (tangent, normal, binormal) di setiap titik
            var tangent, normal, binormal;

            if (i === 0) { // Titik pertama
                tangent = [pathPoints[1][0] - p[0], pathPoints[1][1] - p[1], pathPoints[1][2] - p[2]];
            } else if (i === pathPoints.length - 1) { // Titik terakhir
                tangent = [p[0] - pathPoints[i-1][0], p[1] - pathPoints[i-1][1], p[2] - pathPoints[i-1][2]];
            } else { // Titik di tengah
                tangent = [pathPoints[i+1][0] - pathPoints[i-1][0], pathPoints[i+1][1] - pathPoints[i-1][1], pathPoints[i+1][2] - pathPoints[i-1][2]];
            }
            
            // Normalisasi tangent
            var len = Math.sqrt(tangent[0]*tangent[0] + tangent[1]*tangent[1] + tangent[2]*tangent[2]);
            tangent = [tangent[0]/len, tangent[1]/len, tangent[2]/len];
            
            // Hitung binormal
            binormal = [tangent[1]*up[2] - tangent[2]*up[1], tangent[2]*up[0] - tangent[0]*up[2], tangent[0]*up[1] - tangent[1]*up[0]];
            len = Math.sqrt(binormal[0]*binormal[0] + binormal[1]*binormal[1] + binormal[2]*binormal[2]);
            binormal = [binormal[0]/len, binormal[1]/len, binormal[2]/len];

            // Hitung normal
            normal = [binormal[1]*tangent[2] - binormal[2]*tangent[1], binormal[2]*tangent[0] - binormal[0]*tangent[2], binormal[0]*tangent[1] - binormal[1]*tangent[0]];

            // Buat lingkaran vertex di sekitar titik jalur
            for (var j = 0; j <= tubeSegments; j++) {
                var angle = (j / tubeSegments) * 2 * Math.PI;
                var cos = Math.cos(angle);
                var sin = Math.sin(angle);

                var vx = p[0] + tubeRadius * (cos * normal[0] + sin * binormal[0]);
                var vy = p[1] + tubeRadius * (cos * normal[1] + sin * binormal[1]);
                var vz = p[2] + tubeRadius * (cos * normal[2] + sin * binormal[2]);
                vertices.push(vx, vy, vz);

                // Tambahkan data warna
                vertices.push(...[vx,vy,vz].map(val => val/2 + 0.5));
            }
        }

        // 3. Buat faces yang menghubungkan lingkaran-lingkaran vertex
        for (var i = 0; i < pathSegments; i++) {
            for (var j = 0; j < tubeSegments; j++) {
                var p1 = i * (tubeSegments + 1) + j;
                var p2 = p1 + 1;
                var p3 = (i + 1) * (tubeSegments + 1) + j;
                var p4 = p3 + 1;
                faces.push(p1, p2, p4);
                faces.push(p1, p4, p3);
            }
        }

        return { vertices: vertices, faces: faces };
    }

    // --- CREATE GEOMETRY DATA ---
    var sphere = generateSphere(0.5, 0.5, 0.5, 100, 100);
    var sphere_vertex = sphere.vertices;
    var sphere_faces = sphere.faces;

    // var ellipsoid = generateEllipsoid(0.5, 0.8, 0.5, 100, 100);
    // var ellipsoid_vertex = ellipsoid.vertices;
    // var ellipsoid_faces = ellipsoid.faces;
    
    var hyperboloid_geo = generateHyperboloidOneSheet(0.3, 0.28, 1.2, 100, 100);
    var hyperboloid_vertex = hyperboloid_geo.vertices;
    var hyperboloid_faces = hyperboloid_geo.faces;

    var controlPoints = [
        [-1.0, -1.0, 0],
        [-1.0, 1.0, -1.0],
        [1.0, 1.0, 1.0],
        [1.0, -1.0, -1.0],
        [-0.1, -1.0, 1.5],
        [0, -0.2, 0.5]
    ];
    var spline3D = generateSplineTube(controlPoints, 100, 0.1, 100);
    var spline3D_vertex = spline3D.vertices;
    var spline3D_faces = spline3D.faces;

    // --- BUFFERS (SENDING GEOMETRY TO GPU) ---

    // Create buffers for the Sphere
    var SPHERE_VERTEX = GL.createBuffer();
    GL.bindBuffer(GL.ARRAY_BUFFER, SPHERE_VERTEX);
    GL.bufferData(GL.ARRAY_BUFFER, new Float32Array(sphere_vertex), GL.STATIC_DRAW);

    var SPHERE_FACES = GL.createBuffer();
    GL.bindBuffer(GL.ELEMENT_ARRAY_BUFFER, SPHERE_FACES);
    GL.bufferData(GL.ELEMENT_ARRAY_BUFFER, new Uint16Array(sphere_faces), GL.STATIC_DRAW);
    
    // Create buffers for the Ellipsoid
    // var ELLIPSOID_VERTEX = GL.createBuffer();
    // GL.bindBuffer(GL.ARRAY_BUFFER, ELLIPSOID_VERTEX);
    // GL.bufferData(GL.ARRAY_BUFFER, new Float32Array(ellipsoid_vertex), GL.STATIC_DRAW);

    // var ELLIPSOID_FACES = GL.createBuffer();
    // GL.bindBuffer(GL.ELEMENT_ARRAY_BUFFER, ELLIPSOID_FACES);
    // GL.bufferData(GL.ELEMENT_ARRAY_BUFFER, new Uint16Array(ellipsoid_faces), GL.STATIC_DRAW);

    // Create buffers for the Hyperboloid of One Sheet
    var HYPERBOLOID_VERTEX = GL.createBuffer(); 
    GL.bindBuffer(GL.ARRAY_BUFFER, HYPERBOLOID_VERTEX); 
    GL.bufferData(GL.ARRAY_BUFFER, new Float32Array(hyperboloid_vertex), GL.STATIC_DRAW);

    var HYPERBOLOID_FACES = GL.createBuffer(); 
    GL.bindBuffer(GL.ELEMENT_ARRAY_BUFFER, HYPERBOLOID_FACES); 
    GL.bufferData(GL.ELEMENT_ARRAY_BUFFER, new Uint16Array(hyperboloid_faces), GL.STATIC_DRAW);

    // Create a Vertex Buffer Object (VBO) for the spline.
    var SPLINE3D_VERTEX = GL.createBuffer();
    GL.bindBuffer(GL.ARRAY_BUFFER, SPLINE3D_VERTEX);
    GL.bufferData(GL.ARRAY_BUFFER, new Float32Array(spline3D_vertex), GL.STATIC_DRAW);

    var SPLINE3D_FACES = GL.createBuffer();
    GL.bindBuffer(GL.ELEMENT_ARRAY_BUFFER, SPLINE3D_FACES);
    GL.bufferData(GL.ELEMENT_ARRAY_BUFFER, new Uint16Array(spline3D_faces), GL.STATIC_DRAW);


    // --- MATRICES AND CAMERA SETUP ---
    var PROJMATRIX = LIBS.get_projection(40, CANVAS.width / CANVAS.height, 1, 100);
    var MOVEMATRIX = LIBS.get_I4();
    var VIEWMATRIX = LIBS.get_I4();

    LIBS.translateZ(VIEWMATRIX, -5);

    // --- WEBGL STATE AND RENDER LOOP ---
    GL.enable(GL.DEPTH_TEST);
    GL.depthFunc(GL.LEQUAL);
    GL.clearColor(0.0, 0.0, 0.0, 0.0);
    GL.clearDepth(1.0);

    var time_prev = 0;
    var animate = function (time) {
        GL.viewport(0, 0, CANVAS.width, CANVAS.height);
        GL.clear(GL.COLOR_BUFFER_BIT | GL.DEPTH_BUFFER_BIT);

        var dt = time - time_prev;
        time_prev = time;

        if (!drag) {
            dX *= (1 - FRICTION);
            dY *= (1 - FRICTION);
            THETA += dX;
            PHI += dY;
        }

        LIBS.set_I4(MOVEMATRIX);
        LIBS.rotateY(MOVEMATRIX, THETA);
        LIBS.rotateX(MOVEMATRIX, PHI);

        GL.uniformMatrix4fv(_Pmatrix, false, PROJMATRIX);
        GL.uniformMatrix4fv(_Vmatrix, false, VIEWMATRIX);
        GL.uniformMatrix4fv(_Mmatrix, false, MOVEMATRIX);

        // --- DRAW THE OBJECTS ---

        // 1. Draw the Sphere
        GL.bindBuffer(GL.ARRAY_BUFFER, SPHERE_VERTEX);
        GL.vertexAttribPointer(_position, 3, GL.FLOAT, false, 4 * (3 + 3), 0);
        GL.vertexAttribPointer(_color, 3, GL.FLOAT, false, 4 * (3 + 3), 3 * 4);
        GL.bindBuffer(GL.ELEMENT_ARRAY_BUFFER, SPHERE_FACES);
        GL.drawElements(GL.TRIANGLES, sphere_faces.length, GL.UNSIGNED_SHORT, 0);

        // 2. Draw the Ellipsoid
        // GL.bindBuffer(GL.ARRAY_BUFFER, ELLIPSOID_VERTEX);
        // GL.vertexAttribPointer(_position, 3, GL.FLOAT, false, 4 * (3 + 3), 0);
        // GL.vertexAttribPointer(_color, 3, GL.FLOAT, false, 4 * (3 + 3), 3 * 4);
        // GL.bindBuffer(GL.ELEMENT_ARRAY_BUFFER, ELLIPSOID_FACES);
        // GL.drawElements(GL.TRIANGLES, ellipsoid_faces.length, GL.UNSIGNED_SHORT, 0);

        // 3. Draw the 
        GL.bindBuffer(GL.ARRAY_BUFFER, HYPERBOLOID_VERTEX);
        GL.vertexAttribPointer(_position, 3, GL.FLOAT, false, 4 * (3 + 3), 0);
        GL.vertexAttribPointer(_color, 3, GL.FLOAT, false, 4 * (3 + 3), 3 * 4);
        GL.bindBuffer(GL.ELEMENT_ARRAY_BUFFER, HYPERBOLOID_FACES);
        GL.drawElements(GL.TRIANGLES, hyperboloid_faces.length, GL.UNSIGNED_SHORT, 0);

        // 3. Draw the 3D Spline
        GL.bindBuffer(GL.ARRAY_BUFFER, SPLINE3D_VERTEX);
        GL.vertexAttribPointer(_position, 3, GL.FLOAT, false, 4 * (3 + 3), 0);
        GL.vertexAttribPointer(_color, 3, GL.FLOAT, false, 4 * (3 + 3), 3 * 4);
        GL.bindBuffer(GL.ELEMENT_ARRAY_BUFFER, SPLINE3D_FACES);
        GL.drawElements(GL.TRIANGLES, spline3D_faces.length, GL.UNSIGNED_SHORT, 0);


        GL.flush();
        window.requestAnimationFrame(animate);
    };

    animate(0);
}

window.addEventListener('load', main);

