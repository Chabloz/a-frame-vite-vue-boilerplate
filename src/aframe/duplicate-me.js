AFRAME.registerComponent("duplicate-me", {
  multiple: false,

  schema: {
    nb: { type: "int", default: 25 },
  },

  init: function () {
    console.log(this.data.nb);
    console.log(this.el);
    this.count = 0;
    this.tick = AFRAME.utils.throttleTick(this.tick, 1600, this);
  },

  update: function (oldData) {
    console.log("Update duplicate-me");
  },

  tick: function (time, timeDelta) {
    if (this.count >= this.data.nb) return;

    const clone = this.el.cloneNode(true);

    clone.removeAttribute("duplicate-me");

    const height = Math.random() * 8 + 2;

    const x = Math.random() * 20 - 10;
    const y = height / 2;
    const z = Math.random() * 20 - 10;

    clone.setAttribute("position", { x: x, y: y, z: z });

    clone.setAttribute("height", height);

    clone.setAttribute("scale", height);

    clone.setAttribute(
      "animation",
      `property: scale; 
       from: 0.1 0.1 0.1; 
       to: 1 1 1; 
        dur: 800; 
        easing: easeOutElastic;`
    );

    this.el.sceneEl.appendChild(clone);
    this.count++;
  },
});
