import * as THREE from "three";
import MapImageRenderer from "./MapImageRenderer";
import axios from 'axios';
import { TextGeometry } from 'three/addons/geometries/TextGeometry.js';
import {Mesh, MeshBasicMaterial} from "three";

interface WeatherData {
    elevation: number;
    generationtime_ms: number;
    hourly: HourlyData;
    hourly_units: HourlyUnits;
    latitude: number;
    longitude: number;
    timezone: string;
    timezone_abbreviation: string;
    utc_offset_seconds: number;
}

interface HourlyData {
    relative_humidity_2m: number[];
    temperature_2m: number[];
    time: string[];
    wind_speed_10m: number[];
    wind_direction_10m: number[];
}

interface HourlyUnits {
    relative_humidity_2m: string;
    temperature_2m: string;
    time: string;
    wind_speed_10m: string;
    wind_direction_10m: string;
}

const scene = new THREE.Scene();
const camera = new THREE.OrthographicCamera(-2, 2, 2, -2, 0.1, 100);
camera.position.set(0, 0, 5);

const loader = new THREE.TextureLoader();
const shop  = loader.load("shop.png")
shop.minFilter = THREE.LinearMipMapLinearFilter;
shop.magFilter = THREE.LinearFilter;
shop.premultiplyAlpha = false;
shop.needsUpdate = true;

const client = axios.create();

async function getWeather() {
    const res = await client.get<WeatherData>("https://api.open-meteo.com/v1/forecast?latitude=52.52&longitude=13.41&past_days=10&hourly=temperature_2m,relative_humidity_2m,wind_speed_10m,wind_direction_10m");
    return res.data;
}

const weather = await getWeather();
console.log(weather);

const renderer = new THREE.WebGLRenderer({
antialias: false,
});
const container = document?.getElementById("app")
renderer.setSize(container?.offsetWidth ?? 0, container?.offsetHeight ?? 0);
container?.appendChild(renderer.domElement);


const mapImageRenderer = new MapImageRenderer();
mapImageRenderer.render(scene, "map.png", 4, 4);


function drawArrows(windDirection: number, windStrength: number): Mesh[] {
    const start = new THREE.Vector3(
        mapImageRenderer.plane?.position.x || 0,
        mapImageRenderer.plane?.position.y || -1.4,
        1
    );

    const arrows: Mesh[] = [];

    // Determinar el color y el tamaño del cono según la velocidad del viento
    const color = windStrength > 10 ? 0xf55d5d : windStrength > 5 ? 0xf5c542 : 0x70c758;
    const scale = windStrength > 10 ? 0.5 : windStrength > 5 ? 0.4 : 0.3;

    // Material del cono
    const material = new THREE.MeshBasicMaterial({
        color: color,
        transparent: true,
        opacity: 0.9,
    });

    // Crear conos representando la dirección del viento
    for (let i = -12; i < 10; i++) {
        for (let j = -1; j < 10; j++) {
            const geometry = new THREE.ConeGeometry(scale/7, scale * 3/7, 32);
            const cone = new THREE.Mesh(geometry, material);

            // Posición de los conos
            cone.position.set(
                start.x + i * 0.4,
                start.y + j * 0.4,
                1
            );

            // Ajustar la rotación para que el cono apunte en la dirección del viento
            cone.rotation.z = (windDirection * Math.PI) / 180;
            //cone.rotation.x = Math.PI / 2; // Ajustar para que apunte hacia arriba

            scene.add(cone);
            arrows.push(cone);
        }
    }

    return arrows;
}

function drawShop(position : THREE.Vector3, shop_name : string){
    const geometry = new THREE.PlaneGeometry(0.13, 0.15);
    const material = new THREE.MeshMatcapMaterial({
        map: shop,
        transparent: true,
        color: new THREE.Color().setRGB(0, 0, 0)
    })
    const mesh = new THREE.Mesh(geometry, material);
    mesh.position.x = position.x
    mesh.position.y = position.y
    mesh.position.z = position.z
    scene.add(mesh)
}

function drawEntryPoint(position : THREE.Vector3){
    const geometry = new THREE.SphereGeometry(0.05)
    const material = new THREE.MeshBasicMaterial({
    color: new THREE.Color().setRGB(230, 0, 0)
    })
    const mesh = new THREE.Mesh(geometry, material);
    mesh.position.x = position.x
    mesh.position.y = position.y
    mesh.position.z = position.z

    scene.add(mesh)

}

drawShop(new THREE.Vector3(-0.9, 1.4, 0));
drawShop(new THREE.Vector3(-1.4, 1.7, 0));
drawEntryPoint(new THREE.Vector3(-0.6, 1.05, 0));
drawEntryPoint(new THREE.Vector3(-1, -1, 0));

let current_direction = 0;
let arrows : Mesh[] = []
const title = document.getElementById("time")
function animate(){
    arrows.forEach(arrow => {
        arrow.visible = false
    })
    mapImageRenderer.render(scene, "map.png", 4, 4);
    const curr = current_direction++
    title.innerHTML = weather.hourly.time[curr]

    arrows = drawArrows(
        weather.hourly.wind_direction_10m[curr],
        weather.hourly.wind_speed_10m[curr])
    renderer.render(scene, camera);
    setTimeout(animate, 1000)
}
animate()
