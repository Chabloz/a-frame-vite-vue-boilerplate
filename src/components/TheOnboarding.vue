<script setup>
  import { ref } from 'vue';

  defineProps({
    loaded: Boolean,
  });

  const showOnboarding = ref(true);
</script>

<template>
  <div id="onboarding" v-if="showOnboarding">
    <div>
      <h1>A-Frame + Vite + Vue Boilerplate</h1>
      <p v-if="!loaded">loading...</p>
      <button v-if="loaded" @click="showOnboarding = false">Enter scene</button>
      <div class="licences">
        <p>Included in the boilerplate:</p>
        <dl>
          <dt>aframe-extras controls and animation-mixer</dt>
          <dd>
            <a href="https://github.com/c-frame/aframe-extras" target="_blank">https://github.com/c-frame/aframe-extras</a>
             - <a href="https://github.com/c-frame/aframe-extras/blob/master/LICENSE" target="_blank">MIT License</a>
          </dd>
          <dt>aframe-blink-controls</dt>
          <dd>
            <a href="https://github.com/jure/aframe-blink-controls/" target="_blank">aframe-blink-controls</a>
             - <a href="https://github.com/jure/aframe-blink-controls/blob/main/LICENSE" target="_blank">MIT License</a>
          </dd>
          <dt>simple-navmesh-constraint</dt>
          <dd>
            A component from <a href=" https://github.com/AdaRoseCannon/aframe-xr-boilerplate" target="_blank">aframe-xr-boilerplate</a> By Ada Rose Cannon
            under MIT License
          </dd>
          <dt>3D Room model: VR exhibition gallery baked</dt>
          <dd>
            <a href="https://sketchfab.com/3d-models/vr-exhibition-gallery-baked-ee6f3b0d9db14b62a1b3aeef04315313" target="_blank">VR exhibition gallery baked</a>
            by <a href="https://sketchfab.com/ida61xq" target="_blank">ChristyHsu</a>
            is licensed under <a href="https://creativecommons.org/licenses/by/4.0/" target="_blank">CC BY 4.0</a>
          </dd>
        </dl>
      </div>
    </div>
  </div>
</template>

<style scoped>
  a {
    color: white;
  }
  .licences {
    margin: 2rem 0;
    font-size: 1rem;
  }
  .licences dt {
    padding-top: 1rem;
    font-weight: bold;
  }
  #onboarding {
    position: absolute;
    top: 0;
    left: 0;
    background-color: #333;
    color: #ccc;
    width: 100%;
    height: 100%;
    padding: 1rem;
    font-family: monospace;
    z-index: 10000;
  }
  #onboarding > * {
	  margin: 0 auto;
	  max-width: 50rem;
	  width: calc(100vw - 10rem);
	  text-align: center;
	  border-radius: 0.3rem;
	  padding: 1rem;
	  font-size: 1.3rem;
  }
  #onboarding button {
    font-size: 1.3rem;
    padding: 0.5rem 1rem;
    border-radius: 0.3rem;
    background-color: white;
    color: black;
    border: none;
    cursor: pointer;
  }
</style>