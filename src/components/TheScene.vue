<script setup>
  import { ref } from 'vue';
  import '../aframe/clickable.js';

  import TheCameraRig from './TheCameraRig.vue';
import TheOcean from './TheOcean.vue';

  const allAssetsLoaded = ref(false);
  const color = ref('tomato');
</script>

<template>
  <a-scene
    background="color: #a3d0ed"
    fog="type: linear; color: #a3d0ed; near: 30; far: 60"
  >

    <a-assets @loaded="allAssetsLoaded = true">

    </a-assets>

    <template v-if="allAssetsLoaded">
      <TheOcean></TheOcean>
    </template>

    <TheCameraRig />

  </a-scene>
</template>