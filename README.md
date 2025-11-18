## Official
[Repo Praktikum Kelas B by Ko Tim](https://github.com/AlynxNeko/grafkom-b)

## Penjelasan Penamaan File
- main2 --> main pertemuan kedua (pertemuan pertama tidak ada)
- main2t --> main pertemuan kedua untuk tugas
- main3_true --> main pertemuan ketiga dari asdos (official)
- main5-b --> main pertemuan kelima dari kelas praktikum B (aku kelas praktikum a)

**REMINDER**
- untuk index.html tinggal sesuaikan saja nama file script js-nya
- cube_vertex != CUBER_VERTEX (please becareful!)

<!-- GENERAL END -->
|
##  Catatan Selama Kelas Praktikum
### 1. Pertemuan 1:
- none


### 2. Pertemuan 2:
- 2D


### 3. Pertemuan 3:
- cube_vertex & triangle_faces: https://justpaste.it/g6ov1
- cube code: https://justpaste.it/evcyq
- canvas addEventListener for keebs and mouse input: https://justpaste.it/il28d


### 3.a. Belajar Pertemuan 3 with Chris:
https://youtube.com/shorts/3yT1ndjaoVE


### 4. Pertemuan 4:
- CUBE faces (online)
- main4 not working (?idk)


### 5. Pertemuan 5:
- code in P5: petra.id/paste
#### Kurva Bezier:
- untuk n titik kontrol maka persamaan kurva bezier adalah (x+y)^(n-1)
- ganti x dengan (1-t) 
##### in class P5: buat untuk Bezier Cubic. yang di class itu Bezier
##### PR P5:
- bikin 2 quadric objek based ss di classroom itu
- b-spline versi 3D
- ini adalah bagian dari proyek juga ^^


### 6. Pertemuan 6:
- code ada di petra.id/paste (drive)
- buat 2 sphere
- untuk MyObject: dipanggil oleh main js; main js dipanggil menggunakan tag script dengan type="module"
- kalau mau 2 shape behave the same (mereka as satu kesatuan) --> shape 1 as parent, shape 2 as its child.
    - Object1.childs.push(Object2);
    - Object2.childs.push(Object3);

local space --> area dirinya sendiri
ketika dia punya parent, posisi dai relative terhadap parentnya

- shape: toroid, torus

#### Self 6:
- [Jewelry with WebGL](https://piellardj.github.io/diamond-webgl/jewelry/)
- gl_Position = uProjectionMatrix * uModelViewMatrix * vec4(aVertexPosition, 1.0); tidak sama dengan gl_Position = uModelViewMatrix * uProjectionMatrix * vec4(aVertexPosition, 1.0);
- rendering modes (978-1-119-97508-3, pg. 327)
    - TRIANGLES
    - TRAIANGLE_STRIP
    - TRIANGLE_FAN
    - POINTS
    - LINES
    - LINE_LOOP
    - LINE_STRIP
- ![earthmap.jpg](https://eoimages.gsfc.nasa.gov/images/imagerecords/147000/147190/eo_base_2020_clean_720x360.jpg)

### 7. Pertemuan 7 (inside Dragon folder):
- Dragon: code dari classroom (official)
- Phong 
- di main7.js inside /Dragon, yang muter itu cameranya (POV), bukan objectnya. jadi meskipun kita putar objectnya dengan mouse, lightingnya tetap mengikuti cameranya (POV).
- ambient: cahaya global (tidak langsung dari sumber)
- specular: reflection (pantulan)
- diffuse: warna material

### 8-9 Minggu UTS

### 10. Three JS:
- THREE.Scene() --> buat scene
- THREE.BoxGeometry
- [html](https://justpaste.it/b652j) [js](https://justpaste.it/crtt6)
- script main js harus ada module karena ini OOP. kalau ada import di js nya berarti typenya module.
- sun have earth, mars. earth has moon. (hubungannya: sun.add(earth))

### 11. Camera in Three.js
- [BAB 15 – Camera in Three.js](https://github.com/AlynxNeko/grafkom-b/tree/main/pertemuan-08-camera-and-light) 
- GUI untuk mengatur fov, near, far pada ujung kanan screen
- Ambient light: cahaya di sekitar. 



📚 Summary:
- PerspectiveCamera gives depth perception.
- OrbitControls enables interactive movement.
- GUI allows dynamic parameter control.
- OrthographicCamera provides flat projection.
- Light types simulate various real-world illumination effects.

### 12. Lighting
- obj (object) and mtl (material)
- fyx, glb or gltf
- [https://threejsdemos.com/demos/basics/materials-gallery](https://threejsdemos.com/demos/basics/materials-gallery)
- lanjutin buat ngambil dari sini ya [https://threejs.org/examples/?q=gltf#webgl_loader_gltf_avif](https://threejs.org/examples/?q=gltf#webgl_loader_gltf_avif)

### 13. Three JS
- [justpaste.it/m4lvp](justpaste.it/m4lvp)
- main13.js [Pete with motions](https://www.mixamo.com/#/?page=1&query=idle&type=Motion%2CMotionPack)