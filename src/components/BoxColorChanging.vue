<script setup>
  import '../aframe/emit-when-near.js';
  import '../aframe/event-set.js';
  import '../aframe/clickable.js';

  import { randomHsl } from '../utils/color.js';
  import { ref } from 'vue';

  defineProps({
    scale: Number,
    color: String,
  });

  const randomColor = ref(randomHsl());
</script>

<template>
  <a-box
    :scale="`${scale} ${scale} ${scale}`"
    :material="`color: ${color}`"
    clickable
    emit-when-near="event: change-color; eventFar: reset-color; distance: 2.5"
    event-set__near="event: change-color; attribute: material.color; value: blue;"
    :event-set__click="`event: click; attribute: material.color; value: ${randomColor};`"
    :event-set__far="`event: reset-color; attribute: material.color; value: ${color};`"
    @click="randomColor = randomHsl()"
  ></a-box>
</template>