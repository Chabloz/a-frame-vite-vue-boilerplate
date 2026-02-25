<script setup>
  import { ref } from 'vue';
  import TheCameraRig from './TheCameraRig.vue';
  import '../aframe/hand-gestures.js';
  import '../aframe/obb-collider-ready.js';

  const allAssetsLoaded = ref(false);
</script>

<template>
  <a-scene
    background="color: black;"
    xr-mode-ui="XRMode: xr"
  >

    <a-assets @loaded="allAssetsLoaded = true">

    </a-assets>

    <template v-if="allAssetsLoaded">
      <a-box position="0 0 -2" obb-collider-ready></a-box>
      <a-box
        position="0 0 -2"
        obb-collider-ready
        @obbcollisionstarted="console.log('Entered box 2')"
      ></a-box>
    </template>

    <TheCameraRig :allAssetsLoaded="allAssetsLoaded"/>

  </a-scene>
</template>