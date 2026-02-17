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
    <a-box duplicate></a-box>
    <a-entity light="type: ambient; color: #445451"></a-entity>
    <a-entity duplicate light="type: point; intensity: 2" position="0 2 -10"></a-entity>
   </a-entity>
</template>
