<script setup>
import "../aframe/clickable.js";

function exitImmersiveView() {
  if (document.querySelector("a-scene").is("vr-mode")) {
    document.querySelector("a-scene").exitVR();
    console.info("Exit VR mode… bye!");
  }
}
</script>

<template>
  <a-box
    position="0 1.2 -13"
    material="color: blue"
    visible="false"
    scale="1.3 2.5 0.19"
    clickable
    click-handler
    @click="exitImmersiveView()"
  ></a-box>
</template>
