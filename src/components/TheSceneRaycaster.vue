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

      <!-- Définir des entités cibles avec des attributs near et far -->
      <a-entity near="1" far="10" position="0 1 -3">
        <!-- Contenu de l'entité -->
      </a-entity>

      <a-entity near="5" far="15" position="2 1 -5">
        <!-- Contenu de l'entité -->
      </a-entity>
    </template>

    <TheCameraRig />
  </a-scene>
</template>
