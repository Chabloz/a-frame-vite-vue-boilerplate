<script setup>
import "../aframe/disable-in-vr.js";
import "../aframe/hide-in-vr.js";
import "../aframe/simple-navmesh-constraint.js";
import "../aframe/blink-controls.js";
import "../aframe/physx-grab.js";
import "../aframe/track-vertical-gesture.js";
import "../aframe/brush.js";
import "../aframe/vibrate.js";
</script>

<template>
  <a-entity
    id="camera-rig"
    movement-controls="camera: #head;"
    disable-in-vr="component: movement-controls;"
  >
    <a-entity
      id="head"
      look-controls="pointerLockEnabled: true"
      simple-navmesh-constraint="navmesh: [data-role='nav-mesh']; height: 1.65;"
      disable-in-vr="component: simple-navmesh-constraint;"
      camera
      position="0 1.65 0"
      draw-tube
    >
      <a-entity
        geometry="primitive: circle; radius: 0.0003;"
        material="shader: flat; color: white;"
        cursor
        raycaster="far: 40; objects: [clickable]; showLine: false;"
        position="0 0 -0.1"
        disable-in-vr="component: raycaster; disableInAR: false;"
        hide-in-vr="hideInAR: false"
      ></a-entity>
    </a-entity>

    <a-entity
      id="hand-left"
      hand-controls="hand: left"
      oculus-touch-controls="hand: left"
      blink-controls="
          cameraRig: #camera-rig;
          teleportOrigin: #head;
          collisionEntities: [data-role='nav-mesh'];
          snapTurn: false;
        "
      __physx-grab
      vibrate-controller="hand: left"
      vibrate-on-click
    >
      <!-- <a-sphere
        id="hand-left-collider"
        radius="0.02"
        visible="false"
        physx-body="type: kinematic; emitCollisionEvents: true"
      >
      </a-sphere> -->
    </a-entity>

    <a-entity
      id="hand-right"
      hand-controls="hand: right"
      oculus-touch-controls="hand: right"
      laser-controls="hand: right"
      raycaster="far: 4; objects: [clickable]; showLine: true;"
      __physx-grab
      track-vertical-gesture
      vibrate-controller="hand: right"
      vibrate-on-click
    >
      <!-- <a-sphere
        id="hand-right-collider"
        radius="0.02"
        visible="false"
        __physx-body="type: kinematic; emitCollisionEvents: true"
      >
      </a-sphere> -->
    </a-entity>
  </a-entity>
</template>
