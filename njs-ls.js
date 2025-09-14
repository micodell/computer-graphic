function main() {
    var CANVAS = document.getElementById("myCanvas");
    CANVAS.width = window.innerWidth;
    CANVAS.height = window.innerHeight;

    // --- MOUSE AND KEYBOARD EVENT HANDLING ---
    var drag = false; // Flag to check if the mouse is being dragged.
    var x_prev, y_prev; // Stores the previous mouse coordinates.
    var dX = 0, dY = 0; // Stores the change in rotation angles.
    var THETA = 0, PHI = 0; // Rotation angles for the scene.
    var FRICTION = 0.15; // Damping factor to slow down rotation when not dragging.
    var SPEED = 0.05; // Rotation speed when using keyboard controls.

    var mouseDown = function (e) {
        drag = true;
        x_prev = e.pageX, y_prev = e.pageY; // Store the initial mouse position.
        e.preventDefault(); // Prevent default browser action (e.g., text selection).
        return false;
    };
    var mouseUp = function (e) {
        drag = false; // Stop dragging when the mouse button is released.
    };
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
    CANVAS.addEventListener("mousedown", mouseDown, false);
    CANVAS.addEventListener("mouseup", mouseUp, false);
    CANVAS.addEventListener("mouseout", mouseUp, false); // Also stop dragging if the mouse leaves the canvas.
    CANVAS.addEventListener("mousemove", mouseMove, false);

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


    // Fungsi ini menghitung titik-titik di sepanjang kurva Bezier kubik
    function generateCubicBezier3D(controlPoints, segments) {
        var curvePoints = [];
        var p0 = controlPoints[0], p1 = controlPoints[1], p2 = controlPoints[2], p3 = controlPoints[3];
        for (var i = 0; i <= segments; i++) {
            var t = i / segments;
            var c0 = Math.pow(1 - t, 3);
            var c1 = 3 * Math.pow(1 - t, 2) * t;
            var c2 = 3 * (1 - t) * Math.pow(t, 2);
            var c3 = Math.pow(t, 3);
            var x = c0*p0[0] + c1*p1[0] + c2*p2[0] + c3*p3[0];
            var y = c0*p0[1] + c1*p1[1] + c2*p2[1] + c3*p3[1];
            var z = c0*p0[2] + c1*p1[2] + c2*p2[2] + c3*p3[2];
            curvePoints.push(x, y, z);
        }
        return curvePoints;
    }
    
    // Fungsi ini membangun mesh pipa di sepanjang jalur yang diberikan (sekarang menggunakan jalur Bezier)
    function generateBezierTube(controlPoints, pathSegments, tubeRadius, tubeSegments) {
        var vertices = [], faces = [];
        // Mendapatkan jalur dari fungsi Bezier yang baru
        var pathPointsRaw = generateCubicBezier3D(controlPoints, pathSegments);
        var pathPoints = [];
        for(var i=0; i < pathPointsRaw.length; i+=3) { pathPoints.push([pathPointsRaw[i], pathPointsRaw[i+1], pathPointsRaw[i+2]]); }
        
        var vec = {
            subtract: (v1, v2) => [v1[0]-v2[0], v1[1]-v2[1], v1[2]-v2[2]],
            normalize: (v) => { let l=Math.sqrt(v[0]*v[0]+v[1]*v[1]+v[2]*v[2]); return l>0 ? [v[0]/l, v[1]/l, v[2]/l] : [0,0,0]; },
            cross: (v1, v2) => [v1[1]*v2[2]-v1[2]*v2[1], v1[2]*v2[0]-v1[0]*v2[2], v1[0]*v2[1]-v1[1]*v2[0]]
        };
        var normal = [0, 0, 1];
        for (var i = 0; i < pathPoints.length; i++) {
            var p = pathPoints[i]; var tangent;
            if (i === 0) tangent = vec.subtract(pathPoints[1], p);
            else if (i === pathPoints.length - 1) tangent = vec.subtract(p, pathPoints[i-1]);
            else tangent = vec.subtract(pathPoints[i+1], pathPoints[i-1]);
            tangent = vec.normalize(tangent);
            var binormal = vec.normalize(vec.cross(tangent, normal));
            normal = vec.normalize(vec.cross(binormal, tangent));
            for (var j = 0; j <= tubeSegments; j++) {
                var angle = (j / tubeSegments) * 2 * Math.PI;
                var cos = Math.cos(angle); var sin = Math.sin(angle);
                var vx = p[0] + tubeRadius * (cos * normal[0] + sin * binormal[0]);
                var vy = p[1] + tubeRadius * (cos * normal[1] + sin * binormal[1]);
                var vz = p[2] + tubeRadius * (cos * normal[2] + sin * binormal[2]);
                vertices.push(vx, vy, vz);
                vertices.push(0.96, 0.96, 0.96); // Warna White Smoke
            }
        }
        for (var i = 0; i < pathSegments; i++) {
            for (var j = 0; j < tubeSegments; j++) {
                var p1 = i * (tubeSegments + 1) + j; var p2 = p1 + 1;
                var p3 = (i + 1) * (tubeSegments + 1) + j; var p4 = p3 + 1;
                faces.push(p1, p2, p4); faces.push(p1, p4, p3);
            }
        }
        return { vertices, faces };
    }

    function generateCylinder(radius, height, segments) {
        var vertices = [];
        var faces = [];
        var halfHeight = height / 2;

        for (var i = 0; i <= segments; i++) {
            var angle = (i / segments) * 2 * Math.PI;
            var x = radius * Math.cos(angle);
            var z = radius * Math.sin(angle);
            
            vertices.push(x, -halfHeight, z); vertices.push(0.96, 0.96, 0.96);
            vertices.push(x, halfHeight, z); vertices.push(0.96, 0.96, 0.96);
        }
        for (var i = 0; i < segments; i++) {
            var p1 = i * 2, p2 = p1 + 1, p3 = (i + 1) * 2, p4 = p3 + 1;
            faces.push(p1, p3, p2); faces.push(p3, p4, p2);
        }
        return { vertices, faces };
    }

    // --- CREATE GEOMETRY DATA ---
    var controlPoints = [
        [-1.0, 1.5, 0.0],  // Titik awal (kiri atas)
        [-1.0, -0.5, 0.0], // Titik kontrol untuk lengkungan kiri bawah
        [1.0, -0.5, 0.0],  // Titik kontrol untuk lengkungan kanan bawah
        [1.0, 1.5, 0.0]   // Titik akhir (kanan atas)
    ];
    var uShape = generateBezierTube(controlPoints, 60, 0.5, 16);
    var uShape_vertex = uShape.vertices;
    var uShape_faces = uShape.faces;

    var tube = generateCylinder(0.3, 3.0, 16);
    var tube_vertex = tube.vertices;
    var tube_faces = tube.faces;

    // --- BUFFERS (SENDING GEOMETRY TO GPU) ---
    var USHAPE_VERTEX = GL.createBuffer();
    GL.bindBuffer(GL.ARRAY_BUFFER, USHAPE_VERTEX);
    GL.bufferData(GL.ARRAY_BUFFER, new Float32Array(uShape_vertex), GL.STATIC_DRAW);

    var USHAPE_FACES = GL.createBuffer();
    GL.bindBuffer(GL.ELEMENT_ARRAY_BUFFER, USHAPE_FACES);
    GL.bufferData(GL.ELEMENT_ARRAY_BUFFER, new Uint16Array(uShape_faces), GL.STATIC_DRAW);
    
    var TUBE_VERTEX = GL.createBuffer();
    GL.bindBuffer(GL.ARRAY_BUFFER, TUBE_VERTEX);
    GL.bufferData(GL.ARRAY_BUFFER, new Float32Array(tube_vertex), GL.STATIC_DRAW);

    var TUBE_FACES = GL.createBuffer();
    GL.bindBuffer(GL.ELEMENT_ARRAY_BUFFER, TUBE_FACES);
    GL.bufferData(GL.ELEMENT_ARRAY_BUFFER, new Uint16Array(tube_faces), GL.STATIC_DRAW);


    // --- MATRICES AND CAMERA SETUP ---
    var PROJMATRIX = LIBS.get_projection(40, CANVAS.width / CANVAS.height, 1, 100);
    var MOVEMATRIX = LIBS.get_I4();
    var VIEWMATRIX = LIBS.get_I4();

    LIBS.translateZ(VIEWMATRIX, -5);

    // --- WEBGL STATE AND RENDER LOOP ---
    GL.enable(GL.DEPTH_TEST);
    GL.depthFunc(GL.LEQUAL);
    GL.clearColor(0.1, 0.2, 0.8, 1.0);
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

        var uShapeMatrix = LIBS.get_I4();
        LIBS.rotateY(uShapeMatrix, THETA);
        LIBS.rotateX(uShapeMatrix, PHI);

        GL.uniformMatrix4fv(_Pmatrix, false, PROJMATRIX);
        GL.uniformMatrix4fv(_Vmatrix, false, VIEWMATRIX);
        GL.uniformMatrix4fv(_Mmatrix, false, uShapeMatrix);

        // --- DRAW THE OBJECTS ---

        // U shape with Bezier
        GL.bindBuffer(GL.ARRAY_BUFFER, USHAPE_VERTEX);
        GL.vertexAttribPointer(_position, 3, GL.FLOAT, false, 4 * (3 + 3), 0);
        GL.vertexAttribPointer(_color, 3, GL.FLOAT, false, 4 * (3 + 3), 3 * 4);
        GL.bindBuffer(GL.ELEMENT_ARRAY_BUFFER, USHAPE_FACES);
        GL.drawElements(GL.TRIANGLES, uShape_faces.length, GL.UNSIGNED_SHORT, 0);

        // Tube with cylinder
        var handleLocalMatrix = LIBS.get_I4();
        //    Geser gagang agar bagian atasnya menempel di titik terendah U-shape (0,0,0)
        //    dan memanjang ke bawah sejauh setengah tingginya.
        LIBS.translateY(handleLocalMatrix, -1.0); 

        //    b. Kalikan matriks induk dengan matriks lokal untuk mendapatkan posisi final
        var handleFinalMatrix = LIBS.multiply(uShapeMatrix, handleLocalMatrix);

        // 4. Gambar gagang menggunakan matriks finalnya
        GL.uniformMatrix4fv(_Mmatrix, false, handleFinalMatrix); // Kirim matriks gagang

        GL.bindBuffer(GL.ARRAY_BUFFER, TUBE_VERTEX);
        GL.vertexAttribPointer(_position, 3, GL.FLOAT, false, 4 * (3 + 3), 0);
        GL.vertexAttribPointer(_color, 3, GL.FLOAT, false, 4 * (3 + 3), 3 * 4);
        GL.bindBuffer(GL.ELEMENT_ARRAY_BUFFER, TUBE_FACES);
        GL.drawElements(GL.TRIANGLES, tube_faces.length, GL.UNSIGNED_SHORT, 0);


        GL.flush();
        window.requestAnimationFrame(animate);
    };

    animate(0);
}

window.addEventListener('load', main);

