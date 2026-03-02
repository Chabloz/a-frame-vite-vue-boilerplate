<script setup>
  import '../aframe/disable-in-vr.js';
  import '../aframe/hide-in-vr.js';
  import '../aframe/simple-navmesh-constraint.js';
  import '../aframe/blink-controls.js';
  import '../aframe/physx-grab.js';
  import '../aframe/hand-gestures.js';

  defineProps({
    allAssetsLoaded: Boolean,
  });
</script>

<template>
  <a-entity id="camera-rig">
      <a-entity
        id="head"
        camera
        position="0 1.65 0"
      ></a-entity>

      <a-entity
        id="hand-left"
        hand-controls="hand: left"
        _hand-tracking-controls="hand: left; modelOpacity: 0.5"
        hand-gestures
      ></a-entity>

      <a-entity
        id="hand-right"
        hand-controls="hand: right"
        _hand-tracking-controls="hand: right; modelOpacity: 0.5"
        hand-gestures
      ></a-entity>

  </a-entity>
</template>