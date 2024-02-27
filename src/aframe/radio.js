AFRAME.registerComponent("radio", {
  schema: {},
  init: function () {
    const sound = document.createElement("a-sound");

    sound.setAttribute("src", "#sound-radio-1");
    // sound.setAttribute("autoplay", true);
    this.el.appendChild(sound);

    this.el.addEventListener("click", () => {
      console.log("Play");
    });
  },
});
