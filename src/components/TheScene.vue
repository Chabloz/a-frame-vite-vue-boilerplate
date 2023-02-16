<script setup>
  import BoxColorChanging from './BoxColorChanging.vue';
  import TheCameraRig from './TheCameraRig.vue';
  import TheNavMesh from './TheNavMesh.vue';
  import '../aframe/clickable';
  import '../aframe/listen-to';

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
      id="box-left"
      :scale="scale"
      color="tomato"
      position="-3 0.5 -7"
      clickable
      listen-to="target: #box-right; emit: change-color;"
    />
    <BoxColorChanging
      id="box-right"
      :scale="scale"
      color="gold"
      position="3 0.5 -7"
      clickable
      listen-to="target: #box-left; emit: change-color;"
    />

    <TheNavMesh />

    <TheCameraRig />

  </a-scene>
</template>