<script setup>
import { ref } from "vue";

import TheCameraRig from "./TheCameraRig.vue";

const allAssetsLoaded = ref(false);
</script>

<template>
  <a-scene
    background="color: #262626;"
    :webxr="`
      requiredFeatures: local-floor;
      referenceSpaceType: local-floor;
    `"
    xr-mode-ui="XRMode: xr"
    stats
  >
    <a-assets @loaded="allAssetsLoaded = true"> </a-assets>

    <template v-if="allAssetsLoaded">
      <a-plane
        rotation="-90 0 0"
        color="#323232"
        width="8"
        height="8"
      ></a-plane>
    </template>

    <a-camera draw-tube></a-camera>
    <!-- <TheCameraRig /> -->
  </a-scene>
</template>
