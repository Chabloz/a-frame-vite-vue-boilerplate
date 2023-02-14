<script setup>
  import '../aframe/disable-in-vr';
  import '../aframe/simple-navmesh-constraint';
</script>

<template>
  <a-entity
    id="camera-rig"
    movement-controls
    disable-in-vr="component: movement-controls"
    position="0 0 0"
  >

      <a-entity
        id="head"
        look-controls="pointerLockEnabled: true"
        simple-navmesh-constraint="navmesh: [data-role='nav-mesh']; height: 1.6;"
        camera
        position="0 1.6 0"
      ></a-entity>

      <a-entity
        id="hand-left"
        hand-controls="hand: left"
        blink-controls="
          cameraRig: #camera-rig;
          teleportOrigin: #head;
          collisionEntities: [data-role='nav-mesh'];
          snapTurn: false;
        "
      ></a-entity>

      <a-entity
        id="hand-right"
        hand-controls="hand: right"
      ></a-entity>

  </a-entity>
</template>