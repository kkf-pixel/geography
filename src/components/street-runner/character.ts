import * as THREE from "three";

const JACKET = 0x14c4b8;
const JACKET_DARK = 0x0c8f88;
const ORANGE = 0xff7a1a;
const ORANGE_DEEP = 0xe25e08;
const BACKPACK = 0x12141a;
const POCKET = 0x2c3340;
const PANTS = 0x2a3140;
const PANTS_DARK = 0x1b212c;
const HAIR = 0xa35b2d;
const HAIR_DARK = 0x7a3e1c;
const HEADBAND = 0x12b5ae;
const SKIN = 0xf3c2a0;
const SKIN_SHADOW = 0xe0a884;
const SHOE = 0x1ec4bc;
const SHOE_ORANGE = 0xff8a2a;
const WHITE = 0xf4f7fb;
const GLOVE = 0x16181e;

export type Rig = {
  root: THREE.Group;
  body: THREE.Group;
  armL: THREE.Group;
  armR: THREE.Group;
  elbowL: THREE.Group;
  elbowR: THREE.Group;
  legL: THREE.Group;
  legR: THREE.Group;
  kneeL: THREE.Group;
  kneeR: THREE.Group;
  ankleL: THREE.Group;
  ankleR: THREE.Group;
};

export type RunnerAction = "run" | "jump" | "slide" | "crash";

const materials = new Map<number, THREE.MeshBasicMaterial>();

function mat(color: number) {
  let material = materials.get(color);
  if (!material) {
    material = new THREE.MeshBasicMaterial({ color });
    materials.set(color, material);
  }
  return material;
}

function box(
  parent: THREE.Object3D,
  w: number,
  h: number,
  d: number,
  color: number,
  x: number,
  y: number,
  z: number,
) {
  const mesh = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), mat(color));
  mesh.position.set(x, y, z);
  parent.add(mesh);
  return mesh;
}

function pivot(parent: THREE.Object3D, x: number, y: number, z: number) {
  const group = new THREE.Group();
  group.position.set(x, y, z);
  parent.add(group);
  return group;
}

function buildArm(arm: THREE.Group, side: -1 | 1) {
  box(arm, 0.15, 0.28, 0.15, JACKET, 0, -0.15, 0);
  box(arm, 0.16, 0.08, 0.16, ORANGE, 0, -0.26, 0);
  const elbow = pivot(arm, 0, -0.3, 0);
  box(elbow, 0.13, 0.22, 0.13, JACKET, 0, -0.1, 0);
  box(elbow, 0.15, 0.07, 0.15, ORANGE, side * 0.005, -0.18, 0);
  box(elbow, 0.12, 0.1, 0.13, GLOVE, 0, -0.26, 0.02);
  return elbow;
}

function buildLeg(leg: THREE.Group, side: -1 | 1) {
  box(leg, 0.17, 0.32, 0.17, PANTS, 0, -0.16, 0);
  const knee = pivot(leg, 0, -0.34, 0);
  box(knee, 0.15, 0.26, 0.16, PANTS_DARK, 0, -0.13, 0);
  const ankle = pivot(knee, 0, -0.28, 0.02);
  box(ankle, 0.2, 0.12, 0.34, SHOE, 0, 0.02, 0.08);
  box(ankle, 0.21, 0.035, 0.36, WHITE, 0, -0.045, 0.08);
  box(ankle, 0.055, 0.08, 0.24, SHOE_ORANGE, side * 0.11, 0.03, 0.07);
  box(ankle, 0.12, 0.045, 0.08, WHITE, 0, 0.05, 0.22);
  return { knee, ankle };
}

export function createRunner(): Rig {
  const root = new THREE.Group();
  const body = new THREE.Group();
  root.add(body);

  box(body, 0.52, 0.52, 0.32, JACKET, 0, 1.02, 0.02);
  box(body, 0.08, 0.5, 0.3, JACKET_DARK, -0.26, 1.02, 0.02);
  box(body, 0.52, 0.1, 0.32, JACKET_DARK, 0, 0.78, 0.02);
  box(body, 0.46, 0.11, 0.2, ORANGE, 0, 1.26, -0.05);
  box(body, 0.34, 0.08, 0.12, ORANGE_DEEP, 0, 1.31, -0.1);
  box(body, 0.14, 0.1, 0.12, SKIN, 0, 1.3, 0.05);

  box(body, 0.44, 0.48, 0.24, BACKPACK, 0, 1.06, -0.3);
  box(body, 0.26, 0.18, 0.1, POCKET, 0, 0.94, -0.42);
  box(body, 0.16, 0.07, 0.12, BACKPACK, 0, 1.32, -0.28);
  box(body, 0.07, 0.34, 0.1, BACKPACK, -0.18, 1.14, -0.12);
  box(body, 0.07, 0.34, 0.1, BACKPACK, 0.18, 1.14, -0.12);

  box(body, 0.38, 0.32, 0.34, SKIN, 0, 1.5, 0.03);
  box(body, 0.4, 0.16, 0.36, HAIR, 0, 1.64, -0.01);
  box(body, 0.36, 0.2, 0.14, HAIR_DARK, 0, 1.52, -0.14);
  box(body, 0.44, 0.1, 0.16, HEADBAND, 0, 1.52, -0.12);
  box(body, 0.09, 0.1, 0.4, HEADBAND, -0.19, 1.52, 0.01);
  box(body, 0.09, 0.1, 0.4, HEADBAND, 0.19, 1.52, 0.01);
  box(body, 0.09, 0.12, 0.08, SKIN, -0.23, 1.48, 0.04);
  box(body, 0.09, 0.12, 0.08, SKIN_SHADOW, 0.23, 1.48, 0.02);

  const spikeGeo = new THREE.BoxGeometry(0.1, 0.24, 0.1);
  const spikeMat = mat(HAIR);
  const spikes: Array<[number, number, number, number, number, number]> = [
    [0, 1.82, -0.02, -0.4, 0, 0],
    [-0.13, 1.78, 0.02, -0.25, 0, 0.5],
    [0.13, 1.78, 0.02, -0.2, 0, -0.45],
    [-0.07, 1.8, -0.1, -0.6, 0.25, 0.25],
    [0.08, 1.79, -0.1, -0.55, -0.2, -0.3],
    [0.02, 1.76, 0.1, 0.4, 0, 0.15],
  ];
  for (const [x, y, z, rx, ry, rz] of spikes) {
    const spike = new THREE.Mesh(spikeGeo, spikeMat);
    spike.position.set(x, y, z);
    spike.rotation.set(rx, ry, rz);
    body.add(spike);
  }

  const armL = pivot(body, -0.34, 1.2, 0.04);
  const armR = pivot(body, 0.34, 1.2, 0.04);
  const elbowL = buildArm(armL, -1);
  const elbowR = buildArm(armR, 1);

  const legL = pivot(body, -0.13, 0.72, 0.02);
  const legR = pivot(body, 0.13, 0.72, 0.02);
  const leftLeg = buildLeg(legL, -1);
  const rightLeg = buildLeg(legR, 1);
  root.scale.setScalar(1.22);

  return {
    root,
    body,
    armL,
    armR,
    elbowL,
    elbowR,
    legL,
    legR,
    kneeL: leftLeg.knee,
    kneeR: rightLeg.knee,
    ankleL: leftLeg.ankle,
    ankleR: rightLeg.ankle,
  };
}

