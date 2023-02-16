<script setup>
  import '../aframe/emit-when-near';
  import '../aframe/event-set';
  import { ref } from 'vue';

  const props = defineProps({
    scale: {
      type: Number,
      default: 1,
    },
    color: {
      type: String,
      default: '#ff0000',
    },
  });

  function randomHsl() {
    return `hsla(${Math.random() * 360}, 100%, 50%, 1)`;
  }

  const randomColor = ref('pink');

</script>

<template>
  <a-box
    :scale="`${scale} ${scale} ${scale}`"
    :material="`color: ${color}`"
    emit-when-near="event: change-color; eventFar: reset-color; distance: 5"
    event-set__near="event: change-color; attribute: material.color; value: blue;"
    :event-set__click="`event: click; attribute: material.color; value: ${randomColor};`"
    :event-set__far="`event: reset-color; attribute: material.color; value: ${color};`"
    @click="randomColor = randomHsl()"
    @change-color="color = randomHsl()"
  ></a-box>
</template>