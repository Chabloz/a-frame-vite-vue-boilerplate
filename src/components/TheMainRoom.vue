<script setup>
import { ref } from "vue";
import { randomHsl } from "../utils/color.js";
import BoxColorChanging from "./BoxColorChanging.vue";
import PortalTeleporter from "./PortalTeleporter.vue";
import ExitDoor from "./ExitDoor.vue";
import "../aframe/life-like-automaton.js";

defineProps({
  scale: Number,
});

const colorBoxLeft = ref(randomHsl());
const colorBoxRight = ref(randomHsl());
</script>

<template>
  <a-entity
    gltf-model="#room"
    rotation="0 90 0"
    position="0 0 -5"
    scale="1 1.1 1"
  >
    <a-entity
      geometry="primitive: plane; height: 2; width: 2;"
      position="2 2 3.9"
      rotation="-180 0 0"
      life-like-automaton="resolution: 64; maxGen: 30;  birthRule: 3,4,5,6,7; survivalRule: 5,6;"
    ></a-entity>

    <a-entity
      geometry="primitive: plane; height: 2; width: 2;"
      position="2 2 -3.9"
      life-like-automaton="maxGen: 10; birthRule: 6,7,8; survivalRule: 4,5,6,7,8;"
    ></a-entity>

    <BoxColorChanging
      id="box-left"
      :scale="scale"
      :color="colorBoxLeft"
      position="7 0.5 -3"
      @click="colorBoxRight = randomHsl()"
      sound="src: #sound-1; on: click;"
    />

    <BoxColorChanging
      id="box-right"
      :scale="scale"
      :color="colorBoxRight"
      position="7 0.5 3"
      @click="colorBoxLeft = randomHsl()"
      sound="src: #sound-1; on: click;"
    />

    <PortalTeleporter
      label="Enter the Life Cube Room"
      material="src: #room-physic-texture"
      position="-7.99 1.5 0"
      rotation="0 90 0"
      :rot="180"
      :y="100"
      :cameraEffect="true"
      :cameraY="101.65"
      :cameraZ="-2"
      :cameraRot="-180"
    />

    <PortalTeleporter
      label="Enter the Physic Room"
      material="src: #room-physic-texture"
      position="-6 1.5 -3.99"
      rotation="0 0 0"
      :rot="180"
      :y="200"
      :cameraEffect="true"
      :cameraY="201"
      :cameraX="3.2"
      :cameraZ="0"
      :cameraRot="-90"
    />

    <PortalTeleporter
      label="Enter the Test Room"
      color="red"
      position="-2 1.5 -3.99"
      rotation="0 0 0"
      :rot="180"
      :x="0"
      :y="50"
      :z="0"
    />
  </a-entity>

  <ExitDoor />

  <!-- Main room navigation mesh  -->
  <a-entity
    geometry="primitive: plane; height: 13.5; width: 6"
    position="0 0.01 -4.75"
    rotation="-90 0 0"
    data-role="nav-mesh"
    material="color: blue"
    visible="false"
  ></a-entity>
  <a-entity
    geometry="primitive: plane; height: .5; width: 5"
    position="0 0.01 -11.75"
    rotation="-90 0 0"
    data-role="nav-mesh"
    material="color: red"
    visible="false"
  ></a-entity>
</template>
