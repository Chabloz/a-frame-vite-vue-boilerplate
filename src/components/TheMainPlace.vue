<script setup>
  import '../aframe/duplicate-me.js';

</script>

<template>
  <!-- <a-box @click="changeColor" clickable position="0 0 -2" color="red"></a-box> -->
      <!-- <a-entity
        geometry="primitive: plane; height: 13.5; width: 6"
        position="0 0.01 -4.75"
        rotation="-90 0 0"
        data-role="nav-mesh"
        material="color: blue"
        visible="false"
      ></a-entity> -->
      <a-entity
        gltf-model="#robot-ball"
        position="0 5 -5"
        duplicate-me="nbTimes: 15; msInterval: 100"
        scale="2 2 2"
        look-at="target: #head"
      ></a-entity>
      <!-- <a-entity
        data-id="robot"
        gltf-model="#robot-grey"
        position="0 0 -3"
      ></a-entity> -->
</template>