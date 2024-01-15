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
    depth="6" height="4" width="6"
  >

    <a-sphere v-for="index in 5" :key="index"
      physx-body="type: dynamic;"
      position="0 -1 1"
      radius="0.25"
      color="purple"
      physx-force-pushable
      clickable
    ></a-sphere>

    <PortalTeleporter
      label="Back to main room"
      material="src: #room-texture"
      position="0 -1 2.9"
      rotation="0 180 0"
      :rot="0"
    />
  </a-box>

  <!-- Physic room navigation mesh -->
  <a-entity
    geometry="primitive: plane; height: 6; width: 6"
    position="0 -99.99 0"
    rotation="-90 0 0"
    data-role="nav-mesh"
    material="color: green"
    visible="false"
  ></a-entity>

  <!-- Physic room walls -->
  <a-entity
    geometry="primitive: plane; height: 6; width: 6"
    position="0 -100.3 0"
    rotation="-90 0 0"
    data-role="nav-mesh"
    material="color: purple"
    visible="true"
    physx-body="type: static"
  ></a-entity>

  <a-entity
    geometry="primitive: plane; height: 6; width: 6"
    position="0 -99.99 -3.3"
    data-role="nav-mesh"
    material="color: purple"
    visible="true"
    physx-body="type: static"
  ></a-entity>
  <a-entity
    geometry="primitive: plane; height: 6; width: 6"
    position="0 -99.99 3.3"
    rotation="0 180 00"
    data-role="nav-mesh"
    material="color: purple"
    visible="true"
    physx-body="type: static"
  ></a-entity>
  <a-entity
    geometry="primitive: plane; height: 6; width: 6"
    position="3.3 -99.99 0"
    rotation="0 -90 0"
    data-role="nav-mesh"
    material="color: purple"
    visible="true"
    physx-body="type: static"
  ></a-entity>
  <a-entity
    geometry="primitive: plane; height: 6; width: 6"
    position="-3.3 -99.99 0"
    rotation="0 90 0"
    data-role="nav-mesh"
    material="color: purple"
    visible="true"
    physx-body="type: static"
  ></a-entity>

</template>