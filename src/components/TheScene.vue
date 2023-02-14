<script setup>
  import BoxColorChanging from './BoxColorChanging.vue';
  import TheCameraRig from './TheCameraRig.vue';
  import TheNavMesh from './TheNavMesh.vue';

  const props = defineProps({
    scale: {
      type: [Number],
      default: 1,
    },
  });
</script>


<template>
  <a-scene
    background="color: black;"
    renderer="colorManagement: true;"
    webxr="
      requiredFeatures: local-floor;
      referenceSpaceType: local-floor;
      optionalFeatures: dom-overlay;
      overlayElement: #overlay;
    "
  >

    <BoxColorChanging :scale="scale" color="tomato" position="-3 0.5 -7" />
    <BoxColorChanging :scale="scale" color="olive" position="3 0.5 -7" />

    <TheNavMesh />

    <TheCameraRig />

  </a-scene>
</template>