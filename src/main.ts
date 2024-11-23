import * as THREE from "three";
import { loadModel } from "./model.ts";
import { EffectComposer } from "three/examples/jsm/postprocessing/EffectComposer";
import { RenderPass } from "three/examples/jsm/postprocessing/RenderPass";
import { UnrealBloomPass } from "three/examples/jsm/postprocessing/UnrealBloomPass";
import {Easing, Tween} from "@tweenjs/tween.js";

const cam = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000000000);
const scene = new THREE.Scene();
const renderer = new THREE.WebGLRenderer();
const light = new THREE.DirectionalLight(0xffffff, 1);
const ambient = new THREE.AmbientLight(0xffffff, 0.5);
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);
scene.add(ambient);
scene.add(light);
light.position.set(5, 10, 7);
const composer = new EffectComposer(renderer);
const renderPass = new RenderPass(scene, cam);
composer.addPass(renderPass);

const bloomPass = new UnrealBloomPass(
    new THREE.Vector2(window.innerWidth, window.innerHeight),
    0.6, // Intensidad del bloom
    0.4, // Radio del bloom
    0.9  // Umbral del bloom
);
composer.addPass(bloomPass);

// Crear una bala estilo Star Wars
function createBullet(color: string): THREE.Mesh {
    const geometry = new THREE.CylinderGeometry(0.1, 0.1, 2, 506, 506);
    const material = new THREE.MeshStandardMaterial({
        color,
        emissive: color,
        emissiveIntensity: 10,
    });
    const bullet = new THREE.Mesh(geometry, material);
    bullet.scale.set(10, 100, 100);

    scene.add(bullet);
    return bullet;
}
const halconMilenario = await loadModel("halcon_milenario/scene.gltf");
const interceptor = await loadModel("interceptor/scene.gltf");
const phantom = await loadModel("phantom/scene.gltf");
const deathStar = await loadModel("death_star/scene.gltf");
const asteroid = await loadModel("asteroid/scene.gltf");


halconMilenario.position.set(0, 0, 0);
phantom.position.set(-900, 0, 0);
phantom.scale.set(10, 10, 10);
interceptor.position.set(900, 0, 0);
interceptor.scale.set(10, 10, 10);
scene.add(deathStar);
scene.add(interceptor);
scene.add(phantom);

cam.position.z = 300;
cam.lookAt(deathStar.position);

deathStar.rotateY(2.2)

const tween = new Tween({z: 300, rotation : Math.PI/2, n : 0})
    .to({z: 1000, rotation : -1, n : 1}, 15000)
    .easing(Easing.Quadratic.InOut)
    .onUpdate(
    (coords)=> {
        deathStar.rotation.y = coords.rotation
        console.log(coords)
        cam.position.z = coords.z
    })
    .onComplete(() => {
    })
    .start();


phantom.position.z = 800
phantom.position.x = 10000
interceptor.position.z = 800
interceptor.position.x = 10000
phantom.rotateY(3.14/2)
interceptor.rotateY(3.14/2)

const tween2 =  new Tween({z: 300, x : -1100, mid: 0, rotation : 0, rot2: 3.14/2})
    .to({z: 900, x: 3000, mid: 1, rotation: 3.14/2, rot2: 2*3.14/5}, 6000)
    .easing(Easing.Quadratic.InOut)
    .onUpdate(
        (coords)=> {
            interceptor.position.x = coords.x - 1200
            phantom.position.x = coords.x
            phantom.rotation.x = coords.rotation
            phantom.position.z = coords.z
            interceptor.position.z = coords.z
            interceptor.rotation.x = coords.rotation
            phantom.rotation.y = coords.rot2
        })
    .delay(12000)
    .start();


