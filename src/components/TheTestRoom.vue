<script setup>
import PortalTeleporter from "./PortalTeleporter.vue";
</script>

<template>
  <a-box
    position="0 52 0"
    depth="4"
    height="4"
    width="4"
    color="blue"
    side="back"
  >
    <PortalTeleporter
      label="Back to main room"
      material="src: #room-gol-out-texture"
      position="0 -0.5 1.9"
      rotation="0 180 0"
      :rot="0"
    />
  </a-box>

  <!-- Navigation mesh  -->
  <a-entity
    data-role="nav-mesh"
    geometry="primitive: plane; height: 3; width: 3"
    position="0 50.01 0"
    rotation="-90 0 0"
    material="color: green"
    visible="false"
  ></a-entity>
</template>
