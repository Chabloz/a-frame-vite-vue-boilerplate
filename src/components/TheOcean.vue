<script setup>
  import '../aframe/duplicate';
</script>

<template>
  <a-entity>
    <a-ocean
      depth="100"
      width="100"
      amplitude="0"
      amplitude-variance="0.1"
      opacity="1"
      density="50"
    ></a-ocean>
    <a-plane
      visible="false"
      data-role="nav-mesh"
      color="red"
      position="0 0 2"
      height="10"
      width="10"
      rotation="-90 0 0"
    ></a-plane>
    <a-entity
      duplicate="gltf: #tree-glb; entropy: 0.7; gap: 0.4; rows: 5; cols: 5;"
      gltf-model="#tree-glb"
    ></a-entity>
    <a-box
      duplicate="rows: 5; cols: 5;"
    ></a-box>
    <a-entity light="type: ambient; intensity: 0.2; color: white"></a-entity>
    <a-entity light="type: point; intensity: 20; color: tomato" position="-30 12 -20"></a-entity>
   </a-entity>
</template>
