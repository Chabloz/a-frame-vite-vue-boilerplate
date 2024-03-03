AFRAME.registerSystem('simple-grab', {
  schema: {
    handRight: {type: 'selector', default: '#hand-right'},
    handLeft: {type: 'selector', default: '#hand-left'},
    dummyHandRight: {type: 'selector', default: '#dummy-hand-right'},
    dummyHandLeft: {type: 'selector', default: '#dummy-hand-left'},
    nonVrCursor: {type: 'selector', default: '[cursor]'},
  },

  init: function () {
    this.leftHand = this.data.handLeft;
    this.rightHand = this.data.handRight;
    this.dummyHandLeft = this.data.dummyHandLeft;
    this.dummyHandRight = this.data.dummyHandRight;
    this.nonVrCursor = this.data.nonVrCursor;
  },

});

AFRAME.registerComponent('simple-grab', {

  schema: {
    event: {type: 'string', default: 'click'},
    hand: {type: 'string', oneOf: ['left', 'right'], default: 'right'},
  },

  init: function () {
    this.onEvent = this.onEvent.bind(this);
    this.el.addEventListener(this.data.event, this.onEvent);
  },

  onEvent: function (evt) {
    const cursor = evt.detail.cursorEl;
    const isNonVRCursor = cursor === this.system.nonVrCursor;
  },

  remove: function () {
    this.el.removeEventListener(this.data.event, this.onEvent);
  },

});