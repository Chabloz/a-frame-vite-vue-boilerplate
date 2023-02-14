<script setup>
  import '../aframe/emit-when-near';
  import '../aframe/event-set';

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
</script>

<template>
  <a-box
    :scale="`${scale} ${scale} ${scale}`"
    :material="`color: ${color}`"
    emit-when-near="event: change-color; eventFar: reset-color; distance: 4"
    event-set__near="event: change-color; attribute: material.color; value: blue;"
    :event-set__far="`event: reset-color; attribute: material.color; value: ${color};`"
  ></a-box>
</template>