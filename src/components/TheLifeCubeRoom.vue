<script setup>
  import '../aframe/life-like-automaton.js';
  import PortalTeleporter from './PortalTeleporter.vue';
</script>

<template>
  <a-box
    life-like-automaton="backSide: true;"
    position="0 102 0"
    depth="4" height="4" width="4"
  >
    <PortalTeleporter
      label="Back to main room"
      material="color: #333"
      position="0 -1 1.9"
      rotation="0 180 0"
    />
  </a-box>
</template>