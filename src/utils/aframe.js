export function copyPosition(sourceEl, targetEl) {
  const sourceObject = sourceEl.object3D;
  const targetObject = targetEl.object3D;
  const sourceWorldPos = new THREE.Vector3();
  sourceObject.getWorldPosition(sourceWorldPos);
  const localPos = targetEl.parentEl.object3D.worldToLocal(sourceWorldPos.clone());
  targetObject.position.copy(localPos);
}

export function copyRotation(sourceEl, targetEl, toLocal = false) {
  const sourceObject = sourceEl.object3D;
  const targetObject = targetEl.object3D;
  const quaternion = new THREE.Quaternion();

  if (!toLocal) {
    sourceObject.matrixWorld.decompose(new THREE.Vector3(), quaternion, new THREE.Vector3());
    targetObject.quaternion.copy(quaternion);
  } else {
    const parentQuaternion = new THREE.Quaternion();
    sourceObject.getWorldQuaternion(quaternion);
    targetObject.parent.getWorldQuaternion(parentQuaternion);
    parentQuaternion.invert();
    quaternion.premultiply(parentQuaternion);
    targetObject.quaternion.copy(quaternion);
  }
}