<script setup>
  import { ref } from 'vue';
  import '../aframe/clickable.js';

  import TheCameraRig from './TheCameraRig.vue';
  import TheOcean from './TheOcean.vue';

  import '../aframe/my-hexagon-tessellation.js';
  import '../aframe/bloom.js';
  import '../aframe/duplicate.js';

  const allAssetsLoaded = ref(false);
</script>

<template>
  <a-scene
    background="color: #a3d0ed"
    fog="type: linear; color: #abd0ed; near: 30; far: 100"
    abloom
  >

    <a-assets @loaded="allAssetsLoaded = true">
      <img id="sky-texture" :src="`assets/citrus_orchard_road_puresky.jpg`">
      <a-asset-item id="hill-glb" src="assets/mini_hill_1.glb"></a-asset-item>
    </a-assets>

    <template v-if="allAssetsLoaded">
      <a-sky
        src="#sky-texture"
        material="fog: false"
      ></a-sky>



      <TheOcean></TheOcean>

      <a-entity data-role="nav-mesh">
        <a-entity
          position="0 -.5 -6.5"
          duplicate="gltf: #hill-glb; entropy: 1; gap: 0; rows: 5; cols: 5;"
          gltf-model="#hill-glb"
          scale="0.35 0.35 0.35"
        ></a-entity>

        <my-hexagon-tessellation
          position="0 -0.1 0"
          radius="4"
          height="0.5"
          color-entropy="0.5"
        ></my-hexagon-tessellation>

        <a-box
          position="7 -0.1 0"
          duplicate="rows: 6; cols: 6; gap: 0.01; entropyHeight: 0.2;"
        ></a-box>
      </a-entity>
    </template>

    <TheCameraRig />

  </a-scene>
</template>