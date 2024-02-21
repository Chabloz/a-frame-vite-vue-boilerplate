<script setup>
  import { ref } from 'vue';

  import TheCameraRig from './TheCameraRig.vue';
  import TheMainRoom from './TheMainRoom.vue';
  import TheLifeCubeRoom from './TheLifeCubeRoom.vue';
  import ThePhysicRoom from './ThePhysicRoom.vue';

  defineProps({
    scale: Number,
    overlaySelector: String,
  });

  const allAssetsLoaded = ref(false);
</script>

<template>
  <a-scene
    background="color: black;"
 
  >


    <template v-if="allAssetsLoaded">
      <TheMainRoom :scale="scale" />
      <TheLifeCubeRoom />
      <ThePhysicRoom />
    </template>

    <TheCameraRig />

  </a-scene>
</template>