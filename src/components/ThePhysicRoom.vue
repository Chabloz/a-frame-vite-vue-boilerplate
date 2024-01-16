<script setup>
  import PortalTeleporter from './PortalTeleporter.vue';

  import '../aframe/life-like-automaton.js';
  import '../aframe/physx-force-pushable.js';
  import '../aframe/clickable.js';
</script>

<template>
  <a-entity
    gltf-model="#physic-room"
    position="0 -100 0"
  >
    <a-sphere v-for="index in 3" :key="index"
      physx-body="type: dynamic;"
      :position="`${index -2} 1 1`"
      radius="0.25"
      color="purple"
      physx-force-pushable
      clickable
    ></a-sphere>

    <PortalTeleporter
      label="Back to main room"
      material="src: #room-texture"
      position="0 2.1 3.9"
      rotation="0 180 0"
      :rot="0"
    />
  </a-entity>

  <!-- Physic room navigation mesh -->
  <a-entity
    geometry="primitive: plane; height: 7; width: 7"
    position="0 -99.2 0"
    rotation="-90 0 0"
    data-role="nav-mesh"
    material="color: green"
    visible="false"
  ></a-entity>

  <!-- Physic room floor & walls -->
  <a-entity position="0 -99.9 0" visible="true">
    <a-entity
      geometry="primitive: plane; height: 9.1; width: 9.1"
      rotation="-90 0 0"
      data-role="nav-mesh"
      material="color: purple"
      physx-body="type: static"
    ></a-entity>
    <a-entity
      geometry="primitive: plane; height: 6.4; width: 9.1"
      position="0 0 -4.45"
      data-role="nav-mesh"
      material="color: purple"
      physx-body="type: static"
    ></a-entity>
    <a-entity
      geometry="primitive: plane; height: 6.4; width: 9.1"
      position="0 0 4.45"
      rotation="0 180 00"
      data-role="nav-mesh"
      material="color: purple"
      physx-body="type: static"
    ></a-entity>
    <a-entity
      geometry="primitive: plane; height: 6.4; width: 9.1"
      position="4.45 0 0"
      rotation="0 -90 0"
      data-role="nav-mesh"
      material="color: purple"
      physx-body="type: static"
    ></a-entity>
    <a-entity
      geometry="primitive: plane; height: 6.4; width: 9.1"
      position="-4.45 0 0"
      rotation="0 90 0"
      data-role="nav-mesh"
      material="color: purple"
      physx-body="type: static"
    ></a-entity>
  </a-entity>
</template>