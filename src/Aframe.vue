<script setup>
  import changingColorBox from './components/changing-color-box.vue';
  import { ref } from 'vue';

  const scale = ref(1);
</script>

<template>
  <a-scene
    renderer="colorManagement: true"
    webxr="requiredFeatures: dom-overlay; overlayElement: #overlay;"
  >

      <changing-color-box :scale="scale" color="#ff0000" position="-3 0 -6"/>
      <changing-color-box :scale="scale" color="#00ff00" position="3 0 -6"/>

      <a-entity
        id="camera-rig"
        wasd-controls
        look-controls="pointerLockEnabled: true"
        position="0 0 0">

          <a-entity
            id="head"
            camera
            position="0 1.6 0"
          ></a-entity>

      </a-entity>

  </a-scene>

  <div id="overlay">
    <dl id="debug">
      <dt>scale: {{ scale }}</dt>
      <input v-model.number="scale" type="range" min="0.1" max="5" step="0.1">
    </dl>
  </div>

</template>

<style scoped>
  #debug {
    position: absolute;
    left: 20px;
    bottom: 20px;
    background-color: black;
    color: white;
    width: auto;
    padding: 0.5rem 1rem;
    font-family: monospace;
  }
  dt {
    margin-top: 0.5rem;
    font-weight: bold;
  }
  dd {
    margin-left: 0.5rem;
  }
</style>
