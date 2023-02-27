<script setup>
  import '../aframe/teleport-camera-rig.js';

  defineProps({
    label: {type: String, default: ''},
    x: {type: Number, default: 0},
    y: {type: Number, default: 0},
    z: {type: Number, default: 0},
    rot: {type: [Number, Boolean], default: false},
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
      handleRotation: ${rot === false ? 'false' : 'true'};
      rot: ${rot === false ? 'false' : rot};
    `"
  >
    <a-text
      align="center"
      :value="label"
      position="0 1.2 0"
    ></a-text>
  </a-entity>
</template>