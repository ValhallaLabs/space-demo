let camera, controls, scene, renderer, planets = [], ship, speed = 0.007;

// direction vector for movement
var direction = new THREE.Vector3(1, 0, 0);


class Planet {

    constructor(name, rotateSpeed, distance, spinSpeed) {
        this.name = name;
        this.rotateSpeed = rotateSpeed;
        this.spinSpeed = spinSpeed;
        this.distance = distance;
        this.t = 0;
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
        this.planet.rotation.y += speed || this.rotateSpeed;
    }

    spin(t) {
        this.planet.position.x = this.distance * Math.cos(t);
        this.planet.position.z = this.distance * Math.sin(t);
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

    get getSpinSpeed() {
        this.t += this.spinSpeed;
        return this.t;
    }

}

class Sun extends Planet {
    constructor(name) {
        super(name);
        this.setTexture('images/planets/sunmap.jpg')
            .setGeometry(5, 20, 20)
            .setMaterial()
            .create();
        this.move(0, 0, 0);
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

    //Create Sun
    scene.add( new Sun('Sun').getInstance);

    //Sun's glowing
    var spriteMaterial = new THREE.SpriteMaterial(
        {
            map: new THREE.ImageUtils.loadTexture('images/glow.png'), useScreenCoordinates: false,
            color: 0xFFFFE0, transparent: false, blending: THREE.AdditiveBlending
        });
    var sprite = new THREE.Sprite(spriteMaterial);
    sprite.scale.set(30, 30, 0.4);
    scene.add(sprite);

    //Planets creation
    let first = new Planet("First", 0.002, 60, 0.0036)
        .setTexture("images/planets/earth/earthmap1k.jpg")
        .setNormalMap("images/planets/earth/earthbump1k.jpg").setSpecMap("images/planets/earth/earthspec1k.jpg")
        .setGeometry(2, 20, 20)
        .setMaterial()
        .create();
    planets.push(first);

    let second = new Planet("Second", 0.002, 40, 0.003)
        .setTexture("images/planets/exoplanet/planet-512.jpg")
        .setNormalMap("images/planets/exoplanet/normal-map-512.jpg").setSpecMap("images/planets/exoplanet/water-map-512.jpg")
        .setGeometry(1, 20, 20)
        .setMaterial()
        .create();
    planets.push(second);

    let third = new Planet("Third", 0.009, 20, 0.0043).setTexture('images/planets/mercury/mercurymap.jpg')
        .setNormalMap('images/planets/mercury/mercurybump.jpg')
        .setGeometry(0.7, 20, 20)
        .setMaterial()
        .create();
    planets.push(third);

    let fourth = new Planet("Fourth", 0.0056, 150, 0.0013).setTexture('images/planets/neptune/neptunemap.jpg')
        .setGeometry(2.5, 20, 20)
        .setMaterial()
        .create();
    planets.push(fourth);

    let fifth = new Planet("Fifth", 0.0015, 120, 0.0019).setTexture('images/planets/jupiter/jupitermap.jpg')
        .setGeometry(5, 20, 20)
        .setMaterial()
        .create();
    planets.push(fifth);

    let sixth = new Planet("Sixth", 0.002, 85, 0.0024).setTexture('images/planets/mars/marsmap.jpg')
        .setGeometry(2.7, 20, 20)
        .setMaterial()
        .create();
    planets.push(sixth);

    //add Planets to scene
    planets.forEach(function (planet) {
        scene.add(planet.getInstance);
    });

    let shipGeometry = new THREE.CylinderGeometry(0, 0.3, 0.9, 3, 1);
    let shipMaterials = new THREE.MeshBasicMaterial({
        color: 0x00ff00
    });

    ship = new THREE.Mesh(shipGeometry, shipMaterials);
    ship.position.set(0,20,0);
    scene.add(ship);

    //Space background is a large sphere
    let spaceSphereGeometry = new THREE.SphereGeometry(200, 20, 20);
    let spaceSphereMaterial = new THREE.MeshBasicMaterial(
        {
            map: THREE.ImageUtils.loadTexture('images/galaxy_starfield.png'),
            overdraw: 0.5
        });


    let spaceSphere = new THREE.Mesh(spaceSphereGeometry, spaceSphereMaterial);

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
    var light = new THREE.AmbientLight(0x848484); // soft white light
    scene.add(light);

    window.addEventListener('resize', onWindowResize, false);
}

function move() {
    var vector = direction.clone().multiplyScalar(speed, speed, speed);
    ship.position.x += vector.x;
    ship.position.y += vector.y;
    ship.position.z += vector.z;
}
function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
}
function animate() {
    requestAnimationFrame(animate);
    controls.update();
    render();
}
function render() {
    move();
    planets.forEach(function (planet) {
        planet.rotate(planet.rotateSpeed);
        planet.spin(planet.getSpinSpeed);
    });
    renderer.render(scene, camera);
}
