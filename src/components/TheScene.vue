<script setup>
  import { ref } from 'vue';
  import { randomHsl } from '../utils/color.js';

  import BoxColorChanging from './BoxColorChanging.vue';
  import TheCameraRig from './TheCameraRig.vue';
  import TheNavMesh from './TheNavMesh.vue';

  import '../aframe/life-like-automaton.js';
  import '../aframe/teleport-camera-rig.js';

  defineProps({
    scale: Number,
    overlaySelector: String,
  });

  const colorBoxLeft = ref(randomHsl());
  const colorBoxRight = ref(randomHsl());
  const allAssetsLoaded = ref(false);
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

    <a-entity
      v-if="allAssetsLoaded"
      gltf-model="#room"
      rotation="0 90 0"
      position="0 0 -5"
      scale="1 1.1 1"
    >
      <a-entity
        geometry="primitive: plane; height: 2; width: 2;"
        position="2 2 3.9"
        rotation="-180 0 0"
        life-like-automaton="resolution: 64; maxGen: 30;  birthRule: 3,4,5,6,7; survivalRule: 5,6;"
      ></a-entity>

      <a-entity
        geometry="primitive: plane; height: 2; width: 2;"
        position="2 2 -3.9"
        life-like-automaton="maxGen: 10; birthRule: 6,7,8; survivalRule: 4,5,6,7,8;"
      ></a-entity>

      <BoxColorChanging
        id="box-left"
        :scale="scale"
        :color="colorBoxLeft"
        position="7 0.5 -3"
        @click="colorBoxRight = randomHsl()"
        sound="src: #sound-1; on: click;"
      />

      <BoxColorChanging
        id="box-right"
        :scale="scale"
        :color="colorBoxRight"
        position="7 0.5 3"
        @click="colorBoxLeft = randomHsl()"
        sound="src: #sound-1; on: click;"
      />

      <a-entity
        id="portal-life"
        link="visualAspectEnabled: true; on: none; "
        clickable
        rotation="0 90 0"
        position="-7.99 1.5 0"
        life-like-automaton="resolution: 256;"
        teleport-camera-rig="y: 100;"
      >
        <a-text
          align="center"
          value="Enter the Life Cube Room"
          position="0 1.2 0"
        ></a-text>
      </a-entity>
    </a-entity>

    <a-box
      life-like-automaton="backSide: true;"
      position="0 102 0"
      depth="4" height="4" width="4"
    ></a-box>

    <TheNavMesh />

    <TheCameraRig />

  </a-scene>
</template>