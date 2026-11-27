import * as THREE from "three";
import { createSfx, type Sfx } from "./audio";
import {
  createRunner,
  poseCrash,
  poseJump,
  poseRun,
  poseSlide,
  type Rig,
  type RunnerAction,
} from "./character";
import {
  createSegment,
  createSkyTexture,
  createTemplates,
  LANE_X,
  SEG_LEN,
  shadowMaterial,
  type ObstacleKind,
} from "./scenery";

export type Phase = "ready" | "running" | "crashed";

export type Hud = {
  phase: Phase;
  score: number;
  best: number;
  distance: number;
  multOn: boolean;
  multLeft: number;
  muted: boolean;
  newBest: boolean;
  action: RunnerAction;
};

export type RunnerApi = {
  start: () => void;
  input: (action: "left" | "right" | "jump" | "slide") => void;
  setMuted: (muted: boolean) => void;
  dispose: () => void;
};

const BEST_KEY = "street-runner-best";
const MUTE_KEY = "street-runner-muted";
const SPEED0 = 12;
const SPEED_MAX = 20;
const ACCEL = 0.28;
const JUMP_DURATION = 0.58;
const JUMP_HEIGHT = 1.15;
const SLIDE_DURATION = 0.64;
const MULT_TIME = 8;
const AHEAD = 100;

type Entity = {
  kind: ObstacleKind;
  lane: number;
  length: number;
  mesh: THREE.Group;
  alive: boolean;
  passed: boolean;
};

type Spark = {
  mesh: THREE.Mesh;
  life: number;
  vel: THREE.Vector3;
};

function readNumber(key: string) {
  try {
    const value = Number(localStorage.getItem(key) ?? "0");
    return Number.isFinite(value) ? value : 0;
  } catch {
    return 0;
  }
}

function readMuted() {
  try {
    return localStorage.getItem(MUTE_KEY) === "1";
  } catch {
    return false;
  }
}

function writeStore(key: string, value: string) {
  try {
    localStorage.setItem(key, value);
  } catch {
    /* private mode */
  }
}

class Runner {
  lane = 0;
  action: RunnerAction = "run";
  actionTime = 0;
  jumpHeight = 0;

  constructor(readonly rig: Rig) {}

  /**
   * Jump cancels a slide. The body is restored upright in the same turn
   * so the slide pitch, roll, and drop do not stick into the airborne pose.
   */
  requestJump() {
    if (this.action === "crash" || this.action === "jump") return false;
    this.action = "jump";
    this.actionTime = 0;
    this.jumpHeight = 0;
    this.rig.root.position.y = 0;
    this.rig.root.rotation.set(0, 0, 0);
    poseJump(this.rig);
    return true;
  }

  requestSlide() {
    if (this.action !== "run") return false;
    this.action = "slide";
    this.actionTime = 0;
    return true;
  }

  crash() {
    this.action = "crash";
    this.actionTime = 0;
    this.jumpHeight = 0;
    this.rig.root.position.y = 0;
    this.rig.root.rotation.set(0, 0, 0);
    poseCrash(this.rig, 0);
  }

  update(dt: number) {
    const target = this.lane * LANE_X;
    const dx = target - this.rig.root.position.x;
    const step = 16 * dt;
    if (Math.abs(dx) <= step) this.rig.root.position.x = target;
    else this.rig.root.position.x += Math.sign(dx) * step;
    const lean = THREE.MathUtils.clamp(dx * -0.12, -0.28, 0.28);

    if (this.action === "crash") {
      this.actionTime += dt;
      poseCrash(this.rig, this.actionTime);
      this.rig.root.position.y = 0;
      this.rig.root.rotation.set(0, 0, 0);
      return;
    }

    this.actionTime += dt;
    if (this.action === "jump" && this.actionTime >= JUMP_DURATION) {
      this.action = "run";
      this.actionTime = 0;
      this.jumpHeight = 0;
    } else if (this.action === "slide" && this.actionTime >= SLIDE_DURATION) {
      this.action = "run";
      this.actionTime = 0;
      this.jumpHeight = 0;
    }

    if (this.action === "jump") {
      const t = this.actionTime / JUMP_DURATION;
      this.jumpHeight = Math.sin(t * Math.PI) * JUMP_HEIGHT;
      poseJump(this.rig);
      this.rig.root.position.y = this.jumpHeight;
      this.rig.root.rotation.set(0, 0, lean * 0.35);
      return;
    }

    this.jumpHeight = 0;
    this.rig.root.position.y = 0;
    if (this.action === "slide") {
      poseSlide(this.rig, this.actionTime);
      this.rig.root.rotation.set(0, 0, 0);
      return;
    }

    poseRun(this.rig, this.actionTime);
    this.rig.root.rotation.set(0, 0, lean);
  }
}

