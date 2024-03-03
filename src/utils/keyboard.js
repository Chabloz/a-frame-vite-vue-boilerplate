import mixinEvent from './mixinsEvent.js';

export default class Keyboard {

  constructor({
    repeat = false,
    maxHistory = 10,
    caseSensitive = false,
    domEl = window,
    useCode = true
  } = {}) {
    Object.assign(this, mixinEvent);
    this.mixinEvent();

    this.repeat = repeat;
    this.maxHistory = maxHistory;
    this.caseSensitive = caseSensitive;
    this.domEl = domEl;
    this.useCode = useCode;

    this.keysCurrentlyPressed = new Set();
    this.history = [];

    this._onKeyDown = this._onKeyDown.bind(this);
    this._onKeyUp = this._onKeyUp.bind(this);
    this.domEl.addEventListener('keydown', this._onKeyDown);
    this.domEl.addEventListener('keyup', this._onKeyUp);
  }

  remove() {
    this.domEl.removeEventListener('keydown', this._onKeyDown);
    this.domEl.removeEventListener('keyup', this._onKeyUp);
  }

  onKey(key, callback, downOrUp = 'down') {
    if (!this.caseSensitive) key = key.toUpperCase();
    return this.on(`keyboard:${key}:${downOrUp}`, callback);
  }

  onKeys(keys, callback, downOrUp = 'down') {
    if (!this.caseSensitive) keys = keys.map(key => key.toUpperCase());
    const callbackHandler = keyPressed => {
      if (!keys.includes(keyPressed)) return;
      if (!keys.every(key => this.isKeyDown(key))) return;
      callback(keyPressed);
    };
    return this.on(`keyboard:${downOrUp}`, callbackHandler);
  }

  onCombo(keys, callback, downOrUp = 'down') {
    keys = keys.reverse();
    if (!this.caseSensitive) keys = keys.map(key => key.toUpperCase());
    const callbackHandler = keyPressed => {
      const len = this.history.length - 1;
      let i = 0;
      while (i < keys.length && this.history[len - i] == keys[i]) i++;
      if (i == keys.length) callback(keyPressed);
    };
    return this.on(`keyboard:${downOrUp}`, callbackHandler);
  }

  _onKeyDown(event) {
    if (!this.repeat && event.repeat) return;
    let keyPressed = this.useCode ? event.code : event.key;
    if (!this.caseSensitive) keyPressed = keyPressed.toUpperCase();
    this.keysCurrentlyPressed.add(keyPressed);

    if (this.history.length >= this.maxHistory) this.history.shift();
    this.history.push(keyPressed);

    this.emit('keyboard:down', keyPressed);
    this.emit(`keyboard:${keyPressed}:down`, keyPressed);
  }

  _onKeyUp(event) {
    let keyReleased = (this.useCode) ? event.code : event.key;
    if (!this.caseSensitive) keyReleased = keyReleased.toUpperCase();
    this.emit('keyboard:up', keyReleased);
    this.emit(`keyboard:${keyReleased}:up`, keyReleased);
    this.keysCurrentlyPressed.delete(keyReleased);
  }

  isKeyDown(key) {
    if (!this.caseSensitive) key = key.toUpperCase();
    return this.keysCurrentlyPressed.has(key);
  }

  areKeysDown(keys) {
    if (!Array.isArray(keys)) keys = [...arguments];
    return keys.every(key => this.isKeyDown(key));
  }

}