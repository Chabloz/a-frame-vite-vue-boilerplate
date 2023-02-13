<template>
  <a-entity
    id="camera-rig"
    movement-controls
    position="0 0 0">
      <a-entity
        id="head"
        look-controls="pointerLockEnabled: true"
        camera
        position="0 1.6 0"
      ></a-entity>
  </a-entity>
</template>