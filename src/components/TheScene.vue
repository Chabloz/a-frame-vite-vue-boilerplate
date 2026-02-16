<script setup>
  import { ref } from 'vue';
  import '../aframe/clickable.js';

  import TheCameraRig from './TheCameraRig.vue';

  const allAssetsLoaded = ref(false);
  const color = ref('tomato');
</script>

<template>
  <a-scene
    background="color: black;"
  >

    <a-assets @loaded="allAssetsLoaded = true">

    </a-assets>

    <template v-if="allAssetsLoaded">
      <a-box
        position="0 0 -5"
        :color="color"
        clickable
        @click="color = 'blue'"
      ></a-box>
    </template>

    <TheCameraRig />

  </a-scene>
</template>