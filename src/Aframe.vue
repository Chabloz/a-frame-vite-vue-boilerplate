<script setup>
  import { ref } from 'vue';
  import TheOverlay from './components/TheOverlay.vue';
  import TheScene from './components/TheScene.vue';

  const scale = ref(1);
</script>

<template>
  <!-- The overlay must come before the A-Frame scene or it wont works in AR -->
  <TheOverlay v-model="scale" />
  <TheScene :scale="scale" />
</template>