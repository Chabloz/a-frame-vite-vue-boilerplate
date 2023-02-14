<template>
  <a-entity
    geometry="primitive: plane; height: 7; width: 7"
    position="0 0 .5"
    rotation="-90 0 0"
    material="color: #3BA874"
    data-role="nav-mesh"
  ></a-entity>

  <a-entity
    geometry="primitive: plane; height: 5d; width: 2"
    position="2.5 0 -5"
    rotation="-90 0 0"
    material="color: #3BA874"
    data-role="nav-mesh"
  ></a-entity>

  <a-entity
    geometry="primitive: plane; height: 5; width: 2"
    position="-2.5 0 -5"
    rotation="-90 0 0"
    material="color: #3BA874"
    data-role="nav-mesh"
  ></a-entity>
</template>