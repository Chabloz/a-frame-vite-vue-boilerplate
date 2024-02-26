<script setup>
  import '../aframe/teleport-camera-rig.js';
  import '../aframe/clickable.js';
  import '../aframe/multi-camera.js';
  import '../aframe/bind-rotation.js';

  import { ref } from 'vue';

  const props = defineProps({
    id: {type: String, default: null},
    label: {type: String, default: ''},
    x: {type: Number, default: 0},
    y: {type: Number, default: 0},
    z: {type: Number, default: 0},
    rot: {type: [Number, Boolean], default: false},
    cameraEffect: {type: Boolean, default: false},
    cameraX: {type: Number, default: 0},
    cameraY: {type: Number, default: 0},
    cameraZ: {type: Number, default: 0},
    cameraRot: {type: Number, default: 0},
    cameraSelector: {type: String, default: '[camera]'},
  });
  const id = ref(props.id);
  // if no id is set, generate a random one
  if (!id.value) {
    id.value = crypto.getRandomValues(new Uint32Array(1))[0];
  }
</script>

<template>
  <a-entity
    :id="`portal-${id}`"
    geometry="primitive: circle; radius: 1"
    clickable
    :teleport-camera-rig="`
      x: ${x};
      y: ${y};
      z: ${z};
      handleRotation: ${rot === false ? 'false' : 'true'};
      rot: ${rot === false ? 0 : rot};
    `"
  >

    <a-text
      align="center"
      :value="label"
      position="0 1.2 0"
    ></a-text>

    <Teleport to="a-scene" v-if="cameraEffect">
      <a-entity :rotation="`0 ${cameraRot} 0`">
        <a-entity
          :id="`camera-${id}`"
          :secondary-camera="`
            cameraType: perspective;
            output: scene;
            aspectRatio: 1;
            outputElement: #portal-${id};
            sequence: before;
          `"
          :position="`${cameraX} ${cameraY} ${cameraZ}`"
          :bind-rotation="`target: ${cameraSelector}`"
        ></a-entity>
      </a-entity>
    </Teleport>

  </a-entity>
</template>
