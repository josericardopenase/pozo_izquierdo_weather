import * as THREE from "three";

class MapImageRenderer {
    private textureLoader: THREE.TextureLoader;
    public plane : THREE.Mesh | null;

    constructor() {
        this.textureLoader = new THREE.TextureLoader();
        this.plane = null;
    }

    render(scene: THREE.Scene, imagePath: string, width: number, height: number): void {
        this.textureLoader.load(imagePath, (texture) => {
            const geometry = new THREE.PlaneGeometry(width, height);
            const material = new THREE.MeshBasicMaterial({ map: texture });
            this.plane = new THREE.Mesh(geometry, material);

            this.plane.rotation.x = 0; // Coloca el plano horizontalmente en el eje XZ
            this.plane.position.y = 0; // Coloca el plano ligeramente debajo de los edificios

            scene.add(this.plane);
        });
    }
}

export default MapImageRenderer;