function levelFeet(rig: Rig) {
  rig.ankleL.rotation.set(-(rig.legL.rotation.x + rig.kneeL.rotation.x) * 0.82, 0, 0);
  rig.ankleR.rotation.set(-(rig.legR.rotation.x + rig.kneeR.rotation.x) * 0.82, 0, 0);
}

export function poseRun(rig: Rig, time: number) {
  const stride = Math.sin(time * 12);
  rig.body.position.set(0, Math.abs(stride) * 0.07, 0);
  rig.body.rotation.set(0.18, 0, stride * 0.07);

  rig.legL.rotation.set(-stride * 1.15, 0, -0.08);
  rig.legR.rotation.set(stride * 1.15, 0, 0.08);
  rig.kneeL.rotation.set(Math.max(0, -stride) * 1.45, 0, 0);
  rig.kneeR.rotation.set(Math.max(0, stride) * 1.45, 0, 0);

  rig.armL.rotation.set(-stride * 1.08, 0, -0.38);
  rig.armR.rotation.set(stride * 1.08, 0, 0.38);
  rig.elbowL.rotation.set(0.35 + Math.max(0, -stride) * 1.05, 0, 0);
  rig.elbowR.rotation.set(0.35 + Math.max(0, stride) * 1.05, 0, 0);
  levelFeet(rig);
}

/** Upright airborne pose. Clears any slide pitch, roll, and body drop. */
export function poseJump(rig: Rig) {
  rig.body.position.set(0, 0, 0);
  rig.body.rotation.set(0, 0, 0);

  rig.armL.rotation.set(-0.5, 0, -1.35);
  rig.armR.rotation.set(-0.5, 0, 1.35);
  rig.elbowL.rotation.set(0.08, 0, 0);
  rig.elbowR.rotation.set(0.08, 0, 0);

  rig.legL.rotation.set(-0.55, 0, -0.28);
  rig.legR.rotation.set(-0.22, 0, 0.26);
  rig.kneeL.rotation.set(1.15, 0, 0);
  rig.kneeR.rotation.set(1.25, 0, 0);
  levelFeet(rig);
}

export function poseSlide(rig: Rig, time: number) {
  const drop = Math.min(1, time / 0.1);
  rig.body.position.set(0.02 * drop, -0.32 * drop, 0.18 * drop);
  rig.body.rotation.set(1.05 * drop, 0.02 * drop, -0.2 * drop);

  rig.armL.rotation.set(1.05, 0, -0.7);
  rig.armR.rotation.set(-1.15, 0.1, 0.15);
  rig.elbowL.rotation.set(0.15, 0, 0);
  rig.elbowR.rotation.set(0.1, 0, 0);

  rig.legL.rotation.set(0.55, 0, -0.08);
  rig.legR.rotation.set(0.2, 0, 0.1);
  rig.kneeL.rotation.set(0.2, 0, 0);
  rig.kneeR.rotation.set(0.85, 0, 0);
  rig.ankleL.rotation.set(-0.4, 0, 0);
  rig.ankleR.rotation.set(-0.2, 0, 0);
}

export function poseCrash(rig: Rig, time: number) {
  const tumble = Math.min(1, time / 0.28);
  rig.body.position.set(0.05 * tumble, -0.12 * tumble, 0.28 * tumble);
  rig.body.rotation.set(0.85 * tumble, 0.25 * tumble, -0.7 * tumble);
  rig.armL.rotation.set(-0.7, 0, 0.5);
  rig.armR.rotation.set(0.9, 0, -0.6);
  rig.elbowL.rotation.set(0.45, 0, 0);
  rig.elbowR.rotation.set(0.8, 0, 0);
  rig.legL.rotation.set(-0.25, 0, 0.12);
  rig.legR.rotation.set(0.45, 0, -0.1);
  rig.kneeL.rotation.set(0.35, 0, 0);
  rig.kneeR.rotation.set(0.55, 0, 0);
  rig.ankleL.rotation.set(0, 0, 0);
  rig.ankleR.rotation.set(0, 0, 0);
}
