"use strict";
// Classes
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
        this.texture = THREE.ImageUtils.loadTexture(src);
        return this;
    }

    setNormalMap(src) {
        this.normalmap = THREE.ImageUtils.loadTexture(src);
        return this;
    }

    setSpecMap(src) {
        this.specmap = THREE.ImageUtils.loadTexture(src);
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

    setMaterial() {
        // base image texture for mesh
        let lavaTexture = new THREE.ImageUtils.loadTexture('images/lava.jpg');
        lavaTexture.wrapS = lavaTexture.wrapT = THREE.RepeatWrapping;
        // multiplier for distortion speed
        let baseSpeed = 0.0002;
        // number of times to repeat texture in each direction
        let repeatS = 2.0,
            repeatT = repeatS;

        // texture used to generate "randomness", distort all other textures
        let noiseTexture = new THREE.ImageUtils.loadTexture('images/cloud.png');
        noiseTexture.wrapS = noiseTexture.wrapT = THREE.RepeatWrapping;
        // magnitude of noise effect
        let noiseScale = 0.04;

        // texture to additively blend with base image texture
        let blendTexture = new THREE.ImageUtils.loadTexture('images/lava.jpg');
        blendTexture.wrapS = blendTexture.wrapT = THREE.RepeatWrapping;
        // multiplier for distortion speed
        let blendSpeed = 0.01;
        // adjust lightness/darkness of blended texture
        let blendOffset = 0.25;

        // texture to determine normal displacement
        let bumpTexture = noiseTexture;
        bumpTexture.wrapS = bumpTexture.wrapT = THREE.RepeatWrapping;
        // multiplier for distortion speed
        let bumpSpeed = 0.15;
        // magnitude of normal displacement
        let bumpScale = 10.0;

        // use 'window' to create global object
        window.customUniforms = {
            baseTexture: {type: "t", value: lavaTexture},
            baseSpeed: {type: "f", value: baseSpeed},
            repeatS: {type: "f", value: repeatS},
            repeatT: {type: "f", value: repeatT},
            noiseTexture: {type: "t", value: noiseTexture},
            noiseScale: {type: "f", value: noiseScale},
            blendTexture: {type: "t", value: blendTexture},
            blendSpeed: {type: "f", value: blendSpeed},
            blendOffset: {type: "f", value: blendOffset},
            bumpTexture: {type: "t", value: bumpTexture},
            bumpSpeed: {type: "f", value: bumpSpeed},
            bumpScale: {type: "f", value: bumpScale},
            alpha: {type: "f", value: 1.0},
            time: {type: "f", value: 1.0}
        };

        // create custom material from the shader
        this.planetMaterial = new THREE.ShaderMaterial({
            uniforms: window.customUniforms,
            vertexShader: document.getElementById('vertexShader').textContent,
            fragmentShader: document.getElementById('fragmentShader').textContent
        });
        return this;
    }

    create() {
        this.planet = new THREE.Mesh(this.planetGeometry, this.planetMaterial);
        return this;
    }

}

class Utils {

    static stop() {
        setTimeout(() => animate(), 1000 / 60);
    }

    static showDeadScreen() {
        let classList = document.getElementsByClassName('background')[0].classList;
        if (classList.contains('disabled'))
            classList.remove('disabled');
        gameOver = true;
    }

    static updateFuelIndicator(fuel) {
        fuelIndicator.style.height = fuel * 200 / 1000 + 'px';
        if (fuel <= 0) {
            fuelIndicator.classList.add('red');
        }
    }

    static onWindowResize() {
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(window.innerWidth, window.innerHeight);
    }
}

// Global variables
let camera, controls, scene, renderer, ship, sun, arrow,
    planets = [],
    gravity = -0.007,
    fuel = 1000,
    gameOver = false,
    isPaused = false,
    fuelIndicator = document.getElementById("fuel"),
    THREE = window.THREE;

const FUEL_MOVEMENT_COST = 0.5,
    FUEL_ROTATE_COST = 0.1,
    SHIP_MOVE_SPEED = 2;

// Required utils
let clock = new THREE.Clock(),
    keyboard = new THREEx.KeyboardState();

// Define animation loop method
window.requestFrame = (() => {
    return window.requestAnimationFrame
        || window.webkitRequestAnimationFrame
        || window.mozRequestAnimationFrame
        || function (callback) {
            window.setTimeout(callback, 1000 / 60);
        };
})();

init();
animate();

function init() {
    scene = new THREE.Scene();

    renderer = new THREE.WebGLRenderer();
    renderer.setClearColor("rgb(0,0,0)");
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setSize(window.innerWidth, window.innerHeight);

    document.getElementById('container').appendChild(renderer.domElement);

    camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 1, 1000);

    controls = new THREE.OrbitControls(camera, renderer.domElement);
    controls.minDistance = 20;

    // Camera auto-rotation
    // controls.autoRotate = true;
    // controls.autoRotateSpeed = 1;

    controls.maxDistance = 190;
    controls.enableZoom = true;
    controls.enablePan = false;

    //Create Sun
    sun = new Sun('Sun');
    scene.add(sun.getInstance);

    //Sun's glowing
    let spriteMaterial = new THREE.SpriteMaterial(
        {
            map: new THREE.ImageUtils.loadTexture('images/glow.png'), useScreenCoordinates: false,
            color: 0xFFFFE0, transparent: false, blending: THREE.AdditiveBlending
        });
    let sprite = new THREE.Sprite(spriteMaterial);
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
    planets.forEach((planet) => {
        scene.add(planet.getInstance)
    });

    let shipGeometry = new THREE.CylinderGeometry(0, 0.3, 0.9, 3, 1);
    let shipMaterials = new THREE.MeshBasicMaterial({
        color: 0x00ff00
    });

    ship = new THREE.Mesh(shipGeometry, shipMaterials);
    ship.position.set(-100, 0, 0);
    ship.name = "Ship";
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
    camera.position.z = -200;
    camera.lookAt(scene.position);

    //lights
    let light = new THREE.AmbientLight(0x848484); // soft white light
    scene.add(light);

    window.addEventListener('resize', Utils.onWindowResize, false);
}

