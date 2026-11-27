import * as THREE from "three";
import { withBasePath } from "@/lib/base-path";

export type Rig = {
  root: THREE.Group;
  body: THREE.Group;
  ready: boolean;
  show: (index: number) => void;
};

export type RunnerAction = "run" | "jump" | "slide" | "crash";

/** World units per source pixel. A run cell is about 1.9 tall. */
const PIXEL = 0.00635;

type Frame = {
  texture: THREE.CanvasTexture;
  width: number;
  height: number;
  footX: number;
  footY: number;
};

const RUN_FRAMES = [0, 1, 2, 3];
const JUMP_FRAME = 4;
const SLIDE_FRAMES = [6, 7];

export function createRunner(): Rig {
  const root = new THREE.Group();
  const body = new THREE.Group();
  root.add(body);

  const material = new THREE.MeshBasicMaterial({
    transparent: true,
    alphaTest: 0.45,
    side: THREE.DoubleSide,
    depthWrite: true,
  });
  const mesh = new THREE.Mesh(new THREE.PlaneGeometry(1, 1), material);
  mesh.rotation.y = Math.PI;
  body.add(mesh);

  const frames: Frame[] = [];
  let wanted = 0;

  function show(index: number) {
    wanted = index;
    const frame = frames[index];
    if (!frame) return;
    material.map = frame.texture;
    material.needsUpdate = true;
    const scaleX = frame.width * PIXEL;
    const scaleY = frame.height * PIXEL;
    mesh.scale.set(scaleX, scaleY, 1);
    mesh.position.set(
      -(frame.footX / frame.width - 0.5) * scaleX,
      -(0.5 - frame.footY / frame.height) * scaleY,
      0,
    );
  }

  const rig: Rig = { root, body, ready: false, show };

  const image = new Image();
  image.decoding = "async";
  image.onload = () => {
    frames.push(...sliceSheet(image));
    rig.ready = frames.length === 8;
    const index = wanted;
    wanted = -1;
    show(index);
  };
  image.src = withBasePath("/street-runner/character-poses.png");

  return rig;
}

function sliceSheet(image: HTMLImageElement) {
  const columns = 4;
  const rows = 2;
  const cellW = Math.floor(image.width / columns);
  const cellH = Math.floor(image.height / rows);
  const frames: Frame[] = [];
  for (let row = 0; row < rows; row += 1) {
    for (let col = 0; col < columns; col += 1) {
      frames.push(cropCell(image, col * cellW, row * cellH, cellW, cellH));
    }
  }
  return frames;
}

function cropCell(
  image: CanvasImageSource,
  sx: number,
  sy: number,
  sw: number,
  sh: number,
): Frame {
  const canvas = document.createElement("canvas");
  canvas.width = sw;
  canvas.height = sh;
  const ctx = canvas.getContext("2d", { willReadFrequently: true });
  if (!ctx) throw new Error("無法裁切角色");
  ctx.drawImage(image, sx, sy, sw, sh, 0, 0, sw, sh);
  const imageData = ctx.getImageData(0, 0, sw, sh);
  const data = imageData.data;
  let minX = sw;
  let minY = sh;
  let maxX = 0;
  let maxY = 0;
  for (let i = 0; i < data.length; i += 4) {
    const r = data[i] ?? 0;
    const g = data[i + 1] ?? 0;
    const b = data[i + 2] ?? 0;
    const peak = Math.max(r, g, b);
    const floor = Math.min(r, g, b);
    if (floor > 232 && peak - floor < 26) {
      data[i + 3] = 0;
      continue;
    }
    const pixel = i / 4;
    const x = pixel % sw;
    const y = Math.floor(pixel / sw);
    if (x < minX) minX = x;
    if (y < minY) minY = y;
    if (x > maxX) maxX = x;
    if (y > maxY) maxY = y;
  }
  ctx.putImageData(imageData, 0, 0);

  const width = Math.max(1, maxX - minX + 1);
  const height = Math.max(1, maxY - minY + 1);
  const cropped = document.createElement("canvas");
  cropped.width = width;
  cropped.height = height;
  const croppedCtx = cropped.getContext("2d");
  if (!croppedCtx) throw new Error("無法裁切角色");
  croppedCtx.drawImage(canvas, minX, minY, width, height, 0, 0, width, height);

  let footWeight = 0;
  let footSum = 0;
  const footBand = croppedCtx.getImageData(0, Math.max(0, height - 12), width, Math.min(12, height));
  for (let i = 0; i < footBand.data.length; i += 4) {
    if ((footBand.data[i + 3] ?? 0) < 40) continue;
    footWeight += 1;
    footSum += (i / 4) % width;
  }

  const texture = new THREE.CanvasTexture(cropped);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.magFilter = THREE.NearestFilter;
  texture.minFilter = THREE.NearestFilter;
  texture.generateMipmaps = false;

  return {
    texture,
    width,
    height,
    footX: footWeight > 0 ? footSum / footWeight : width / 2,
    footY: height - 1,
  };
}

function clearPose(rig: Rig) {
  rig.body.position.set(0, 0, 0);
  rig.body.rotation.set(0, 0, 0);
}

export function poseRun(rig: Rig, time: number) {
  clearPose(rig);
  rig.body.position.y = Math.abs(Math.sin(time * 18)) * 0.035;
  rig.show(RUN_FRAMES[Math.floor(time * 9) % RUN_FRAMES.length] ?? 0);
}

/** Upright jump sprite. Drops any slide offset or tilt in the same turn. */
export function poseJump(rig: Rig) {
  clearPose(rig);
  rig.show(JUMP_FRAME);
}

export function poseSlide(rig: Rig, time: number) {
  clearPose(rig);
  rig.show(time < 0.14 ? (SLIDE_FRAMES[0] ?? 6) : (SLIDE_FRAMES[1] ?? 7));
}

export function poseCrash(rig: Rig, time: number) {
  const tumble = Math.min(1, time / 0.28);
  rig.body.position.set(0, 0, 0);
  rig.body.rotation.set(0, 0, -0.45 * tumble);
  rig.show(SLIDE_FRAMES[1] ?? 7);
}
