import * as THREE from "three";

/** Restrained technical overlay used only for the link shot. */
export class SignalField {
  constructor(scene) {
    this.group = new THREE.Group();
    this.group.name = "Link field";
    this.materials = [];
    const axes = [[Math.PI / 2, 0, 0], [0.35, 0.8, 0], [1.1, -0.45, 0.3]];
    axes.forEach((rotation, index) => {
      const material = new THREE.MeshBasicMaterial({
        color: index === 1 ? 0xc6ff4a : 0x8ecbff,
        transparent: true,
        opacity: 0,
        depthWrite: false,
        blending: THREE.AdditiveBlending,
        toneMapped: false,
      });
      const ring = new THREE.Mesh(new THREE.TorusGeometry(18 + index * 4.5, 0.045, 5, 96), material);
      ring.rotation.set(...rotation);
      this.group.add(ring);
      this.materials.push(material);
    });

    this.nodeMaterial = new THREE.MeshBasicMaterial({ color: 0xb9ddff, transparent: true, opacity: 0, toneMapped: false });
    const nodes = new THREE.InstancedMesh(new THREE.SphereGeometry(0.18, 8, 6), this.nodeMaterial, 9);
    nodes.name = "Mesh nodes";
    const transform = new THREE.Object3D();
    for (let index = 0; index < 9; index++) {
      const angle = index * 2.4;
      const radius = 16 + (index % 3) * 4.5;
      transform.position.set(Math.cos(angle) * radius, Math.sin(angle * 1.37) * radius * 0.7, Math.sin(angle) * 5);
      transform.updateMatrix();
      nodes.setMatrixAt(index, transform.matrix);
    }
    nodes.instanceMatrix.needsUpdate = true;
    this.group.add(nodes);
    this.group.visible = false;
    scene.add(this.group);
  }

  update(state, productPosition = state.product) {
    const strength = state.signal;
    this.group.visible = strength > 0.008;
    if (!this.group.visible) return;
    this.group.position.copy(productPosition);
    this.group.rotation.y = strength * 0.12;
    this.materials.forEach((material, index) => {
      material.opacity = strength * (0.11 + index * 0.025);
    });
    this.nodeMaterial.opacity = strength * 0.72;
  }

  dispose() {
    this.group.traverse((object) => object.geometry?.dispose());
    this.materials.forEach((material) => material.dispose());
    this.nodeMaterial.dispose();
    this.group.removeFromParent();
  }
}
