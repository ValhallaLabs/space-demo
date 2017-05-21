var camera, controls, scene, renderer, planet;

class Planet {

    constructor(name) {
        this.name = name;
    }

    create() {
        this.planet = new THREE.Mesh(this.planetGeometry, this.planetMaterial);
        this.planet.material.map.wrapS = THREE.RepeatWrapping;
        this.planet.material.map.wrapT = THREE.RepeatWrapping;
        this.planet.material.map.repeat.set(2, 1);

        if (this.planet.material.normalMap) {
            this.planet.material.normalMap.wrapS = THREE.RepeatWrapping;
            this.planet.material.normalMap.wrapT = THREE.RepeatWrapping;
            this.planet.material.normalMap.repeat.set(2, 1);
        }

        return this;
    }

    setTexture(src) {
        this.texture = THREE.ImageUtils.loadTexture(src); // "images/planet-512.jpg"
        return this;
    }

    setNormalMap(src) {
        this.normalmap = THREE.ImageUtils.loadTexture(src); //"images/normal-map-512.jpg"
        return this;
    }

    setSpecMap(src) {
        this.specmap = THREE.ImageUtils.loadTexture(src); //"images/normal-map-512.jpg"
        return this;
    }

    setGeometry(radius, widthSegments, heightSegments) {
        this.radius = radius || 10;
        this.widthSegments = widthSegments || 8;
        this.heightSegments = heightSegments || 8;
        this.planetGeometry = new THREE.SphereGeometry(this.radius, this.widthSegments, this.heightSegments);
        return this;
    }

    setMaterial() {
        this.planetMaterial = new THREE.MeshPhongMaterial();
        this.planetMaterial.map = this.texture;
        if (this.specmap) {
            this.planetMaterial.specularMap = this.specmap;
        }
        if (this.normalmap) {
            this.planetMaterial.normalMap = this.normalmap;
        }
        this.planetMaterial.specular = new THREE.Color(0xff0000);
        this.planetMaterial.shininess = 1;
        this.planetMaterial.normalScale.set(-0.3, -0.3);

        return this;
    }

    rotate(speed) {
        this.planet.rotation.y += speed || 0.002;
    }

    move(x, y, z) {
        this.planet.position.x = x;
        this.planet.position.y = y;
        this.planet.position.z = z;
    }

    get getName() {
        return this.name;
    }

    get getInstance() {
        return this.planet;
    }

}

init();
animate();

function init() {
    scene = new THREE.Scene();

    renderer = new THREE.WebGLRenderer();
    renderer.setClearColor("rgb(0,0,0)");
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setSize(window.innerWidth, window.innerHeight);

    document.body.appendChild(renderer.domElement);

    camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 1, 1000);

    controls = new THREE.OrbitControls(camera, renderer.domElement);
    controls.minDistance = 20;
    controls.autoRotate = true;
    controls.autoRotateSpeed = 1;
    controls.maxDistance = 190;
    controls.enableZoom = true;
    controls.enablePan = false;

    var sun = new Planet('Sun').setTexture('images/planets/sunmap.jpg')
        .setGeometry(5, 20, 20)
        .setMaterial()
        .create();
    sun.move(0, 0, 0);
    scene.add(sun.getInstance);

    planet = new Planet("First")
        .setTexture("images/planet-512.jpg").setNormalMap("images/normal-map-512.jpg").setSpecMap("images/water-map-512.jpg")
        .setGeometry(1, 20, 20)
        .setMaterial()
        .create();
    planet.move(100, 0, 0);
    scene.add(planet.getInstance);


    //Space background is a large sphere
    var spaceSphereGeometry = new THREE.SphereGeometry(200, 20, 20);
    var spaceSphereMaterial = new THREE.MeshBasicMaterial(
        {
            map: THREE.ImageUtils.loadTexture('images/galaxy_starfield.png'),
            overdraw: 0.5
        });


    var spaceSphere = new THREE.Mesh(spaceSphereGeometry, spaceSphereMaterial);

    //spacesphere needs to be double sided as the camera is within the spacesphere
    spaceSphere.material.side = THREE.DoubleSide;

    spaceSphere.material.map.wrapS = THREE.RepeatWrapping;
    spaceSphere.material.map.wrapT = THREE.RepeatWrapping;
    spaceSphere.material.map.repeat.set(5, 3);

    spaceSphere.material.shininess = 1;
    spaceSphere.material.fog = false;

    scene.add(spaceSphere);

    //position camera
    camera.position.x = 0;
    camera.position.y = 0;
    camera.position.z = -15;
    camera.lookAt(scene.position);

    //lights
    light = new THREE.DirectionalLight(0xffffff);
    light.position.set(1, 1, 1);
    scene.add(light);
    light = new THREE.DirectionalLight(0x002288);
    light.position.set(-1, -1, -1);
    scene.add(light);
    light = new THREE.AmbientLight(0x222222);
    scene.add(light);

    var light = new THREE.PointLight(0xffffff, 10, 50, 2);
    light.position.set(0, 0, 0);
    scene.add(light);

    window.addEventListener('resize', onWindowResize, false);
}
function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
}
function animate() {
    requestAnimationFrame(animate);
    controls.update(); // required if controls.enableDamping = true, or if controls.autoRotate = true
    render();
}
function render() {
    planet.rotate(0.002);
    renderer.render(scene, camera);
}
