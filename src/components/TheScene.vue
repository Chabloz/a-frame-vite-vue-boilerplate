<script setup>
  import { ref } from 'vue';

  import TheCameraRig from './TheCameraRig.vue';
  import '../aframe/tesselation-square.js';
  import '../aframe/emit-when-near.js';
  import '../aframe/event-set.js';
  import '../aframe/listen-to.js';
  import '../aframe/simple-grab.js';
  import '../aframe/clickable.js';

  const allAssetsLoaded = ref(false);

  function collision(event) {
    console.log('collision', event.detail);
  }

</script>

<template>
  <a-scene
    fog="type: linear; color: #a3d0ed; near: 30; far: 60"
    background="color: #a3d0ed;"
  >

    <a-assets @loaded="allAssetsLoaded = true">

    </a-assets>

    <template v-if="allAssetsLoaded">

      <a-sphere
        id="sphere-box-1"
        position="0 0 -5"
        emit-when-near="distance: 2"
        color="blue"
        @click="collision($event)"
        event-set__change-when-near="attribute: color; value: red"
        event-set__change-when-far="event: unclick; attribute: color; value: blue"
      ></a-sphere>

      <a-sphere
        position="10 0 -5"
        color="green"
        listen-to="target: #sphere-box-1;"
        event-set="attribute: color; value: red"
      ></a-sphere>

      <a-box
        obb-collider
        id="radio"
        position="-2 0 -3"
        scale="2 2 2"
        color="red"
        visible="true"
        event-set="event: obbcollisionstarted; attribute: visible; value: false"
      ></a-box>

      <a-box
        obb-collider
        id="power"
        position="2 0 -3"
        scale="0.2 0.2 0.2"
        color="green"
        simple-grab
        clickable
      ></a-box>

      <a-plane position="0 0 -5" rotation="-90 0 0" width="100" height="100" color="#7bc8a4"></a-plane>

    </template>

    <TheCameraRig />

  </a-scene>
</template>