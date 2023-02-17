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
      <h1>A-Frame + Vue Boilerplate</h1>
      <p v-if="!loaded">loading...</p>
      <button v-if="loaded" @click="showOnboarding = false">Enter scene</button>
    </div>
  </div>
</template>

<style scoped>
  #onboarding {
    position: absolute;
    top: 0;
    left: 0;
    background-color: black;
    color: white;
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