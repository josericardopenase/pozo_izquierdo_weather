import * as THREE from "three";
import axios from 'axios'
const cam = new THREE.PerspectiveCamera();
const scene = new THREE.Scene();
const renderer = new THREE.WebGLRenderer({})
renderer.setSize(window.innerWidth, window.innerHeight);
var time = 0;
cam.position.z = 50
function getMousePosition() {
    let mousePosition = [0, 0];

    document.addEventListener('mousemove', (event) => {
        mousePosition[0] = event.clientX;
        mousePosition[1] = window.innerHeight- event.clientY;
    });

    return function () {
        return [...mousePosition];
    };
}

const shader = await loadShader();

async function loadShader() : Promise<string>{
    const res = await axios.get<string>("fragShader.glsl")
    return res.data
}

const mousePosition = getMousePosition();
function main(){
    renderer.setSize(window.innerWidth, window.innerHeight);
    document.body.appendChild(renderer.domElement);
    const plane = new THREE.PlaneGeometry(10, 10);
    const material = new THREE.ShaderMaterial({
        fragmentShader: shader,
        uniforms: {
            "u_time" : new THREE.Uniform(time),
            "resolution" : new THREE.Uniform([window.innerWidth, window.innerHeight]),
            "mouse_position": new THREE.Uniform(mousePosition())
        }
    })
    const mesh = new THREE.Mesh(plane, material)
    scene.add(mesh)
}



function render(){
    setTimeout(() => {
        main()
        renderer.render(scene, cam);
        render()
        time+=0.01
    }, 10)
}

render()