export function mountRunner(
  canvas: HTMLCanvasElement,
  hooks: { onHud: (hud: Hud) => void; onFx: (text: string) => void },
): RunnerApi {
  const renderer = new THREE.WebGLRenderer({
    canvas,
    antialias: false,
    alpha: false,
    preserveDrawingBuffer: true,
  });
  renderer.setPixelRatio(1);
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.setClearColor(0x121a30, 1);

  const scene = new THREE.Scene();
  scene.background = createSkyTexture() ?? new THREE.Color(0x121a30);
  scene.fog = new THREE.Fog(0x1c2744, 18, 72);

  const camera = new THREE.PerspectiveCamera(48, 1, 0.1, 180);
  camera.position.set(0, 2.05, -5.05);
  camera.lookAt(0, 0.72, 12);

  const rig = createRunner();
  scene.add(rig.root);
  const runner = new Runner(rig);

  const shadow = new THREE.Mesh(new THREE.PlaneGeometry(1.25, 0.55), shadowMaterial());
  shadow.rotation.x = -Math.PI / 2;
  shadow.position.y = 0.04;
  scene.add(shadow);

  const ground = new THREE.Mesh(
    new THREE.PlaneGeometry(90, 240),
    new THREE.MeshBasicMaterial({ color: 0x121820 }),
  );
  ground.rotation.x = -Math.PI / 2;
  ground.position.set(0, -0.06, 40);
  scene.add(ground);

  const segments: THREE.Group[] = [];
  for (let i = 0; i < 6; i += 1) {
    const segment = createSegment(i);
    scene.add(segment);
    segments.push(segment);
  }

  const templates = createTemplates();
  const entities: Entity[] = [];
  const sparks: Spark[] = [];
  const sparkGeo = new THREE.BoxGeometry(0.09, 0.09, 0.09);
  const sparkMat = new THREE.MeshBasicMaterial({ color: 0xffe14a });
  const dustMat = new THREE.MeshBasicMaterial({ color: 0xd9dde6 });

  const audio: Sfx = createSfx(readMuted());
  let phase: Phase = "ready";
  let score = 0;
  let best = readNumber(BEST_KEY);
  let distance = 0;
  let multLeft = 0;
  let newBest = false;
  let runTime = 0;
  let frontier = 16;
  let introIndex = 0;
  let comboShown = false;
  let sparkTimer = 0;
  let spin = 0;
  let stopped = false;
  let raf = 0;
  let lastHud = "";

  function speed() {
    return Math.min(SPEED_MAX, SPEED0 + runTime * ACCEL);
  }

  function clearEntities() {
    for (const entity of entities) scene.remove(entity.mesh);
    entities.length = 0;
  }

  function spawn(kind: ObstacleKind, lane: number, z: number) {
    const mesh = templates[kind].clone(true);
    const length = kind === "train" ? 7.5 : kind === "arch" ? 1.35 : kind === "barrier" ? 1.2 : 0.85;
    const y = kind === "mult" ? 1.25 : kind === "coin" ? 0.92 : 0;
    mesh.position.set(lane * LANE_X, y, z);
    scene.add(mesh);
    entities.push({ kind, lane, length, mesh, alive: true, passed: false });
  }

  function coinLine(z: number, lane: number, count: number, gap = 2.2) {
    for (let i = 0; i < count; i += 1) spawn("coin", lane, z + i * gap);
  }

  function otherLane(lane: number) {
    if (lane === 0) return Math.random() < 0.5 ? -1 : 1;
    return 0;
  }

  const intro: Array<(z: number) => number> = [
    (z) => {
      coinLine(z, 0, 5);
      coinLine(z + 0.5, -1, 4, 2.5);
      coinLine(z + 0.8, 1, 4, 2.5);
      return 16;
    },
    (z) => {
      coinLine(z, -1, 5);
      return 14;
    },
    (z) => {
      spawn("barrier", 0, z + 2);
      coinLine(z, 1, 4);
      return 16;
    },
    (z) => {
      spawn("train", -1, z + 6);
      coinLine(z, 0, 5);
      return 20;
    },
    (z) => {
      spawn("arch", 0, z + 2);
      coinLine(z, -1, 4);
      return 16;
    },
    (z) => {
      spawn("mult", 0, z + 2);
      coinLine(z + 4, 0, 4);
      return 16;
    },
    (z) => {
      spawn("train", 1, z + 6);
      spawn("barrier", -1, z + 2);
      coinLine(z, 0, 4);
      return 20;
    },
    (z) => {
      spawn("train", -1, z + 7);
      spawn("train", 1, z + 7);
      coinLine(z, 0, 6);
      return 22;
    },
  ];

  function spawnPattern(z: number) {
    if (introIndex < intro.length) {
      const step = intro[introIndex];
      introIndex += 1;
      return step(z);
    }
    const roll = Math.random();
    const lane = Math.floor(Math.random() * 3) - 1;
    if (roll < 0.22) {
      coinLine(z, lane, 5);
      return 16;
    }
    if (roll < 0.44) {
      spawn("barrier", lane, z + 2);
      coinLine(z, otherLane(lane), 4);
      return 16;
    }
    if (roll < 0.66) {
      spawn("train", lane, z + 6);
      coinLine(z, otherLane(lane), 5);
      return 20;
    }
    if (roll < 0.82) {
      spawn("arch", lane, z + 2);
      coinLine(z, otherLane(lane), 4);
      return 16;
    }
    if (roll < 0.92) {
      for (const slot of [-1, 0, 1]) {
        if (slot !== lane) spawn("train", slot, z + 6);
      }
      coinLine(z, lane, 5);
      return 22;
    }
    spawn("barrier", lane, z + 1);
    spawn("arch", lane, z + 12);
    spawn("mult", otherLane(lane), z + 6);
    return 20;
  }

  function layoutSegments() {
    segments.forEach((segment, index) => {
      segment.position.z = index * SEG_LEN - SEG_LEN * 0.35;
    });
  }

  function resetWorld() {
    clearEntities();
    introIndex = 0;
    frontier = 14;
    while (frontier < AHEAD) frontier += spawnPattern(frontier);
    layoutSegments();
    runner.lane = 0;
    runner.action = "run";
    runner.actionTime = 0;
    runner.jumpHeight = 0;
    rig.root.position.set(0, 0, 0);
    rig.root.rotation.set(0, 0, 0);
    poseRun(rig, 0);
    score = 0;
    distance = 0;
    multLeft = 0;
    newBest = false;
    runTime = 0;
    comboShown = false;
  }

  function burst(material: THREE.Material, count: number, origin: THREE.Vector3, force: number) {
    for (let i = 0; i < count; i += 1) {
      const mesh = new THREE.Mesh(sparkGeo, material);
      mesh.position.copy(origin);
      scene.add(mesh);
      sparks.push({
        mesh,
        life: 0.22 + Math.random() * 0.16,
        vel: new THREE.Vector3(
          (Math.random() - 0.5) * force,
          Math.random() * force,
          -Math.random() * force,
        ),
      });
    }
  }

  function collect(entity: Entity) {
    entity.alive = false;
    entity.mesh.visible = false;
    const mult = multLeft > 0 ? 2 : 1;
    if (entity.kind === "coin") {
      score += 10 * mult;
      audio.coin();
      burst(sparkMat, 4, entity.mesh.position, 2.2);
      return;
    }
    multLeft = MULT_TIME;
    comboShown = false;
    audio.mult();
    hooks.onFx("加倍！");
    burst(sparkMat, 8, entity.mesh.position, 3);
  }

  function crash() {
    if (phase !== "running") return;
    phase = "crashed";
    runner.crash();
    audio.crash();
    const finalScore = Math.floor(score);
    if (finalScore > best) {
      best = finalScore;
      newBest = true;
      writeStore(BEST_KEY, String(best));
    }
    burst(dustMat, 10, rig.root.position.clone().setY(0.4), 3.5);
  }

  function collide() {
    const px = rig.root.position.x;
    const jumping = runner.action === "jump" && runner.jumpHeight > 0.22;
    const sliding = runner.action === "slide" && runner.actionTime > 0.07;
    for (const entity of entities) {
      if (!entity.alive) continue;
      const z = entity.mesh.position.z;
      const half = entity.length / 2;
      if (z < -half - 0.4 || z > half + 0.5) continue;
      if (Math.abs(px - entity.lane * LANE_X) > 0.95) continue;
      if (entity.kind === "coin" || entity.kind === "mult") {
        collect(entity);
        continue;
      }
      if (entity.kind === "barrier" && jumping) continue;
      if (entity.kind === "arch" && sliding) continue;
      crash();
      return;
    }
  }

  function moveWorld(dt: number) {
    const delta = speed() * dt;
    frontier -= delta;
    for (const segment of segments) segment.position.z -= delta;
    for (const entity of entities) entity.mesh.position.z -= delta;
    let maxZ = -Infinity;
    for (const segment of segments) maxZ = Math.max(maxZ, segment.position.z);
    for (const segment of segments) {
      if (segment.position.z < -SEG_LEN * 0.75) {
        segment.position.z = maxZ + SEG_LEN;
        maxZ = segment.position.z;
      }
    }
    while (frontier < AHEAD) frontier += spawnPattern(frontier);
    for (let i = entities.length - 1; i >= 0; i -= 1) {
      const entity = entities[i];
      if (entity.mesh.position.z < -1.2) {
        scene.remove(entity.mesh);
        entities.splice(i, 1);
      }
    }
  }

  function markPassed() {
    for (const entity of entities) {
      if (entity.passed || !entity.alive) continue;
      if (entity.mesh.position.z > -1.1) continue;
      entity.passed = true;
      if (entity.kind !== "barrier" && entity.kind !== "arch") continue;
      if (multLeft <= 0 || comboShown) continue;
      comboShown = true;
      hooks.onFx("連擊！");
    }
  }

  function bobPickups() {
    for (const entity of entities) {
      if (!entity.alive || (entity.kind !== "coin" && entity.kind !== "mult")) continue;
      const base = entity.kind === "mult" ? 1.25 : 0.92;
      const face = Math.abs(Math.sin(spin * 5 + entity.mesh.position.z));
      entity.mesh.scale.x = 0.16 + face * 0.84;
      entity.mesh.position.y = base + Math.sin(spin * 3 + entity.mesh.position.z) * 0.08;
    }
  }

  function updateSparks(dt: number) {
    sparkTimer -= dt;
    if (phase === "running" && sparkTimer <= 0) {
      const origin = new THREE.Vector3(rig.root.position.x, 0.08, 0.15);
      if (runner.action === "slide") {
        sparkTimer = 0.04;
        origin.set(rig.root.position.x - 0.15, 0.06, 0.45);
        burst(sparkMat, 1, origin, 1.6);
      } else if (runner.action === "run") {
        sparkTimer = 0.08;
        burst(dustMat, 1, origin, 1.2);
      }
    }
    for (let i = sparks.length - 1; i >= 0; i -= 1) {
      const spark = sparks[i];
      spark.life -= dt;
      spark.vel.y -= 6 * dt;
      spark.mesh.position.addScaledVector(spark.vel, dt);
      const scale = Math.max(spark.life * 3, 0.01);
      spark.mesh.scale.setScalar(scale);
      if (spark.life <= 0) {
        scene.remove(spark.mesh);
        sparks.splice(i, 1);
      }
    }
  }

  function publish() {
    const hud: Hud = {
      phase,
      score: Math.floor(score),
      best,
      distance: Math.floor(distance),
      multOn: multLeft > 0,
      multLeft: Math.max(0, Math.ceil(multLeft)),
      muted: audio.muted,
      newBest,
      action: runner.action,
    };
    const key = JSON.stringify(hud);
    if (key !== lastHud) {
      lastHud = key;
      hooks.onHud(hud);
    }
    let nearest = "";
    let nearestZ = 999;
    for (const entity of entities) {
      if (!entity.alive || entity.kind === "coin" || entity.kind === "mult") continue;
      const z = entity.mesh.position.z;
      if (z < -0.4 || z > nearestZ) continue;
      if (Math.abs(rig.root.position.x - entity.lane * LANE_X) > 1.15) continue;
      nearestZ = z;
      nearest = entity.kind;
    }
    canvas.dataset.phase = hud.phase;
    canvas.dataset.action = runner.action;
    canvas.dataset.bodyPitch = rig.body.rotation.x.toFixed(3);
    canvas.dataset.bodyY = rig.body.position.y.toFixed(3);
    canvas.dataset.bodyRoll = rig.body.rotation.z.toFixed(3);
    canvas.dataset.score = String(hud.score);
    canvas.dataset.lane = String(runner.lane);
    canvas.dataset.nearest = nearest;
    canvas.dataset.nearestZ = nearest ? nearestZ.toFixed(2) : "";
    canvas.dataset.sprites = rig.ready ? "1" : "0";
  }

  function simulate(dt: number) {
    spin += dt;
    if (phase === "running") {
      runTime += dt;
      if (multLeft > 0) {
        multLeft = Math.max(0, multLeft - dt);
        if (multLeft === 0) comboShown = false;
      }
      const mult = multLeft > 0 ? 2 : 1;
      const current = speed();
      score += current * dt * 0.85 * mult;
      distance += current * dt * 0.45;
      moveWorld(dt);
      runner.update(dt);
      collide();
      markPassed();
    } else if (phase === "ready") {
      if (runner.action !== "run") {
        runner.action = "run";
        runner.actionTime = 0;
      }
      runner.update(dt);
    } else {
      runner.update(dt);
    }
    bobPickups();
    updateSparks(dt);
    shadow.position.x = rig.root.position.x;
    shadow.position.z = 0.05;
    const spread = runner.action === "slide" ? 1.35 : runner.action === "jump" ? 0.62 : 1;
    shadow.scale.setScalar(spread);
  }

  function resize() {
    const width = canvas.clientWidth || window.innerWidth;
    const height = canvas.clientHeight || window.innerHeight;
    const bufferWidth = Math.max(640, Math.floor(width));
    const bufferHeight = Math.max(360, Math.floor(height));
    renderer.setSize(bufferWidth, bufferHeight, false);
    camera.aspect = bufferWidth / bufferHeight;
    camera.updateProjectionMatrix();
  }

  function frame() {
    if (stopped) return;
    raf = requestAnimationFrame(frame);
    timer.update();
    if (document.hidden) return;
    let remaining = Math.min(timer.getDelta(), 0.1);
    const step = 1 / 60;
    while (remaining > 0) {
      const dt = Math.min(step, remaining);
      simulate(dt);
      remaining -= dt;
    }
    publish();
    renderer.render(scene, camera);
  }

  const timer = new THREE.Timer();
  timer.connect(document);
  resize();
  resetWorld();
  publish();

  const onResize = () => resize();
  window.addEventListener("resize", onResize);
  const observer = new ResizeObserver(() => resize());
  observer.observe(canvas.parentElement ?? canvas);
  raf = requestAnimationFrame(frame);

  return {
    start() {
      if (phase === "running") return;
      audio.resume();
      if (phase === "crashed") resetWorld();
      phase = "running";
      publish();
    },
    input(action) {
      if (phase !== "running") return;
      if (action === "left" || action === "right") {
        const before = runner.lane;
        // World +X is screen-left because the camera looks down +Z.
        runner.lane =
          action === "left" ? Math.min(1, runner.lane + 1) : Math.max(-1, runner.lane - 1);
        if (runner.lane !== before) audio.lane();
        return;
      }
      if (action === "jump" && runner.requestJump()) audio.jump();
      if (action === "slide" && runner.requestSlide()) audio.slide();
    },
    setMuted(muted) {
      audio.setMuted(muted);
      writeStore(MUTE_KEY, muted ? "1" : "0");
      publish();
    },
    dispose() {
      stopped = true;
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", onResize);
      observer.disconnect();
      timer.dispose();
      renderer.dispose();
    },
  };
}
