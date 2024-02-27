AFRAME.registerComponent("look-at", {
  multiple: false,

  schema: {
    target: { type: "selector", default: "#head" },
  },

  init: function () {
    console.log("Init look-at");
    console.log(this.data.target);
  },

  update: function (oldData) {
    console.log("Update look-at");
  },
});
