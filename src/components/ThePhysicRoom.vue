<script setup>
  import PortalTeleporter from './PortalTeleporter.vue';

  import '../aframe/life-like-automaton.js';
  import '../aframe/physx-force-pushable.js';
  import '../aframe/clickable.js';
</script>

<template>
  <a-entity
    gltf-model="#physic-room"
    position="0 199.5 0"
  >

    <a-sphere v-for="index in 3" :key="index"
      physx-body="type: dynamic"
      physx-grabbable
      physx-force-pushable
      :position="`${index -2} 1 1`"
      radius="0.25"
      color="purple"
      clickable
    ></a-sphere>

    <PortalTeleporter
      label="Back to main room"
      material="src: #room-physic-out-texture"
      position="0 2.1 4.12"
      rotation="0 180 0"
      :rot="0"
      :cameraEffect="true"
      :cameraY="1.65"
      :cameraRot="-180"
    />
  </a-entity>

  <!-- Physic room navigation mesh -->
  <a-entity
    geometry="primitive: plane; height: 7; width: 7"
    position="0 200.01 0"
    rotation="-90 0 0"
    data-role="nav-mesh"
    material="color: green"
    visible="false"
  ></a-entity>

  <!-- Physic room floor & walls -->
  <a-entity position="0 199.6 0" visible="false">
    <a-entity
      geometry="primitive: plane; height: 9.1; width: 9.1"
      rotation="-90 0 0"
      material="color: purple"
      physx-body="type: static"
    ></a-entity>
    <a-entity
      geometry="primitive: plane; height: 6.4; width: 9.1"
      position="0 0 -4.45"
      material="color: purple"
      physx-body="type: static"
    ></a-entity>
    <a-entity
      geometry="primitive: plane; height: 6.4; width: 9.1"
      position="0 0 4.45"
      rotation="0 180 00"
      material="color: purple"
      physx-body="type: static"
    ></a-entity>
    <a-entity
      geometry="primitive: plane; height: 6.4; width: 9.1"
      position="4.45 0 0"
      rotation="0 -90 0"
      material="color: purple"
      physx-body="type: static"
    ></a-entity>
    <a-entity
      geometry="primitive: plane; height: 6.4; width: 9.1"
      position="-4.45 0 0"
      rotation="0 90 0"
      material="color: purple"
      physx-body="type: static"
    ></a-entity>
  </a-entity>
</template>