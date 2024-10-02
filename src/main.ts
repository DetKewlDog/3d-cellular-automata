import './style.css';

import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/Addons.js';
import { VoxelGrid as VoxelGrid } from './voxelGrid';

const scene = new THREE.Scene()

const SIZE = 42;


// CAMERA
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.set(SIZE, SIZE + 5, SIZE);

const pointLight = new THREE.PointLight(0xffffff, 4000);
pointLight.position.set(1, 1, 2);
camera.add(pointLight);
scene.add(camera);


// RENDERER
const renderer = new THREE.WebGLRenderer({
  canvas: document.querySelector('#bg')!
});

renderer.setPixelRatio(window.devicePixelRatio);
renderer.setSize(window.innerWidth, window.innerHeight);

window.addEventListener('resize', () => {
  renderer.setSize(window.innerWidth, window.innerHeight);
});

renderer.render(scene, camera);

// const gridHelper = new THREE.GridHelper(SIZE + 10, SIZE + 10);
// gridHelper.position.add(new THREE.Vector3(0.5, -0.5, 0.5));
// scene.add(gridHelper);

const controls = new OrbitControls(camera, renderer.domElement);
const grid = new VoxelGrid(scene, SIZE + 60, SIZE, SIZE);

const glider1 = [
  [SIZE / 2 + 0, SIZE / 2 + 5, SIZE / 2 + 3],
  [SIZE / 2 + 0, SIZE / 2 + 5, SIZE / 2 + 4],
  [SIZE / 2 + 1, SIZE / 2 + 3, SIZE / 2 + 3],
  [SIZE / 2 + 1, SIZE / 2 + 3, SIZE / 2 + 4],
  [SIZE / 2 + 1, SIZE / 2 + 4, SIZE / 2 + 3],
  [SIZE / 2 + 1, SIZE / 2 + 4, SIZE / 2 + 4],
];
const glider2 = glider1.map(voxel => [grid.width - voxel[0] - 1, voxel[1], voxel[2]]);
glider1.forEach(voxel => grid.setVoxel(new THREE.Vector3(...voxel), true));
// glider2.forEach(voxel => grid.setVoxel(new THREE.Vector3(...voxel), true));


// grid.forEach(i => {
//   if (Math.random() >= 0.38) return;
//   grid.setVoxelByIndex(i, true);
// });

function animate() : void {
  requestAnimationFrame(animate);

  let nextGeneration: number[] = [];

  grid.forEach(i => {
    const alive = !!grid.getVoxelByIndex(i);

    const score = grid.getNeighborsCount(i);
    if ((alive && (score === 9)) || (!alive && score === 4)) {
      nextGeneration.push(i);
    }
  });

  grid.forEach(i => {
    grid.setVoxelByIndex(i, nextGeneration.includes(i));
  });

  controls.update();
  renderer.render(scene, camera);
}
animate();