<script setup>
  import TheOverlay from './components/TheOverlay.vue';
  import BoxColorChanging from './components/BoxColorChanging.vue';
  import TheCameraRig from './components/TheCameraRig.vue';
  import { ref } from 'vue';

  const scale = ref(1);
</script>


<template>

  <a-scene renderer="colorManagement: true;">

      <BoxColorChanging :scale="scale" color="#ff0000" position="-3 0 -6"/>
      <BoxColorChanging :scale="scale" color="#00ff00" position="3 0 -6"/>

      <TheCameraRig />

  </a-scene>

  <TheOverlay v-model="scale" />

</template>