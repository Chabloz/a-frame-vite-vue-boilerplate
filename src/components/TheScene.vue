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
      <a-asset-item id="optimerBoldFont" src="https://supermedium.com/superframe/components/text-geometry/examples/vaporwave/fonts/dawningOfANewDayRegular.typeface.json"></a-asset-item>
      <a-asset-item id="optimerBoldFont2" src="https://supermedium.com/superframe/components/text-geometry/examples/vaporwave/fonts/exo2BlackItalic.typeface.json"></a-asset-item>

    </a-assets>

    <template v-if="allAssetsLoaded">
      <a-box position="2 0 -2"></a-box>
      <a-entity position="-2 0 -3" text-geometry="value: Whats up; font: #optimerBoldFont2"></a-entity>
    </template>

    <TheCameraRig :allAssetsLoaded="allAssetsLoaded"/>

  </a-scene>
</template>