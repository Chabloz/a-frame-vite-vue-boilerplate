<script setup>
  import '../aframe/teleport-camera-rig.js';

  defineProps({
    x: {type: Number, default: 0},
    y: {type: Number, default: 0},
    z: {type: Number, default: 0},
    label: {type: String, default: ''},
  });
</script>

<template>
  <a-entity
    geometry="primitive: circle; radius: 1"
    clickable
    :teleport-camera-rig="`
      x: ${x};
      y: ${y};
      z: ${z};
    `"
  >
    <a-text
      align="center"
      :value="label"
      position="0 1.2 0"
    ></a-text>
  </a-entity>
</template>