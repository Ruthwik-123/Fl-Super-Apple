import * as THREE from "three";

export function titaniumMaterial(black = false) {
  return new THREE.MeshPhongMaterial({
    color: black ? 0x2a2c30 : 0xb7b3a8,
    specular: 0xbfbfbf,
    shininess: black ? 40 : 70,
    flatShading: false,
  });
}

export function plasticMaterial(color, extras = {}) {
  return new THREE.MeshLambertMaterial({ color, ...extras });
}
