<script setup>
  import { ref } from 'vue';

  import TheCameraRig from './TheCameraRig.vue';
  import TheMainRoom from './TheMainRoom.vue';
  import TheMainPlace from './TheMainPlace.vue';
  import TheLifeCubeRoom from './TheLifeCubeRoom.vue';
  import ThePhysicRoom from './ThePhysicRoom.vue';
  import { randomHsl } from '../utils/color';
  import '../aframe/duplicate-me.js';
  import '../aframe/look-at.js';

  defineProps({
    scale: Number,
    overlaySelector: String,
  });

  const allAssetsLoaded = ref(false);

  function changeColor(evt) {
    evt.target.setAttribute('color', randomHsl());
  }
</script>

<template>
  <a-scene>

    <a-assets @loaded="allAssetsLoaded = true">
      <!--
        Title: VR Gallery
        Model source: https://sketchfab.com/3d-models/vr-gallery-1ac32ed62fdf424498acc146fad31f7e
        Model author: https://sketchfab.com/mvrc.art (Maxim Mavrichev)
        Model license: CC BY 4.0 ( https://creativecommons.org/licenses/by/4.0/ )
      -->
      <a-asset-item id="room" src="assets/vr_gallery.glb"></a-asset-item>
      <!--
        Title: 3D Gallery for VR projects
        Model source: https://sketchfab.com/3d-models/3d-gallery-for-vr-projects-68f77ed8558c4bd59e0a13e2cc9d1fd1
        Model author: https://sketchfab.com/tekuto1s (tekuto1s)
        Model license: CC BY 4.0 ( https://creativecommons.org/licenses/by/4.0/ )
      -->
      <a-asset-item id="physic-room" src="assets/3d_gallery_for_vr_projects.glb"></a-asset-item>
      <!--
        Title: Little Robot Ball
        Model source: https://sketchfab.com/3d-models/little-robot-ball-bd1792fd94fc4e82a043b8724bad8f75
        Model author: https://sketchfab.com/Micheal-Holloway (Micheal Holloway)
        Model license: CC BY 4.0 ( https://creativecommons.org/licenses/by/4.0/ )

      -->
      <a-asset-item id="robot-ball" src="assets/little_robot_ball.glb"></a-asset-item>

      <a-asset-item id="robot-grey" src="assets/scene.gltf"></a-asset-item>

      <a-asset-item id="sound-1" response-type="arraybuffer" src="assets/sound1.mp3" preload="auto"></a-asset-item>
      <img id="room-physic-out-texture" :src="`assets/main-room-from-physic-room.png`">
      <img id="room-gol-out-texture" :src="`assets/main-room-from-gol-room.png`">
      <img id="room-physic-texture" :src="`assets/physicRoom.png`">
    </a-assets>

    <template v-if="allAssetsLoaded">
      <TheMainPlace />
    </template>

    <TheCameraRig />

  </a-scene>
</template>