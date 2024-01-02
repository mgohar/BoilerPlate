import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import { TransformControls } from "three/examples/jsm/controls/TransformControls.js";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader";

//===================================================== SHADERS
const vertexShader = `
varying vec2 vUv;
varying float vDistance;
  void main() {
    vUv = uv;
    vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    vDistance = -mvPosition.z; 
  }
`;

const fragmentShader = `
  uniform sampler2D cityTexture;
  varying vec2 vUv;
  uniform float opacity;
  varying float vDistance;

  void main() {
    float opacityT = clamp(5.4 - (vDistance / 2.0), 0.0, 1.0);
    vec4 color = texture2D(cityTexture, vUv);
    color.a *= opacityT*opacity;

    gl_FragColor = color; // Adjust the color as needed
  }
`;

//===================================================== Variables
let canvas,
  gltfloader = new GLTFLoader(),
  WIDTH = window.innerWidth,
  HEIGHT = window.innerHeight;

canvas = document.querySelector(".canvas");
gltfloader = new GLTFLoader();

//===================================================== Create a WebGL renderer
var renderer = new THREE.WebGLRenderer({
  canvas: canvas,
  powerPreference: "high-performance",
  alpha: false,
  antialias: true,
  stencil: false,
  depth: true,
});
renderer.setSize(window.innerWidth, window.innerHeight);
//===================================================== Create an empty scene
var scene = new THREE.Scene();
// scene.background=new THREE.TextureLoader().load("/city_bg.jpg");
//===================================================== Create a perpsective camera
var camera = new THREE.PerspectiveCamera(45, WIDTH / HEIGHT, 0.001, 1000);
camera.position.z = 0.5;

//===================================================== Orbit Controls
const orbitControls = new OrbitControls(camera, canvas);
orbitControls.enableDamping = true;
//===================================================== Resize
window.addEventListener("resize", function () {
  renderer.setSize(window.innerWidth, window.innerHeight);
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
});

//===================================================== Create a mesh
// const boxGeometry = new THREE.BoxGeometry(1, 1, 1);
// const boxMaterial = new THREE.MeshBasicMaterial({ color: "red" });
// const box = new THREE.Mesh(boxGeometry, boxMaterial);
// scene.add(box);

gltfloader.load("src/GLTF/slipper/scene.gltf", (gltf) => {
  // Access the loaded model
  const model = gltf.scene;

  // Access the color texture
  const colorTexture = new THREE.TextureLoader().load(
    "src/GLTF/slipper/textures/DModel4nil1_baseColor.jpeg"
  );
  // Set the color texture for the material
  model.traverse((node) => {
    if (node.isMesh) {
      // node.material.map = colorTexture;
    }
  });

  // Access the metallic-roughness texture
  const metallicRoughnessTexture = new THREE.TextureLoader().load(
    "src/GLTF/slipper/textures/DModel4nil1_metallicRoughness.png"
  );
  // Set the metallic-roughness texture for the material
  model.traverse((node) => {
    if (node.isMesh) {
      node.material.metalnessMap = metallicRoughnessTexture;
      node.material.roughnessMap = metallicRoughnessTexture;
    }
  });

  // Access the normal texture
  const normalTexture = new THREE.TextureLoader().load(
    "src/GLTF/slipper/textures/DModel4nil1_normal.png"
  );
  // Set the normal texture for the material
  model.traverse((node) => {
    if (node.isMesh) {
      node.material.normalMap = normalTexture;
    }
  });

  // Add the loaded model to the scene
  scene.add(model);
});

//===================================================== Create a point light in our scene
var light = new THREE.PointLight(new THREE.Color("white"), 10, 10);
var ambientLight = new THREE.AmbientLight("#ffffff", 10);
scene.add(ambientLight);

//===================================================== Animate

const clock = new THREE.Clock();

function Animation() {
  const elapsedTime = clock.getElapsedTime();
  renderer.render(scene, camera);
  requestAnimationFrame(Animation);
}

Animation();
//===================================================== TransformControls

function TControl(name, type = "P", group = true) {
  let tControl = new TransformControls(camera, renderer.domElement);
  tControl.addEventListener("dragging-changed", (event) => {
    orbitControls.enabled = !event.value;
  });
  tControl.attach(name);
  scene.add(tControl);

  tControl.addEventListener("change", () => {
    // The object's position has changed
    const newPosition = name.position;
    const newRotate = name.rotation;
    const newScale = name.scale;
    type == "R"
      ? (console.log("New Rotation:", {
          x: parseFloat(newRotate.x.toFixed(2)),
          y: parseFloat(newRotate.y.toFixed(2)),
          z: parseFloat(newRotate.z.toFixed(2)),
        }),
        tControl.setMode("rotate"))
      : type == "S"
      ? (console.log("New Scale:", {
          x: parseFloat(newScale.x.toFixed(2)),
          y: parseFloat(newScale.y.toFixed(2)),
          z: parseFloat(newScale.z.toFixed(2)),
        }),
        tControl.setMode("scale"))
      : (console.log("New Position:", {
          x: parseFloat(newPosition.x.toFixed(2)),
          y: parseFloat(newPosition.y.toFixed(2)),
          z: parseFloat(newPosition.z.toFixed(2)),
        }),
        tControl.setMode("translate"));
  });
}
//===================================================== Debugger

const axesHelper = new THREE.AxesHelper(1000); // Adjust the size as needed
// scene.add(axesHelper);

//===================================================== Other function
