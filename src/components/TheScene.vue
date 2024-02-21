<script setup>
  import { ref } from 'vue';

  import TheCameraRig from './TheCameraRig.vue';
  import TheLifeCubeRoom from './TheLifeCubeRoom.vue';
  import '../aframe/pavageCarre.js';

  defineProps({
    scale: Number,
    overlaySelector: String,
  });

  const allAssetsLoaded = ref(false);
</script>

<template>
  <a-scene stats background="color: #a3d0ed" fog="type: linear; color: #a3d0ed; near: 30; far: 60">
    
      <a-ocean depth="100" width="100" amplitude="0" amplitude-variance="0.1" opacity="1" density="50" ></a-ocean>
      <a-ocean depth="100" width="100" opacity="0.5" amplitude="0" amplitude-variance="0.15" density="50" ></a-ocean>
      <a-entity light="type: ambient; color: #326b80"></a-entity>
      <a-entity light="type: point; intensity: 2" position="0 2 -10"></a-entity>

      <a-box 
        pavageCarre

      ></a-box>
     


    <TheCameraRig />

  </a-scene>
</template>