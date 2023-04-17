import './style.css'
import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import {GUI} from "three/examples/jsm/libs/dat.gui.module";
import * as dat from 'lil-gui'

/**
 * Base
 */
// Debug
const gui = new dat.GUI()

// Canvas
const canvas = document.querySelector('canvas.webgl')

// Scene
const scene = new THREE.Scene()

/**
 * Lights
 */
// Ambient light
const ambientLight = new THREE.AmbientLight()
ambientLight.color = new THREE.Color(0xffffff)
ambientLight.intensity = 0.5
scene.add(ambientLight);


// Point light
const pointLight = new THREE.PointLight(0xff9000, 0.5, 10, 2)
pointLight.position.set(1, - 0.5, 1)
scene.add(pointLight)


/**
 * Objects
 */
// Material
const material = new THREE.MeshStandardMaterial({wireframe: true, side: THREE.DoubleSide})
material.roughness = 0.4;

// Objects
const sphere = new THREE.Mesh(
    new THREE.SphereGeometry(0.5, 32, 32),
    material
)
sphere.position.x = - 1.5

const plane = new THREE.Mesh(
    new THREE.PlaneGeometry(5, 5),
    material
)
plane.rotation.x = - Math.PI * 0.5
plane.position.y = - 0.65

scene.add(sphere, plane);

/**
 *********************************************************** Skeletons
 */


/**
 * Sizing
 * */
const segmentHeight = 8;
const segmentCount = 4;
const height = segmentHeight * segmentCount;
const halfHeight = height * 0.5;

const sizing = {
    segmentHeight: segmentHeight,
    segmentCount: segmentCount,
    height: height,
    halfHeight: halfHeight
};

//   +----o----+ <- bone3       (y =  12)
//   |         |
//   |    o    | <- bone2       (y =   4)
//   |         |
//   |    o    | <- bone1       (y =  -4)
//   |         |
//   +----oo---+ <- root, bone0 (y = -12)



const bones = [];

let prevBone = new THREE.Bone();
bones.push(prevBone);
prevBone.position.y = - sizing.halfHeight;

for ( let i = 0; i < sizing.segmentCount; i ++ ) {

    const bone = new THREE.Bone();
    bone.position.y = sizing.segmentHeight;
    bones.push( bone );
    prevBone.add( bone );
    prevBone = bone;

}

const geometry = new THREE.CylinderGeometry( 5, 5, sizing.height, 5, sizing.segmentCount * 3, true );

//scene.add(mesh2);


const position = geometry.attributes.position;

const vertex = new THREE.Vector3();

const skinIndices = [];
const skinWeights = [];

for ( let i = 0; i < position.count; i ++ ) {

	vertex.fromBufferAttribute( position, i );

	//compute skinIndex and skinWeight based on some configuration data
	const y = ( vertex.y + sizing.halfHeight );

	const skinIndex = Math.floor( y / sizing.segmentHeight );
	const skinWeight = ( y % sizing.segmentHeight ) / sizing.segmentHeight;

	skinIndices.push( skinIndex, skinIndex + 1, 0, 0 );
	skinWeights.push( 1 - skinWeight, skinWeight, 0, 0 );

}

geometry.setAttribute( 'skinIndex', new THREE.Uint16BufferAttribute( skinIndices, 4 ) );
geometry.setAttribute( 'skinWeight', new THREE.Float32BufferAttribute( skinWeights, 4 ) );

// create skinned mesh and skeleton

const mesh = new THREE.SkinnedMesh( geometry, material );
const skeleton = new THREE.Skeleton( bones );

// see example from THREE.Skeleton

const rootBone = skeleton.bones[ 0 ];
mesh.add( rootBone );


// bind the skeleton to the mesh
mesh.bind( skeleton );

const helper = new THREE.SkeletonHelper( mesh );
scene.add( helper );

scene.add(mesh);

console.log(mesh);

/****************************************************** End of Skeletons */

/**
 * Sizes
 */
const sizes = {
    width: window.innerWidth,
    height: window.innerHeight
}

window.addEventListener('resize', () =>
{
    // Update sizes
    sizes.width = window.innerWidth
    sizes.height = window.innerHeight

    // Update camera
    camera.aspect = sizes.width / sizes.height
    camera.updateProjectionMatrix()

    // Update renderer
    renderer.setSize(sizes.width, sizes.height)
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
})

/**
 * Camera
 */
// Base camera
const camera = new THREE.PerspectiveCamera(75, sizes.width / sizes.height, 0.1, 100);
camera.position.x = 1
camera.position.y = 1
camera.position.z = 2
scene.add(camera)

// Controls
const controls = new OrbitControls(camera, canvas)
controls.enableDamping = true

/**
 * Renderer
 */
const renderer = new THREE.WebGLRenderer({
    canvas: canvas
})
renderer.setSize(sizes.width, sizes.height)
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))

/**
 * Animate
 */
const clock = new THREE.Clock()

const tick = () =>
{
    const elapsedTime = clock.getElapsedTime();


    // Updating the skeleton
    skeleton.bones[ 0 ].rotation.x = THREE.Math.degToRad( 90*Math.cos(3*elapsedTime) );
    skeleton.bones[ 1 ].rotation.x = THREE.Math.degToRad( 90*Math.cos(3*elapsedTime) );
    skeleton.bones[ 2 ].rotation.x = THREE.Math.degToRad( 90*Math.cos(3*elapsedTime) );
    skeleton.bones[ 3 ].rotation.x = THREE.Math.degToRad( 90*Math.cos(3*elapsedTime) );

    //console.log(skeleton.bones[2].rotation.x);

    // Update controls
    controls.update()

    // Render
    renderer.render(scene, camera)

    // Call tick again on the next frame
    window.requestAnimationFrame(tick)
}

tick()
