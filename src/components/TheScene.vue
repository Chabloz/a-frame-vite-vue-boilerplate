<script setup>
  import { onMounted, ref } from 'vue';
  import '../aframe/clickable.js';

  import TheCameraRig from './TheCameraRig.vue';
  import TheOcean from './TheOcean.vue';

  import '../aframe/my-hexagon-tessellation.js';
  import '../aframe/bloom.js';
  import '../aframe/duplicate.js';
    import '../aframe/look-at.js';

  function handleCol(){
    console.log("collision detected !");
  }

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
          color-entropy="0.1"
        ></my-hexagon-tessellation>

        <a-box
          position="7 -0.1 0"
          duplicate="rows: 6; cols: 6; gap: 0.01; entropyHeight: 0.2;"
        ></a-box>

        <a-box
          id="switch-light"
          position="0 1 -3"
          obb-collider
          @obbcollisionstarted="handleCol()"
          look-at
          animation="property: position; to: 0 1 -6; dur: 2000; easing: linear; startEvents: obbcollisionstarted"
        ></a-box>
      </a-entity>
    </template>

    <TheCameraRig />

  </a-scene>
</template>