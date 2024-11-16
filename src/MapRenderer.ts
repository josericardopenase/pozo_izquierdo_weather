import * as THREE from "three";

type Bounds = {
    minlat: number;
    maxlat: number;
    minlon: number;
    maxlon: number;
};

class MapRenderer {
    private nodes: Element[] = [];
    private bounds!: Bounds;

    constructor(private osmPath: string, private onLoad: (objects: THREE.Object3D[]) => void) {
        this.loadOSM();
    }

    private async loadOSM(): Promise<void> {
        const text = await fetch(this.osmPath).then(res => res.text());
        const xmlDoc = new DOMParser().parseFromString(text, "text/xml");

        this.bounds = this.getBounds(xmlDoc);
        this.nodes = Array.from(xmlDoc.getElementsByTagName("node"));

        const objects: THREE.Object3D[] = Array.from(xmlDoc.getElementsByTagName("way"))
            .filter(way => this.isInterest(way))
            .flatMap(way => this.createObjectFromWay(way));

        this.onLoad(objects);
    }

    private getBounds(xmlDoc: Document): Bounds {
        const boundsElement = xmlDoc.getElementsByTagName("bounds")[0];
        return {
            minlat: parseFloat(boundsElement.getAttribute("minlat")!),
            maxlat: parseFloat(boundsElement.getAttribute("maxlat")!),
            minlon: parseFloat(boundsElement.getAttribute("minlon")!),
            maxlon: parseFloat(boundsElement.getAttribute("maxlon")!),
        };
    }

    private isInterest(way: Element): boolean {
        const tags = Array.from(way.getElementsByTagName("tag"));
        return tags.some(tag => ["highway", "building"].includes(tag.getAttribute("k")!));
    }

    private createObjectFromWay(way: Element): THREE.Object3D[] {
        const points = Array.from(way.getElementsByTagName("nd"))
            .map(nd => this.getNodeCoords(nd.getAttribute("ref")!))
            .filter((p): p is THREE.Vector3 => p !== null);

        if (!points.length) return [];

        const tags = Array.from(way.getElementsByTagName("tag"));
        return tags.some(tag => tag.getAttribute("k") === "building")
            ? [this.createBuilding(points)]
            : [this.createLine(points)];
    }

    private getNodeCoords(ref: string): THREE.Vector3 | null {
        const node = this.nodes.find(n => n.getAttribute("id") === ref);
        if (!node) return null;

        const lat = parseFloat(node.getAttribute("lat")!);
        const lon = parseFloat(node.getAttribute("lon")!);
        const x = this.mapRange(lon, this.bounds.minlon, this.bounds.maxlon, -5, 5);
        const y = this.mapRange(lat, this.bounds.minlat, this.bounds.maxlat, -5, 5);
        return new THREE.Vector3(x, y, 0);
    }

    private createLine(points: THREE.Vector3[]): THREE.Line {
        const geometry = new THREE.BufferGeometry().setFromPoints(points);
        const material = new THREE.LineBasicMaterial({ color: 0x0000ff });
        return new THREE.Line(geometry, material);
    }

    private createBuilding(points: THREE.Vector3[]): THREE.Mesh {
        const shape = new THREE.Shape(points.map(p => new THREE.Vector2(p.x, p.y)));
        const geometry = new THREE.ExtrudeGeometry(shape, { depth: 0.2, bevelEnabled: false });
        const material = new THREE.MeshBasicMaterial({ color: Math.random() * 0xffffff });
        return new THREE.Mesh(geometry, material);
    }

    private mapRange(val: number, vmin: number, vmax: number, dmin: number, dmax: number): number {
        return dmin + ((val - vmin) * (dmax - dmin)) / (vmax - vmin);
    }
}

export default MapRenderer;
