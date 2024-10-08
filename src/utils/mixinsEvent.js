export default {

  mixinEvent() {
    this.listeners = new Map();
  },

  on(event, callback) {
    return this.addListener(event, callback);
  },

  once(event, callback) {
    const callbackOnce = data => {
      this.removeListener(event, callbackOnce);
      callback(data);
    }
    this.addListener(event, callbackOnce);
    return () => this.removeListener(event, callbackOnce);
  },

  addListener(event, callback) {
    let callbackSet = this.listeners.get(event);
    // If it is the first callback for this event, we create a set storage
    if (!callbackSet) {
      callbackSet = new Set();
      this.listeners.set(event, callbackSet);
    }
    callbackSet.add(callback);
    // Return a removeListener function for conveniance
    return () => this.removeListener(event, callback);
  },

  off(event, callback) {
    this.removeListener(event, callback);
  },

  removeListener(event, callback) {
    const callbackSet = this.listeners.get(event);
    if (!callbackSet) return false;
    callbackSet.delete(callback);
  },

  emit(event, data = {}) {
    const callbackSet = this.listeners.get(event);
    if (!callbackSet) return;
    // we need to copy the set to avoid concurrency issues
    // because callback might add or remove listeners
    const toCalls = [...callbackSet];
    for (const callback of toCalls) {
      callback(data);
    }
  }

};