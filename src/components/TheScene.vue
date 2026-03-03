<script setup>
  import { ref } from 'vue';
  import TheCameraRig from './TheCameraRig.vue';
  import '../aframe/hand-gestures.js';
  import '../aframe/listen-to.js';
  import '../aframe/event-set.js';

  const allAssetsLoaded = ref(false);
</script>

<template>
  <a-scene
    background="color: black;"
    xr-mode-ui="XRMode: xr"
  >

    <a-assets @loaded="allAssetsLoaded = true">
    </a-assets>

    <template v-if="allAssetsLoaded">
      <a-box position="2 0 -2"></a-box>

      <!-- Circle gesture debug box -->
      <a-box
        id="circle-debug"
        position="-2 0 -2"
        color="red"
        visible="false"
        listen-to="target: #hand-right; event: circle-shape; emit: circle-shape"
        listen-to__hide="target: #hand-right; event: circle-shape-end; emit: circle-shape-end"
        event-set="event: circle-shape; attribute: visible; value: true"
        event-set__hide="event: circle-shape-end; attribute: visible; value: false"
      ></a-box>

      <!-- Triangle gesture debug box -->
      <a-box
        id="triangle-debug"
        position="-3 0 -2"
        color="blue"
        visible="false"
        listen-to="target: #hand-right; event: triangle-shape; emit: triangle-shape"
        listen-to__hide="target: #hand-right; event: triangle-shape-end; emit: triangle-shape-end"
        event-set="event: triangle-shape; attribute: visible; value: true"
        event-set__hide="event: triangle-shape-end; attribute: visible; value: false"
      ></a-box>
    </template>

    <TheCameraRig :allAssetsLoaded="allAssetsLoaded"/>

  </a-scene>
</template>