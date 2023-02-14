<script setup>
  import BoxColorChanging from './BoxColorChanging.vue';
  import TheCameraRig from './TheCameraRig.vue';
  import TheNavMesh from './TheNavMesh.vue';
  import '../aframe/clickable';

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

    <BoxColorChanging
      :scale="scale"
      color="tomato"
      position="-3 0.5 -7"
      clickable
    />
    <BoxColorChanging
      :scale="scale"
      color="gold"
      position="3 0.5 -7"
      clickable
    />
    <BoxColorChanging
      :scale="scale"
      color="pink"
      position="0 0.5 -1"
      clickable
    />

    <TheNavMesh />

    <TheCameraRig />

  </a-scene>
</template>