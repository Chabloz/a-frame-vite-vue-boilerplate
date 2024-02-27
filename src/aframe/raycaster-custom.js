AFRAME.registerComponent("raycaster-custom", {
  schema: {
    selectorFar: { type: "selector", default: null },
    distanceFar: { type: "number", default: 4 },
  },

  init: function () {
    this.el.setAttribute("test", "test");
    this.el.setAttribute("raycaster", `"jwe"`);

    document.getElementById("portal-test").addEventListener("click", () => {
      console.log(this.data.distanceFar);
    });
  },
});

AFRAME.registerComponent("raycaster-test", {
  schema: {
    distanceNear: { type: "number", default: 4 },
    distanceFar: { type: "number", default: 400 },
  },

  init: function () {
    this.raycaster = new THREE.Raycaster();
    this.raycaster.near = this.data.distanceNear;
    this.raycaster.far = this.data.distanceFar;
    this.targets = [];
  },

  update: function () {
    this.raycaster.near = this.data.distanceNear;
    this.raycaster.far = this.data.distanceFar;
  },

  tick: function () {
    this.updateTargets();
    this.checkIntersections();
  },

  updateTargets: function () {
    const allElements = Array.from(document.querySelectorAll("[near], [far]"));
    this.targets = allElements.filter((el) => {
      const near = el.getAttribute("near");
      const far = el.getAttribute("far");
      return near <= this.raycaster.far && far >= this.raycaster.near;
    });
  },

  checkIntersections: function () {
    const origin = this.el.object3D.position;
    const direction = this.el.object3D.getWorldDirection(new THREE.Vector3());
    this.raycaster.set(origin, direction);

    const intersects = this.raycaster.intersectObjects(
      this.targets.map((t) => t.object3D),
      true
    );
    // intersects.forEach((intersection) => {
    //   console.log("Intersection:", intersection);
    //   // Traiter l'intersection ici, par exemple en déclenchant un événement
    // });
  },
});