function move() {
    let delta = clock.getDelta(), // seconds.
        moveDistance = SHIP_MOVE_SPEED * delta, // 0.1 pixels per second
        rotateAngle = Math.PI / 9 * delta,   // pi/9 radians (20 degrees) per second
        shipPosition = ship.position.clone(),
        array = [];

    if (gameOver)
        return;

    // Create array with all planets and Sun distance info
    Array.prototype.push.call(array = planets.map((planet) => {
        let distance = shipPosition.distanceTo(planet.getInstance.position.clone());
        return {
            p: planet,
            distance: distance,
            vector: new THREE.Vector3().subVectors(planet.getInstance.position.clone(), shipPosition),
            force: planet.radius / distance / 5
        };
    }), {
        p: sun,
        distance: shipPosition.distanceTo(sun.getInstance.position.clone()),
        vector: new THREE.Vector3().subVectors(sun.getInstance.position.clone(), shipPosition),
        force: sun.radius / shipPosition.distanceTo(sun.getInstance.position.clone()) / 5
    });

    // Get the closest Object
    let closestObject = array.find((planet) => {
        return planet.distance == Math.min.apply(null, array.map((planet) => planet.distance));
    });

    // Detect collision
    if (closestObject.distance <= closestObject.p.radius) {
        Utils.showDeadScreen();
        scene.remove(scene.getObjectByName('Ship'));
    }

    // Delete closest Object from array
    array = array.filter((i) => i != closestObject);

    // Create array of vectors and build them
    let vectors = array.map((planet, i) => {
        arrow = new THREE.ArrowHelper(planet.vector.normalize(), shipPosition, 10, 0x9FC5E8);
        arrow.name = "arrow" + i;
        scene.add(arrow);
        return planet.vector;
    });

    // Closest planet vector
    arrow = new THREE.ArrowHelper(closestObject.vector.normalize(), shipPosition, 10, 0xFF0000);
    arrow.name = "arrow6";
    scene.add(arrow);

    // Find main vector
    let resultVector = vectors.reduce((first, second) => {
        return new THREE.Vector3().addVectors(first, second).normalize();
    });

    let global = 0;
    array.forEach((planet) => {
        global += planet.force
    });

    // Direction of ship's movement
    let direction = shipPosition.addVectors(resultVector, closestObject.vector).normalize();

    // Gravity calculation (primitive)
    gravity = closestObject.force + global / 6;

    // Result point for movement
    let vector = direction.clone().multiplyScalar(gravity, gravity, gravity);

    // Player actions
    if (fuel > 0) {
        if (keyboard.pressed("A")) {
            ship.rotation.z += rotateAngle;
            fuel -= FUEL_ROTATE_COST;
        }
        if (keyboard.pressed("D")) {
            ship.rotation.z -= rotateAngle;
            fuel -= FUEL_ROTATE_COST;
        }
        if (keyboard.pressed("left")) {
            vector.z -= moveDistance;
            fuel -= FUEL_MOVEMENT_COST;
        }
        if (keyboard.pressed("right")) {
            vector.z += moveDistance;
            fuel -= FUEL_MOVEMENT_COST;
        }
        if (keyboard.pressed("up")) {
            vector.x += moveDistance;
            fuel -= FUEL_MOVEMENT_COST;
        }
        if (keyboard.pressed("down")) {
            vector.x -= moveDistance;
            fuel -= FUEL_MOVEMENT_COST;
        }
        Utils.updateFuelIndicator(fuel);
    }

    // Apply all calculated things to ship position
    ship.position.x += vector.x ? vector.x : -vector.x;
    ship.position.y += vector.y;
    ship.position.z += vector.z ? vector.z : -vector.z;

    // Erse array and delete old vectors from scene
    array = [];
    for (let i = 0; i < 7; i++) {
        setTimeout(() => {
            scene.remove(scene.getObjectByName("arrow" + i))
        }, 10)
    }
    window.customUniforms.time.value += delta;

}

function update() {
    // Update planets positions
    planets.forEach((planet) => {
        planet.rotate(planet.rotateSpeed);
        planet.spin(planet.getSpinSpeed);
    });

    // Rotate sun
    sun.rotate(0.01);
    // Apply movement changes
    move();
}

function render() {
    renderer.render(scene, camera);
}

// Main game loop
function animate() {
    controls.update();

    if (isPaused) {
        render();
        Utils.stop();
    } else {
        update();
        render();
        requestFrame(animate);
    }
}

// Listeners for HUD and menu actions
(() => {
    const pause = {
        off: document.getElementById("resume"),
        on: document.getElementById("pause")
    };

    function togglePause(p) {
        pause['on'].style.display = p ? "none" : 'block';
        pause['off'].style.display = p ? "block" : 'none';
    }

    window.onkeydown = function (event) {
        if (event.keyCode == 80)
            togglePause(isPaused = !isPaused);  // flips the pause state on 'P' pressed
    };

    pause.on.onclick = function () {
        togglePause(isPaused = true);
    };

    pause.off.onclick = function () {
        togglePause(isPaused = false);
    };

    document.getElementById('reset').onclick = function () {
        window.location.reload();
    };
})();