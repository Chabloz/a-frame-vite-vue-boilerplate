<script setup>
  import { ref } from 'vue';
  import '../aframe/clickable.js';

  import TheCameraRig from './TheCameraRig.vue';
  import TheOcean from './TheOcean.vue';

  import '../aframe/my-hexagon.js';
  import '../aframe/bloom.js';

  const allAssetsLoaded = ref(false);

  setTimeout(() => {
    document.querySelector('my-hexagon').setAttribute('color', 'cyan');
  }, 10000);
</script>

<template>
  <a-scene
    background="color: #a3d0ed"
    fog="type: linear; color: #abd0ed; near: 30; far: 100"
    abloom
  >

    <a-assets @loaded="allAssetsLoaded = true">
      <img id="sky-texture" :src="`assets/citrus_orchard_road_puresky.jpg`">
      <a-asset-item id="tree-glb" src="assets/stylize_tree_lowpoly.glb"></a-asset-item>
    </a-assets>

    <template v-if="allAssetsLoaded">
      <TheOcean></TheOcean>
      <a-sky src="#sky-texture" material="fog: false"></a-sky>
      <my-hexagon position="0 4 -4" radius="2"></my-hexagon>
    </template>

    <TheCameraRig />

  </a-scene>
</template>