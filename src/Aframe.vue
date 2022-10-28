<script setup>
  import './aframe/emit-when-near.js';
  import './aframe/event-set.js';
  import { ref } from 'vue';

  const scale = ref(1);
</script>

<template>
  <a-scene
    renderer="colorManagement: true"
    webxr="requiredFeatures: dom-overlay; overlayElement: #overlay;"
  >

      <a-box
        position="0 0 -6"
        :scale="`${scale} ${scale} ${scale}`"
        material="color: red"
        emit-when-near="event: change-color; eventFar: reset-color; distance: 3"
        event-set__near="event: change-color; attribute: material.color; value: blue;"
        event-set__far="event: reset-color; attribute: material.color; value: red;"
      ></a-box>

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
      <input v-model="scale" type="range" min="0.1" max="5" step="0.1">
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
