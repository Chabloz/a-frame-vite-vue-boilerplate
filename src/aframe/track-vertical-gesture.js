AFRAME.registerComponent("track-vertical-gesture", {
  schema: {
    threshold: { type: "number", default: 0.2 },
  },

  init: function () {
    this.previousPosition = new THREE.Vector3();
    this.previousTime = Date.now();
  },
  tick: function () {
    let currentPosition = this.el.object3D.position.clone();
    let currentTime = Date.now();
    let timeDiff = (currentTime - this.previousTime) / 1000; // Concert to secs
    let speed = currentPosition.distanceTo(this.previousPosition) / timeDiff;

    if (speed > this.data.threshold) {
      console.log("Baisse rapide détectée");

      const box = document.createElement("a-box");
      const x = Math.random() * 20 - 10; // -10 / 10
      const y = 0;
      const z = Math.random() * 20 - 10; // -10 / 10
      box.setAttribute("position", { x: x, y: y, z: z });
      this.box.sceneEl.appendChild(box);

      this.box.sceneEl.setAttribute("background", "#ff0000");
    }

    this.previousPosition = currentPosition;
    this.previousTime = currentTime;
  },
  //   init: function () {
  //     const leftHand = document.querySelector("#hand-left");
  //     const rightHand = document.querySelector("#hand-right");
  //     let previousPositionLeft = null;
  //     let previousPositionRight = null;
  //     let previousTime = Date.now();

  //     function checkSpeedAndTriggerAction() {
  //       var currentPositionLeft = leftHand.object3D.position;
  //       var currentPositionRight = rightHand.object3D.position;
  //       var currentTime = Date.now();
  //       var timeDiff = currentTime - previousTime;

  //       if (previousPositionLeft && previousPositionRight) {
  //         var speedLeft =
  //           currentPositionLeft.distanceTo(previousPositionLeft) / timeDiff;
  //         var speedRight =
  //           currentPositionRight.distanceTo(previousPositionRight) / timeDiff;

  //         // Définir un seuil de vitesse pour déclencher l'action
  //         var speedThreshold = 0.1; // Ajustez cette valeur selon les besoins

  //         if (speedLeft > speedThreshold || speedRight > speedThreshold) {
  //           console.log("Baisse rapide détectée");
  //           // Insérez ici le code pour déclencher votre action

  //           const box = document.createElement("a-box");
  //           const x = Math.random() * 20 - 10; // Entre -10 et 10
  //           const y = 0;
  //           const z = Math.random() * 20 - 10; // Entre -10 et 10
  //           box.setAttribute("position", { x: x, y: y, z: z });
  //           this.box.sceneEl.appendChild(box);
  //         }
  //       }

  //       previousPositionLeft = currentPositionLeft.clone();
  //       previousPositionRight = currentPositionRight.clone();
  //       previousTime = currentTime;

  //       requestAnimationFrame(checkSpeedAndTriggerAction);
  //     }

  //     checkSpeedAndTriggerAction();
  //   },

  update: function (oldData) {
    console.log("Update look-at");
  },
});
