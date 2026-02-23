<script setup>
  import '../aframe/listen-to.js';
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
    <a-entity light="type: ambient; intensity: 0.2; color: white"></a-entity>
    <a-entity
      id="light-sun"
      listen-to="target: #switch-light; event: obbcollisionstarted; emit: light-off"
      animation="property: light.intensity; to: 0; dur: 2000; easing: linear; startEvents: light-off"
      light="type: point; intensity: 20; color: tomato"
      position="-30 12 -20"
    ></a-entity>
   </a-entity>
</template>
