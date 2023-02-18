<script setup>
  import { computed } from 'vue';

  const props = defineProps({
    modelValue: {
      type: [Number],
      default: 1,
    },
  });

  const emit = defineEmits([
    'update:modelValue',
  ]);

  const value = computed({
    get: () => props.modelValue,
    set: val => emit('update:modelValue', val),
  });
</script>

<template>
  <div>
    <dl id="debug">
      <dt>scale: {{ value }}</dt>
      <input v-model.number="value" type="range" min="0.2" max="1" step="0.05">
    </dl>
  </div>
</template>

<style scoped>
  #overlay { z-index: 1000; }
  :xr-overlay { z-index: inherit; }  /* in AR z-index is not supported for AR dom overlay */

  #debug {
    position: absolute;
    left: 20px;
    bottom: 20px;
    background-color: black;
    color: white;
    width: auto;
    padding: 0.5rem 1rem;
    font-family: monospace;
  }
  dt {
    margin-top: 0.5rem;
    font-weight: bold;
  }
  dd {
    margin-left: 0.5rem;
  }
</style>