AFRAME.registerComponent("gltf-texture", {
  schema: {
    modelPath: { type: "string" },
    texturePath: { type: "string" },
  },

  init: function () {
    console.log(this.data.modelPath);
    console.log(this.data.texturePath);

    this.el.setAttribute("gltf-model", this.data.modelPath);
    this.el.addEventListener("model-loaded", () => this.applyTexture());
  },

  applyTexture: function () {
    // Load external texture
    const textureLoader = new THREE.TextureLoader();
    textureLoader.load(this.data.texturePath, (texture) => {
      const model = this.el.getObject3D("mesh");
      if (!model) {
        console.log("No model…");
        return;
      }

      model.traverse((node) => {
        if (node.isMesh && node.material) {
          node.material.map = texture;
          node.material.needsUpdate = true;
        }
      });
    });
  },
});
