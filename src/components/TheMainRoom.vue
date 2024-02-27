<script setup>
  import { ref } from 'vue';
  import { randomHsl } from '../utils/color.js';
  import BoxColorChanging from './BoxColorChanging.vue';
  import PortalTeleporter from './PortalTeleporter.vue';
  import ExitDoor from './ExitDoor.vue';

  import '../aframe/bind-position.js';
  import '../aframe/bind-rotation.js';
  import '../aframe/copy-position.js';
  import '../aframe/copy-rotation.js';

  defineProps({
    scale: Number,
  });

  const colorBoxLeft = ref(randomHsl());
  const colorBoxRight = ref(randomHsl());

  function grabTheThing(evt) {
    // if something already grabbed, switch it
    const el = evt.target;
    const grabbedEl = document.querySelector('[data-grabbed]');
    if (grabbedEl) {
      grabbedEl.removeAttribute('bind-position');
      grabbedEl.removeAttribute('bind-rotation');
      grabbedEl.setAttribute('copy-position', `target: #${el.id}`);
      grabbedEl.setAttribute('copy-rotation', `target: #${el.id}`);
      delete grabbedEl.dataset.grabbed;
      delete grabbedEl.dataset.dropped;
      if (el.dataset.dropped) {
        grabbedEl.dataset.dropped = el.dataset.dropped;
      }
    }
    el.removeAttribute('copy-position');
    el.removeAttribute('copy-rotation');

    if (el.sceneEl.is('vr-mode')) {
      el.setAttribute('bind-position', 'target: #hand-right');
      el.setAttribute('bind-rotation', 'target: #hand-right');
    } else {
      el.setAttribute('bind-position', 'target: #dummy-hand-right');
      el.setAttribute('bind-rotation', 'target: #dummy-hand-right; convertToLocal: true');
    }
    el.dataset.grabbed = true;
    delete el.dataset.dropped;
  }

  function dropTheThing(evt) {
    const grabbedEl = document.querySelector('[data-grabbed]');
    // if nothing grabbed, return
    if (!grabbedEl) return;

    const dropZoneId = evt.target.id;
    grabbedEl.setAttribute('bind-position', `target: #${dropZoneId};`);
    grabbedEl.setAttribute('bind-rotation', `target: #${dropZoneId};`);
    delete grabbedEl.dataset.grabbed;

    // if something was in the drop zone, grab it
    const elInDropZone = document.querySelector(`[data-dropped="${dropZoneId}"]`);
    if (elInDropZone) {
      grabTheThing({ target: elInDropZone });
    };

    grabbedEl.dataset.dropped = dropZoneId;
  }
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

    <a-entity
      id="drop-zone-left"
      geometry="primitive: sphere; phiLength: 180; radius: 0.5; thetaLength: 90;"
      material="color: red; side: double"
      position="-1.8 1 -4"
      rotation="90 0 0"
      clickable
      @click="evt => dropTheThing(evt)"
    ></a-entity>

    <a-entity
      id="drop-zone-right"
      geometry="primitive: sphere; phiLength: 180; radius: 0.5; thetaLength: 90;"
      material="color: purple; side: double"
      position="-1.8 1 4"
      rotation="90 0 180"
      clickable
      @click="evt => dropTheThing(evt)"
    ></a-entity>

    <a-box
      id="box-1-grabbable"
      color="red"
      scale="0.3 0.3 0.3"
      position="0 0.25 1"
      clickable
      @click="evt => grabTheThing(evt)"
    ></a-box>

    <a-box
      id="box-2-grabbable"
      color="purple"
      scale="0.3 0.3 0.3"
      position="0 0.25 -1"
      clickable
      @click="evt => grabTheThing(evt)"
    ></a-box>

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