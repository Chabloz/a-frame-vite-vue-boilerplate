<script setup>
import { ref } from "vue";

import TheCameraRig from "./TheCameraRig.vue";
import TheMainRoom from "./TheMainRoom.vue";
import TheLifeCubeRoom from "./TheLifeCubeRoom.vue";
import TheTestRoom from "./TheTestRoom.vue";
import ThePhysicRoom from "./ThePhysicRoom.vue";

import "../aframe/duplicate-me.js";
import "../aframe/look-at.js";
import "../aframe/gltf-texture.js";
import "../aframe/radio.js";

defineProps({
  scale: Number,
  overlaySelector: String,
});

const allAssetsLoaded = ref(false);
</script>

<template>
  <a-scene
    background="color: SteelBlue;"
    :webxr="`
      requiredFeatures: local-floor;
      referenceSpaceType: local-floor;
      optionalFeatures: dom-overlay;
      overlayElement: ${overlaySelector};
    `"
    xr-mode-ui="XRMode: xr"
    physx="
      autoLoad: true;
      delay: 1000;
      useDefaultScene: false;
      wasmUrl: lib/physx.release.wasm;
    "
    
  >
    <a-assets @loaded="allAssetsLoaded = true" id="all-loaded">
      <!--
        Title: VR Gallery
        Model source: https://sketchfab.com/3d-models/vr-gallery-1ac32ed62fdf424498acc146fad31f7e
        Model author: https://sketchfab.com/mvrc.art (Maxim Mavrichev)
        Model license: CC BY 4.0 ( https://creativecommons.org/licenses/by/4.0/ )
      -->
      <!-- <a-asset-item id="room" src="assets/vr_gallery.glb"></a-asset-item> -->
      <!--
        Title: 3D Gallery for VR projects
        Model source: https://sketchfab.com/3d-models/3d-gallery-for-vr-projects-68f77ed8558c4bd59e0a13e2cc9d1fd1
        Model author: https://sketchfab.com/tekuto1s (tekuto1s)
        Model license: CC BY 4.0 ( https://creativecommons.org/licenses/by/4.0/ )
      -->
      <a-asset-item id="car-model" src="assets/Unity2Skfb.gltf"></a-asset-item>
      <a-asset-item
        id="physic-room"
        src="assets/3d_gallery_for_vr_projects.glb"
      ></a-asset-item>
      <a-asset-item id="wood-floor" src="assets/wood-floor.glb"></a-asset-item>
      <!-- <a-asset-item
        id="sound-1"
        response-type="arraybuffer"
        src="assets/sound1.mp3"
        preload="auto"
      ></a-asset-item> -->
      <a-asset-item
        id="sound-radio-1"
        response-type="arraybuffer"
        src="assets/1.wav"
        preload="auto"
      ></a-asset-item>
      <a-asset-item
        id="sound-radio-2"
        response-type="arraybuffer"
        src="assets/2.wav"
        preload="auto"
      ></a-asset-item>
      <img id="car-texture" :src="`assets/textures/CARRERA_4096.jpg`" />
      <img
        id="room-physic-out-texture"
        :src="`assets/main-room-from-physic-room.png`"
      />
      <img
        id="room-gol-out-texture"
        :src="`assets/main-room-from-gol-room.png`"
      />
      <img id="room-physic-texture" :src="`assets/physicRoom.png`" />
    </a-assets>

    <template v-if="allAssetsLoaded">
      <TheMainRoom :scale="scale" />
      <TheLifeCubeRoom />
      <ThePhysicRoom />
      <TheTestRoom />

      <a-plane
        rotation="-90 0 0"
        color="DarkSeaGreen"
        width="100"
        height="100"
      ></a-plane>
      <a-box color="orange" position="0 0 -5"></a-box>
      <!-- <a-ocean></a-ocean> -->

      <!-- <a-entity
        gltf-model="#car-model"
        material="src: #car-texture"
        id="car-3d"
      ></a-entity> -->

      <!-- <a-entity gltf-model="#wood-floor" id="wood-floor-3d"></a-entity> -->

      <a-entity light="type: ambient; color: #BBB"></a-entity>
      <a-entity
        light="type: directional; color: #FFF; intensity: 0.6"
        position="-0.5 1 1"
      ></a-entity>

      <a-entity radio></a-entity>
    </template>

    <a-entity
      gltf-with-texture="modelPath: assets/Unity2Skfb.gltf; texturePath: assets/textures/CARRERA_4096.jpg"
    ></a-entity>

    <a-box
      data-id="duplicate-box"
      duplicate-me="nb: 100"
      width="1"
      color="teal"
    ></a-box>

    <a-box data-id="duplicate-box" look-at width="1.5" color="blue"></a-box>

    <TheCameraRig />
  </a-scene>
</template>