let t = 1;
let initialPosition = phantom.position.clone()
const tween3 =  new Tween({x: 2700, n: 0, t: 0})
    .to({x: 5000, n : 4, t: 20}, 13000)
    .easing(Easing.Linear.InOut)
    .onStart(() => {
        tween2.stop()
        phantom.rotation.x = 0
        phantom.rotation.y = 3.14/2
        phantom.rotation.z = 0
        interceptor.rotation.x = 0
        interceptor.rotation.y = 3.14/2
        interceptor.rotation.z = 0
        initialPosition = phantom.position.clone().addScalar(30)
    })
    .onUpdate(
        (coords)=> {
            cam.lookAt(initialPosition)

            cam.position.x = coords.x + 300


            const add = 60*Math.cos(coords.n*8) + 30*Math.sin(coords.n*5 + coords.n)
            const rest = 30*Math.cos(coords.n*7) + 30*Math.sin(coords.n*5 + coords.n)
            phantom.position.x = coords.x
            phantom.position.z = initialPosition.z +  add
            phantom.position.y = initialPosition.y + rest;
            phantom.rotation.x += (add + rest)/4000

            interceptor.position.x = coords.x - 300*Math.cos(coords.n) - 500;
            interceptor.position.y = phantom.position.y + 100*Math.sin(coords.n*3) + 100*Math.cos(coords.n*3 + coords.n);
            interceptor.position.z = phantom.position.z + 200*Math.cos(coords.n*3) + 100*Math.sin(coords.n*3 + coords.n);

            interceptor.lookAt(phantom.position.clone().addScalar(40))
            cam.position.z = initialPosition.z + 50
            cam.position.y = initialPosition.y + 50


        })
    .delay(tween.getDuration() + tween2.getDuration() - 4900)

const tween4 =  new Tween({x: 5000, n: 0, t: 0})
    .to({x: 15000, n : 150, t: 4}, 18000)
    .easing(Easing.Linear.InOut)
    .onStart(() => {


        phantom.rotation.x = 0
        phantom.rotation.y = 3.14/2
        phantom.rotation.z = 0
        interceptor.rotation.x = 0
        interceptor.rotation.y = 3.14/2
        interceptor.rotation.z = 0
        initialPosition = phantom.position.clone().addScalar(30)
        phantom.position.x = 5000
        phantom.position.y =0
        phantom.position.z = 0
        interceptor.position.y =0
        interceptor.position.z = 0
        interceptor.position.x = 4500
        cam.position.x = 4920
        cam.position.y = 30
        cam.position.z = -20
        cam.rotation.x =3.14
        cam.rotation.y =3*3.14/2.1
        cam.rotation.z =3.14;

        (new Array(20)).fill(0).forEach((x, i) => {
            (new Array(20)).fill(0).forEach((x, z) => {
                let a = asteroid.clone()
                const offset = 2080;
                a.position.set(cam.position.x + 5000 + Math.sin(z + i)*900.0 -  Math.cos(z + i)*900.0 , cam.position.y - i * 290 + offset, cam.position.z - z * 290 + offset)
                a.scale.set(50, 50, 50)
                scene.add(a);
            })
        })


    })
    .onUpdate(
        (coords)=> {
            const lerpSpeed = 1; // Adjust speed here
            cam.position.x = THREE.MathUtils.lerp(cam.position.x, coords.x - 50, lerpSpeed * 0.1);
            phantom.position.x = coords.x
            phantom.position.y = (Math.sin(coords.n) - Math.cos(coords.n)) * (Math.sin(coords.n) + Math.cos(coords.n))**2
            phantom.position.z = (Math.sin(coords.n) - Math.cos(coords.n)) * (Math.sin(coords.n) - Math.cos(coords.n))
            const add = 60*Math.cos(coords.t*20) + 30*Math.sin(coords.t*5 + coords.t)
            const rest = 30*Math.cos(coords.t*10) + 30*Math.sin(coords.t*5 + coords.t)
            phantom.rotation.x += (add + rest)/4000
        })



tween.start()
tween2.start()
tween3.start()
tween3.chain(tween4)



function animationLoop() {
    requestAnimationFrame(animationLoop);

    tween.update();
    tween2.update()
    tween3.update()
    tween4.update()

    renderer.render(scene, cam);
}

requestAnimationFrame(animationLoop);
/*
(async () => {
    try {
        function animate() {
            tween.start()
            deathStar.rotateY(0.001)
            requestAnimationFrame(animate);
            composer.render();
        }

        animate();
    } catch (error) {
        console.error("Error loading model:", error);
    }
})();
 */
