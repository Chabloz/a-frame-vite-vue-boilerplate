<script setup>
  import { ref } from 'vue';
  import TheCameraRig from './TheCameraRig.vue';
  import '../aframe/hand-gestures.js';
  import '../aframe/listen-to.js';
  import '../aframe/event-set.js';

  const allAssetsLoaded = ref(false);

  AFRAME.registerComponent('gesture-debug', {
    init() {
      this._onGesture = (e) => {
        const { name, score } = e.detail;
        this.el.setAttribute('text', 'value', name + ' (' + score.toFixed(2) + ')');
      };
      const bindHand = () => {
        const hand = document.querySelector('#hand-right');
        if (hand) hand.addEventListener('gesture', this._onGesture);
      };
      if (this.el.sceneEl.hasLoaded) {
        bindHand();
      } else {
        this.el.sceneEl.addEventListener('loaded', bindHand, { once: true });
      }
    },
    remove() {
      const hand = document.querySelector('#hand-right');
      if (hand) hand.removeEventListener('gesture', this._onGesture);
    }
  });
</script>

<template>
  <a-scene
    background="color: black;"
    xr-mode-ui="XRMode: xr"
  >

    <a-assets @loaded="allAssetsLoaded = true">
    </a-assets>

    <template v-if="allAssetsLoaded">
      <a-box position="2 0 -2"></a-box>

      <!-- Gesture debug text -->
      <a-entity
        id="gesture-debug"
        position="0 2 -1.5"
        gesture-debug
        text="value: —; color: yellow; align: center; width: 3"
      ></a-entity>
    </template>

    <TheCameraRig :allAssetsLoaded="allAssetsLoaded"/>

  </a-scene>
</template>