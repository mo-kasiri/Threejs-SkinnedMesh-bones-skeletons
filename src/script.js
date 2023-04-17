import './style.css'
import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import * as dat from 'lil-gui'
import { RectAreaLightHelper } from 'three/examples/jsm/helpers/RectAreaLightHelper.js'

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
scene.add(ambientLight)


// Point light
const pointLight = new THREE.PointLight(0xff9000, 0.5, 10, 2)
pointLight.position.set(1, - 0.5, 1)
scene.add(pointLight)


/**
 * Objects
 */
// Material
const material = new THREE.MeshStandardMaterial()
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


const axesHelper = new THREE.AxesHelper(10);
scene.add(axesHelper);

// defining bones
const bones = [new THREE.Bone(), new THREE.Bone()];
bones[0].add(bones[1]);
bones[0].position.y = -2.5;
bones[1].position.y = 2.5;


const geometry = new THREE.CylinderGeometry( 1, 1, 5, 5, 15, 5, 30 );

const geometry2 = new THREE.CylinderGeometry( 1, 1, 5, 5, 15, 5, 30 );
const material2 = new THREE.MeshBasicMaterial({color: 'red'});
const mesh2 = new THREE.Mesh(geometry2, material2);

//scene.add(mesh2);


const position = geometry.attributes.position;

console.log("this is position ");
console.log(position);

const vertex = new THREE.Vector3();

const skinIndices = [];
const skinWeights = [];

for ( let i = 0; i < position.count; i ++ ) {

	vertex.fromBufferAttribute( position, i );

	//compute skinIndex and skinWeight based on some configuration data

	//const y = ( vertex.y + sizing.halfHeight );
	const y = ( vertex.y + 2.5 );

	//const skinIndex = Math.floor( y / sizing.segmentHeight );
	const skinIndex = Math.floor( y / 5 );
	//const skinWeight = ( y % sizing.segmentHeight ) / sizing.segmentHeight;
	const skinWeight = ( y % 5 ) / 5;

	skinIndices.push( skinIndex, skinIndex + 1, 0, 0 );
	skinWeights.push( 1 - skinWeight, skinWeight, 0, 0 );

}

// for( let i = 0; i<position.count; i++ )
// {
//     let k = THREE.Math.mapLinear( position.getY( i ), -2.5, 2.5, 1, 0 );
//
//     skinIndices.push( 0, 1, 0, 0 );
//     skinWeights.push( k, 1-k, 0, 0 );
// }

console.log(skinIndices);

geometry.setAttribute( 'skinIndex', new THREE.Uint16BufferAttribute( skinIndices, 4 ) );
geometry.setAttribute( 'skinWeight', new THREE.Float32BufferAttribute( skinWeights, 4 ) );

// create skinned mesh and skeleton

const mesh = new THREE.SkinnedMesh( geometry, material );
const skeleton = new THREE.Skeleton( bones );

// see example from THREE.Skeleton

const rootBone = skeleton.bones[ 0 ];
mesh.add( rootBone );

// bind the skeleton to the mesh
const helper = new THREE.SkeletonHelper( mesh );
scene.add( helper );


mesh.bind( skeleton );

scene.add(mesh);



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
    skeleton.bones[ 1 ].rotation.x = THREE.Math.degToRad( 110*Math.sin(3*elapsedTime) );

    //console.log(skeleton.bones[0]);

    // Update controls
    controls.update()

    // Render
    renderer.render(scene, camera)

    // Call tick again on the next frame
    window.requestAnimationFrame(tick)
}

tick()