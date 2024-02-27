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
      material="src: #room-gol-out-texture"
      position="0 -0.5 1.9"
      rotation="0 180 0"
      :rot="0"
      :cameraEffect="true"
      :cameraY="1.65"
      :cameraRot="-180"
    />
  </a-box>

  <!-- Life Cube room navigation mesh -->
  <a-entity
    data-role="nav-mesh"
    geometry="primitive: plane; height: 3; width: 3"
    position="0 100.01 0"
    rotation="-90 0 0"
    material="color: green"
    visible="false"
  ></a-entity>

</template>