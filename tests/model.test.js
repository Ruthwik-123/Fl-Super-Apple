import assert from "node:assert/strict";

const gradient = () => ({ addColorStop() {} });
const context = new Proxy({}, {
  get(target, key) {
    if (key in target) return target[key];
    if (key === "createRadialGradient" || key === "createLinearGradient") return gradient;
    return () => {};
  },
  set(target, key, value) {
    target[key] = value;
    return true;
  },
});
globalThis.document = { createElement: () => ({ width: 0, height: 0, getContext: () => context }) };

const { ProductWatch } = await import("../js/product/watch-model.js");
const watch = new ProductWatch({ capabilities: { getMaxAnisotropy: () => 8 } });
let triangles = 0;
let meshes = 0;
watch.group.traverse((object) => {
  if (!object.isMesh) return;
  meshes++;
  const positions = object.geometry.getAttribute("position");
  const count = object.geometry.index ? object.geometry.index.count / 3 : positions.count / 3;
  triangles += count * (object.isInstancedMesh ? object.count : 1);
});

assert.ok(meshes < 80, `product exceeded mesh budget: ${meshes}`);
assert.ok(triangles < 50000, `product exceeded triangle budget: ${triangles}`);
assert.equal(watch.bandVariants.length, 3);
assert.ok(watch.animatedParts.length >= 12);

for (const progress of [0, 0.25, 0.5, 0.75, 1]) {
  watch.setAssembly(progress);
  watch.setOptics(1 - progress);
  watch.setFinish(progress);
  watch.setBand(progress * 2);
  watch.group.traverse((object) => {
    assert.ok(object.position.toArray().every(Number.isFinite), `${object.name} has an invalid position`);
    assert.ok(object.quaternion.toArray().every(Number.isFinite), `${object.name} has an invalid rotation`);
  });
}
watch.dispose();
console.log(`model: ${meshes} meshes, ${Math.round(triangles)} maximum triangles`);
