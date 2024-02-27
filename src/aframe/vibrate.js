AFRAME.registerComponent("vibrate-controller", {
  schema: {
    hand: { default: "right" },
    intensity: { type: "number", default: 1.0 },
    duration: { type: "number", default: 100 }, // ms
  },
  init: function () {
    this.el.addEventListener("triggerdown", (evt) => {
      this.vibrate();
    });
  },
  vibrate: function () {
    const hand = this.data.hand;
    const controller = this.el.sceneEl.systems[
      "tracked-controls-webxr"
    ].controllers.find((d) => d.hand === hand);
    if (
      controller &&
      controller.gamepad &&
      controller.gamepad.hapticActuators &&
      controller.gamepad.hapticActuators[0]
    ) {
      controller.gamepad.hapticActuators[0].pulse(
        this.data.intensity,
        this.data.duration
      );
    }
  },
});

AFRAME.registerComponent('vibrate-on-click', {
    init: function() {
      this.el.addEventListener('click', (e) => {
        this.vibrateController(e.detail.cursorEl.components['tracked-controls'].controller);
      });
    },
    vibrateController: function(controller) {
      if (controller && controller.hapticActuators && controller.hapticActuators.length > 0) {
        controller.hapticActuators[0].pulse(1.0, 500); // Vibration à 100% de l'intensité pour 500ms
      }
    }
  });