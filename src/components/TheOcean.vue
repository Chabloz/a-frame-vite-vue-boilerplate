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
      duplicate="gltf: #tree-glb;"
      gltf-model="#tree-glb"
    ></a-entity>
    <a-entity light="type: ambient; intensity: 2; color: #445451"></a-entity>
    <a-entity light="type: point; intensity: 20; color: tomato" position="-30 12 -20"></a-entity>
   </a-entity>
</template>
