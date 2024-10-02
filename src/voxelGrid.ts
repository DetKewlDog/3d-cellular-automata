import * as THREE from 'three';

export class VoxelGrid {
  width: number;
  height: number;
  depth: number;
  offset: THREE.Vector3;

  scene: THREE.Scene;
  geometry: THREE.BoxGeometry;
  material: THREE.Material;

  voxels: (THREE.Mesh | null)[];

  constructor(scene: THREE.Scene, width: number, height: number, depth: number) {
    this.width = width;
    this.height = height;
    this.depth = depth;

    this.offset = new THREE.Vector3(-Math.floor(width / 2), -Math.floor(height / 2), -Math.floor(depth / 2));

    this.scene = scene;

    this.geometry = new THREE.BoxGeometry(1, 1, 1);
    this.material = new THREE.MeshStandardMaterial({ color: 0xFF6347 });

    this.voxels = new Array(width * height * depth).fill(null);

    var edgeGeom = new THREE.EdgesGeometry(new THREE.BoxGeometry(width, height, depth));
    var edgeMat = new THREE.LineBasicMaterial({ color: 0x808080 });
    var edgeWf = new THREE.LineSegments(edgeGeom, edgeMat);

    this.scene.add(edgeWf);
  }

  forEach = (func: (index: number) => void) =>
    [...new Array(this.voxels.length).keys()].map(func);

  createVoxel(pos: THREE.Vector3) {
    const voxel = new THREE.Mesh(this.geometry, this.material);
    pos.add(this.offset);
    voxel.position.set(pos.x, pos.y, pos.z);
    return voxel;
  }

  posToIndex(pos: THREE.Vector3): number {
    return (this.width * this.height * pos.z) + (this.width * pos.y) + pos.x;
  }

  indexToPos(index: number): THREE.Vector3 {
    return new THREE.Vector3(
      (index % (this.width * this.height)) % this.width,
      Math.floor((index % (this.width * this.height)) / this.width),
      Math.floor(index / (this.width * this.height)),
    );
  }

  getNeighborsCount(index: number): number {
    const pos = this.indexToPos(index);
    let count: number = 0;

    for (let x = -1; x <= 1; x++) {
      for (let y = -1; y <= 1; y++) {
        for (let z = -1; z <= 1; z++) {
          if (x === 0 && y === 0 && z === 0) continue;
          if (pos.x + x < 0 || pos.x + x >= this.width  ) continue;
          if (pos.y + y < 0 || pos.y + y >= this.height ) continue;
          if (pos.z + z < 0 || pos.z + z >= this.depth  ) continue;

          const newPos = new THREE.Vector3(pos.x + x, pos.y + y, pos.z + z);
          if (!this.getVoxel(newPos)) continue;

          count++;
        }
      }
    }

    return count;
  }

  getVoxel(position: THREE.Vector3): (THREE.Mesh | null) {
    return this.getVoxelByIndex(this.posToIndex(position));
  }

  getVoxelByIndex(index: number): (THREE.Mesh | null) {
    return this.voxels[index];
  }

  setVoxel(position: THREE.Vector3, state: boolean) {
    this.setVoxelByIndex(this.posToIndex(position), state);
  }

  setVoxelByIndex(index: number, state: boolean) {
    let voxel = this.voxels[index];
    if (state === !!voxel) return;

    const position = new THREE.Vector3(
      index % (this.width * this.height) % this.width,
      Math.floor(index % (this.width * this.height) / this.width),
      Math.floor(index / (this.width * this.height)),
    );
    voxel = (state ? this.createVoxel(position) : voxel)!;
    this.scene[state ? 'add' : 'remove'](voxel);
    this.voxels[index] = state ? voxel : null;
  }
}