<script setup>
  import BoxColorChanging from './BoxColorChanging.vue';
  import TheCameraRig from './TheCameraRig.vue';

  const props = defineProps({
    scale: {
      type: [Number],
      default: 1,
    },
  });
</script>


<template>
  <a-scene
    renderer="colorManagement: true;"
    webxr="
      requiredFeatures: local-floor;
      referenceSpaceType: local-floor;
      optionalFeatures: dom-overlay;
      overlayElement: #overlay;
    "
  >

    <BoxColorChanging :scale="scale" color="#ff0000" position="-3 0 -6"/>
    <BoxColorChanging :scale="scale" color="#00ff00" position="3 0 -6"/>

    <TheCameraRig />

  </a-scene>
</template>