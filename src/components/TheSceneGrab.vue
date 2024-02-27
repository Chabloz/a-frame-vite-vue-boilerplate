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
    <a-assets @loaded="allAssetsLoaded = true"> </a-assets>

    <template v-if="allAssetsLoaded">
      <a-entity camera look-controls position="0 1.6 0">
        <a-entity
          id="mainDroite"
          oculus-touch-controls="hand: right"
        ></a-entity>
        <a-entity id="mainGauche" oculus-touch-controls="hand: left"></a-entity>

        <!-- Objet à attraper -->
        <a-entity
          id="item"
          geometry="primitive: box"
          position="0 1.5 -3"
          material="color: yellow; opacity: 0.5"
          collision-detection
        ></a-entity>

        <!-- Zone de dépôt -->
        <a-entity
          id="deposit-zone"
          geometry="primitive: box"
          position="2 1 -5"
          material="color: green; opacity: 0.5"
          collision-detection
        ></a-entity>

        <a-entity
          id="held-item"
          geometry="primitive: box"
          position="0 -0.5 -1"
          material="color: red"
        ></a-entity>
      </a-entity>
    </template>

    <TheCameraRig />
  </a-scene>
</template>
