<script setup>
import { ref } from "vue";

import TheCameraRig from "./TheCameraRig.vue";

const allAssetsLoaded = ref(false);
</script>

<template>
  <a-scene
    background="color: SteelBlue;"
    :webxr="`
      requiredFeatures: local-floor;
      referenceSpaceType: local-floor;
    `"
    xr-mode-ui="XRMode: xr"
  >
    <a-assets @loaded="allAssetsLoaded = true">
      <!-- <img
        id="car-texture"
        :src="`assets/stylized_beetle_car/textures/body_emissive.png`"
      /> -->
      <a-asset-item
        id="car-model"
        :src="`assets/low_poly_rocks/scene.gltf`"
      ></a-asset-item>
    </a-assets>

    <template v-if="allAssetsLoaded">
      <a-light type="ambient" color="#f6f6f6"></a-light>
      <a-light type="directional" color="#FFFFFF" position="2 4 -2"></a-light>

      <a-plane
        position="0 -0.05 -4"
        rotation="-90 0 0"
        color="grey"
        width="7"
        height="7"
      ></a-plane>

      <a-entity
        position="0 0.5 -4"
        gltf-model="#car-model"
        id="the-car"
      ></a-entity>
    </template>

    <TheCameraRig />
  </a-scene>
</template>
