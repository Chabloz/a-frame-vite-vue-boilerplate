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

  function onShapeCircle() {
    const box = document.createElement('a-box');
    box.setAttribute('position', '-1 1 -2');
    box.setAttribute('color', '#FF0000');
    document.querySelector('a-scene').appendChild(box);
    setTimeout(() => {
      box.parentNode.removeChild(box);
    }, 1000);
  }
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
        hand-tracking-controls="hand: left; modelOpacity: 0.5"
        hand-gestures
      ></a-entity>

      <a-entity
        id="hand-right"
        hand-tracking-controls="hand: right; modelOpacity: 0.5"
        hand-gestures
        @shape-circle="onShapeCircle()"
      ></a-entity>

  </a-entity>
</template>