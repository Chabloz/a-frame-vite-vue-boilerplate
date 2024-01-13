<script setup>
  import PortalTeleporter from './PortalTeleporter.vue';

  import '../aframe/life-like-automaton.js';
  import '../aframe/physx-force-pushable.js';
  import '../aframe/clickable.js';
</script>

<template>
  <a-box
    life-like-automaton="backSide: true;"
    position="0 -98 0"
    depth="4" height="4" width="4"
  >

    <a-sphere
      physx-body="type: dynamic;"
      position="0 -1 1"
      radius="0.5"
      color="blue"
      physx-force-pushable
      clickable
    ></a-sphere>

    <PortalTeleporter
      label="Back to main room"
      material="src: #room-texture"
      position="0 -1 1.9"
      rotation="0 180 0"
      :rot="0"
    />
  </a-box>

  <!-- Physic room navigation mesh -->
  <a-entity
    geometry="primitive: plane; height: 3; width: 3"
    position="0 -99.99 0"
    rotation="-90 0 0"
    data-role="nav-mesh"
    material="color: green"
    visible="false"
    physx-body="type: static"
  ></a-entity>

</template>