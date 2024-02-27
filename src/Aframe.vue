<script setup>
import { ref } from "vue";
import TheOnboarding from "./components/TheOnboarding.vue";
import TheOverlay from "./components/TheOverlay.vue";
import TheScene from "./components/TheScene.vue";
import TheSceneCar from "./components/TheSceneCar.vue";
import TheSceneGrab from "./components/TheSceneGrab.vue";
import TheSceneSki from "./components/TheSceneSki.vue";
import TheScenePaint from "./components/TheScenePaint.vue";
import TheSceneFish from "./components/TheSceneFish.vue";

const scale = ref(1);
const loaded = ref(false);
</script>

<template>
  <TheOnboarding :loaded="loaded" />

  <!-- The DOM element of the overlay must be mounted before the A-Frame Scene is mounted -->
  <!-- Otherwise the "webxr system" of the A-Frame scene wont find the DOM Element -->
  <!-- <TheOverlay v-model="scale" id="overlay" /> -->

  <!-- <TheScene
    :scale="scale"
    overlay-selector="#overlay"
    @loaded="loaded = true"
  /> -->

  <!-- <TheSceneCar @loaded="loaded = true" /> -->
  <!-- <TheSceneGrab @loaded="loaded = true" /> -->
  <!-- <TheSceneSki @loaded="loaded = true" /> -->
  <!-- <TheScenePaint @loaded="loaded = true" /> -->
  <TheSceneFish @loaded="loaded = true" />
</template>
