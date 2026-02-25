<script setup>
  import { ref } from 'vue';
  import TheCameraRig from './TheCameraRig.vue';
  import '../aframe/hand-gestures.js';

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
      <a-box position="2 0 -2"></a-box>
    </template>

    <TheCameraRig :allAssetsLoaded="allAssetsLoaded"/>

  </a-scene>
</template>