<script setup>
  import { ref } from 'vue';
  import { randomHsl } from '../utils/color.js';

  import BoxColorChanging from './BoxColorChanging.vue';
  import TheCameraRig from './TheCameraRig.vue';
  import TheNavMesh from './TheNavMesh.vue';

  import '../aframe/life-like-automaton';

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
        Title: VR exhibition gallery baked
        Model source: https://sketchfab.com/3d-models/vr-exhibition-gallery-baked-ee6f3b0d9db14b62a1b3aeef04315313
        Model author: https://sketchfab.com/ida61xq (ChristyHsu)
        Model license: CC BY 4.0 ( https://creativecommons.org/licenses/by/4.0/ )
      -->
      <a-asset-item  id="room" src="assets/room.glb"></a-asset-item>
    </a-assets>

    <a-entity
      v-if="allAssetsLoaded"
      gltf-model="#room"
      rotation="0 90 0"
      position="0 0 5"
      scale="0.25 .35 0.25"
    ></a-entity>
    <a-entity
      geometry="primitive: plane; height: 11; width:11"
      position="0 2.5 -10"
      life-like-automaton="resolution: 512; genPerSec: 25;"
    ></a-entity>

    <BoxColorChanging
      id="box-left"
      :scale="scale"
      :color="colorBoxLeft"
      position="-3 0.5 -7"
      @click="colorBoxRight = randomHsl()"
    />
    <BoxColorChanging
      id="box-right"
      :scale="scale"
      :color="colorBoxRight"
      position="3 0.5 -7"
      @click="colorBoxLeft = randomHsl()"
    />

    <TheNavMesh />

    <TheCameraRig />

  </a-scene>
</template>