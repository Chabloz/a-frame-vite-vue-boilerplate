<script setup>
  import { ref, watch } from 'vue';

  import TheCameraRig from './TheCameraRig.vue';
  import TheNavMesh from './TheNavMesh.vue';
  import TheMainRoom from './TheMainRoom.vue';
  import TheLifeCubeRoom from './TheLifeCubeRoom.vue';

  import '../aframe/life-like-automaton.js';
  import '../aframe/teleport-camera-rig.js';

  defineProps({
    scale: Number,
    overlaySelector: String,
  });

  const allAssetsLoaded = ref(false);

  // const angleAzimuth = Math.random() * 2 * Math.PI;
  // const angleElevation = Math.random() * Math.PI/4;
  // const vectNormal = new THREE.Vector3(1,1,1);
  // const quat1 = new THREE.Quaternion();
  // quat1.setFromEuler(new THREE.Euler(0 , angleAzimuth, 0));
  // const quat2 = new THREE.Quaternion();
  // quat2.setFromEuler(new THREE.Euler(angleElevation, 0, 0));
  // quat1.multiply(quat2);
  // vectNormal.applyQuaternion(quat1);
  // console.log(vectNormal);
  // vectNormal.multiplyScalar(10);
  // console.log(vectNormal);

  const points = (new THREE.SphereGeometry(10,15,30,0,Math.PI)).attributes.position.array;
  const vectorsOnSphere = new Map();
  for (let i = 0; i < points.length; i += 3) {
    vectorsOnSphere.set(`${points[i]}-${points[i+1]}-${points[i+2]}`, new THREE.Vector3(points[i], points[i+1], points[i+2]));
  }
  const randomPoints = [...vectorsOnSphere.values()];
  console.log(randomPoints);
  // shuffle the random points with Fisher-Yates
  for (let i = randomPoints.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [randomPoints[i], randomPoints[j]] = [randomPoints[j], randomPoints[i]];
  }
  watch(allAssetsLoaded, (newVal) => {
    if (newVal) {
      for (let i=0; i<40; i++) {
        const vect3 = randomPoints[i];
        const sphere = document.createElement('a-sphere');
        sphere.setAttribute('position', `${vect3.x} ${vect3.y} ${vect3.z}`);
        sphere.setAttribute('radius', '1');
        sphere.setAttribute('color', 'red');
        document.querySelector('#stars').appendChild(sphere);
      }
    }
  });
</script>

<template>
  <a-scene
    background="color: black;"
    renderer="colorManagement: true;"
    :webxr="`
      requiredFeatures: local-floor;
      referenceSpaceType: local-floor;
      optionalFeatures: dom-overlay;
      overlayElement: ${overlaySelector};
    `"
  >
    <a-entity id="stars" rotation="-90 0 0"></a-entity>

    <a-assets @loaded="allAssetsLoaded = true">
      <!--
        Title: VR Gallery
        Model source: https://sketchfab.com/3d-models/vr-gallery-1ac32ed62fdf424498acc146fad31f7e
        Model author: https://sketchfab.com/mvrc.art (Maxim Mavrichev)
        Model license: CC BY 4.0 ( https://creativecommons.org/licenses/by/4.0/ )
      -->
      <a-asset-item id="room" src="assets/vr_gallery.glb"></a-asset-item>
      <a-asset-item id="sound-1" response-type="arraybuffer" src="assets/sound1.mp3" preload="auto"></a-asset-item>
    </a-assets>

    <template v-if="allAssetsLoaded">
      <TheMainRoom :scale="scale" />
      <TheLifeCubeRoom />
    </template>

    <TheNavMesh />

    <TheCameraRig />

  </a-scene>
</template>