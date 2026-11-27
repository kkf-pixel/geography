import * as THREE from "three";

export const SEG_LEN = 30;
export const LANE_X = 2.25;

const materials = new Map<string, THREE.MeshBasicMaterial>();

function solid(color: number) {
  const key = `c${color}`;
  let material = materials.get(key);
  if (!material) {
    material = new THREE.MeshBasicMaterial({ color });
    materials.set(key, material);
  }
  return material;
}

function pixelTexture(
  w: number,
  h: number,
  draw: (ctx: CanvasRenderingContext2D) => void,
  repeatX = 1,
  repeatY = 1,
) {
  const canvas = document.createElement("canvas");
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("無法建立材質");
  draw(ctx);
  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.magFilter = THREE.NearestFilter;
  texture.minFilter = THREE.NearestFilter;
  texture.generateMipmaps = false;
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  texture.repeat.set(repeatX, repeatY);
  return texture;
}

function textured(
  key: string,
  w: number,
  h: number,
  draw: (ctx: CanvasRenderingContext2D) => void,
  repeatX = 1,
  repeatY = 1,
  transparent = false,
) {
  let material = materials.get(key);
  if (!material) {
    material = new THREE.MeshBasicMaterial({
      map: pixelTexture(w, h, draw, repeatX, repeatY),
      transparent,
      alphaTest: transparent ? 0.45 : 0,
      side: transparent ? THREE.DoubleSide : THREE.FrontSide,
    });
    materials.set(key, material);
  }
  return material;
}

function mulberry32(seed: number) {
  let state = seed >>> 0;
  return function rand() {
    state = (state + 0x6d2b79f5) | 0;
    let t = Math.imul(state ^ (state >>> 15), 1 | state);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function trackMaterial() {
  return textured("track", 64, 32, (ctx) => {
    ctx.fillStyle = "#7b5130";
    ctx.fillRect(0, 0, 64, 32);
    for (let y = 0; y < 32; y += 8) {
      ctx.fillStyle = y % 16 === 0 ? "#8f6240" : "#6a4328";
      ctx.fillRect(0, y, 64, 5);
      ctx.fillStyle = "#56361f";
      ctx.fillRect(0, y + 5, 64, 3);
    }
  }, 1, SEG_LEN / 2);
}

function sidewalkMaterial() {
  return textured("walk", 32, 32, (ctx) => {
    ctx.fillStyle = "#3c4452";
    ctx.fillRect(0, 0, 32, 32);
    ctx.strokeStyle = "#2a3140";
    ctx.lineWidth = 2;
    for (let i = 0; i <= 32; i += 8) {
      ctx.beginPath();
      ctx.moveTo(0, i);
      ctx.lineTo(32, i);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(i, 0);
      ctx.lineTo(i, 32);
      ctx.stroke();
    }
    ctx.fillStyle = "#556070";
    ctx.fillRect(2, 2, 4, 2);
  }, 2, SEG_LEN / 2);
}

function hazardMaterial() {
  return textured("hazard", 32, 16, (ctx) => {
    ctx.fillStyle = "#f2c200";
    ctx.fillRect(0, 0, 32, 16);
    ctx.fillStyle = "#1c1c1c";
    for (let i = -16; i < 32; i += 8) {
      ctx.beginPath();
      ctx.moveTo(i, 16);
      ctx.lineTo(i + 8, 0);
      ctx.lineTo(i + 12, 0);
      ctx.lineTo(i + 4, 16);
      ctx.fill();
    }
  });
}

function awningMaterial(kind: "pink" | "blue") {
  const c1 = kind === "pink" ? "#ff6d9c" : "#49b7ff";
  return textured(`awning-${kind}`, 16, 16, (ctx) => {
    for (let i = 0; i < 8; i += 1) {
      ctx.fillStyle = i % 2 === 0 ? c1 : "#f4f7fb";
      ctx.fillRect(0, i * 2, 16, 2);
    }
  });
}

function signMaterial(kind: "pink" | "cyan" | "amber") {
  const color = kind === "pink" ? "#ff4d8d" : kind === "cyan" ? "#3adfff" : "#ffd24a";
  return textured(`sign-${kind}`, 16, 48, (ctx) => {
    ctx.fillStyle = color;
    ctx.fillRect(0, 0, 16, 48);
    ctx.fillStyle = "#1a1020";
    ctx.fillRect(1, 1, 14, 2);
    ctx.fillRect(1, 45, 14, 2);
    ctx.fillRect(1, 1, 2, 46);
    ctx.fillRect(13, 1, 2, 46);
    ctx.fillStyle = "rgba(12, 8, 20, 0.55)";
    for (const [x, y, w, h] of [
      [3, 6, 10, 4],
      [4, 14, 8, 3],
      [3, 20, 10, 5],
      [5, 30, 6, 3],
      [3, 36, 10, 6],
    ] as const) {
      ctx.fillRect(x, y, w, h);
    }
  });
}

function facadeMaterial(seed: number, floors: number, wall: string, shop: boolean) {
  const key = `facade-${seed}-${floors}-${wall}-${shop ? 1 : 0}`;
  return textured(key, 32, 16 + floors * 18, (ctx) => {
    const h = 16 + floors * 18;
    ctx.fillStyle = wall;
    ctx.fillRect(0, 0, 32, h);
    ctx.fillStyle = "#10151e";
    ctx.fillRect(0, 0, 32, 2);
    ctx.fillRect(0, h - 2, 32, 2);
    for (let floor = 0; floor < floors; floor += 1) {
      for (let col = 0; col < 3; col += 1) {
        const n = Math.abs(Math.sin(seed * 12.3 + floor * 5.1 + col * 2.7));
        const lit = n > (shop ? 0.28 : 0.55);
        ctx.fillStyle = lit ? (col === 1 ? "#ffe1a0" : "#ffc15a") : "#2a3344";
        ctx.fillRect(4 + col * 9, 6 + floor * 18, 6, 8);
        if (lit) {
          ctx.fillStyle = "#fff6d4";
          ctx.fillRect(5 + col * 9, 7 + floor * 18, 2, 2);
        }
      }
    }
    if (shop) {
      ctx.fillStyle = "#141820";
      ctx.fillRect(12, h - 16, 8, 14);
      ctx.fillStyle = "#ffbf5a";
      ctx.fillRect(17, h - 10, 1, 2);
    }
  });
}

function warningMaterial() {
  return textured("warn", 32, 32, (ctx) => {
    ctx.clearRect(0, 0, 32, 32);
    ctx.fillStyle = "#ffd23a";
    ctx.beginPath();
    ctx.moveTo(16, 2);
    ctx.lineTo(30, 30);
    ctx.lineTo(2, 30);
    ctx.closePath();
    ctx.fill();
    ctx.fillStyle = "#161616";
    ctx.fillRect(14, 10, 4, 12);
    ctx.fillRect(14, 24, 4, 4);
  }, 1, 1, true);
}

function coinMaterial() {
  return textured("coin", 32, 32, (ctx) => {
    ctx.clearRect(0, 0, 32, 32);
    ctx.fillStyle = "#f5c400";
    ctx.beginPath();
    ctx.moveTo(16, 1);
    ctx.lineTo(27, 6);
    ctx.lineTo(31, 16);
    ctx.lineTo(27, 26);
    ctx.lineTo(16, 31);
    ctx.lineTo(5, 26);
    ctx.lineTo(1, 16);
    ctx.lineTo(5, 6);
    ctx.closePath();
    ctx.fill();
    ctx.fillStyle = "#ffe56a";
    ctx.fillRect(7, 6, 6, 4);
    ctx.fillStyle = "#8a4f00";
    ctx.fillRect(17, 4, 7, 8);
    ctx.fillRect(11, 12, 10, 6);
    ctx.fillRect(13, 18, 7, 9);
  }, 1, 1, true);
}

function multMaterial() {
  return textured("mult", 48, 48, (ctx) => {
    ctx.clearRect(0, 0, 48, 48);
    ctx.fillStyle = "#ffd84a";
    ctx.beginPath();
    ctx.arc(24, 24, 22, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = "#fff4b0";
    ctx.fillRect(8, 8, 10, 6);
    ctx.fillStyle = "#8a4b00";
    ctx.font = "bold 22px sans-serif";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText("x2", 24, 26);
  }, 1, 1, true);
}

function addLamp(group: THREE.Group, x: number, z: number) {
  const pole = new THREE.Mesh(new THREE.BoxGeometry(0.08, 2.15, 0.08), solid(0x2a3140));
  pole.position.set(x, 1.2, z);
  const head = new THREE.Mesh(new THREE.BoxGeometry(0.32, 0.24, 0.32), solid(0xffd56a));
  head.position.set(x, 2.32, z);
  const glow = new THREE.Mesh(
    new THREE.PlaneGeometry(0.85, 0.85),
    new THREE.MeshBasicMaterial({
      color: 0xffcc66,
      transparent: true,
      opacity: 0.28,
      depthWrite: false,
      side: THREE.DoubleSide,
    }),
  );
  glow.position.set(x, 2.32, z);
  group.add(pole, head, glow);
}

function addBuilding(
  group: THREE.Group,
  rand: () => number,
  side: -1 | 1,
  x: number,
  z: number,
  width: number,
  depth: number,
  floors: number,
  shop: boolean,
) {
  const height = floors * 1.15 + (shop ? 0.45 : 0.7);
  const wall = shop
    ? ["#243044", "#2a2438", "#1d2c38", "#32281f"][Math.floor(rand() * 4)]
    : ["#161c28", "#1a1824", "#141e26", "#201c18"][Math.floor(rand() * 4)];
  const seed = Math.floor(rand() * 10000);
  const geo = new THREE.BoxGeometry(width, height, depth);
  const roof = solid(shop ? 0x1a2030 : 0x12161e);
  const face = facadeMaterial(seed, floors, wall, shop);
  const mesh = new THREE.Mesh(geo, [face, face, roof, face, face, face]);
  mesh.position.set(x, height / 2, z);
  group.add(mesh);

  if (!shop && rand() > 0.45) {
    const antenna = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.7, 0.08), solid(0x2c3340));
    antenna.position.set(x, height + 0.35, z);
    group.add(antenna);
  }

  if (!shop) return;

  const awning = new THREE.Mesh(
    new THREE.BoxGeometry(0.85, 0.1, depth * 0.72),
    awningMaterial(side < 0 ? "pink" : "blue"),
  );
  awning.position.set(x - side * (width / 2 + 0.38), height * 0.42, z);
  group.add(awning);

  const kinds = side < 0 ? (["pink", "amber", "pink"] as const) : (["cyan", "amber", "cyan"] as const);
  const kind = kinds[Math.floor(rand() * kinds.length)];
  const banner = new THREE.Mesh(
    new THREE.BoxGeometry(0.18, 1.9 + rand() * 0.45, 0.62),
    signMaterial(kind),
  );
  banner.position.set(x - side * (width / 2 + 0.22), height * 0.7, z - depth * 0.28);
  group.add(banner);

  const glow = new THREE.Mesh(
    new THREE.PlaneGeometry(0.55, 1.7),
    new THREE.MeshBasicMaterial({
      color: kind === "cyan" ? 0x3adfff : kind === "amber" ? 0xffd24a : 0xff4d8d,
      transparent: true,
      opacity: 0.22,
      depthWrite: false,
      side: THREE.DoubleSide,
    }),
  );
  glow.position.copy(banner.position);
  glow.position.x -= side * 0.08;
  glow.rotation.y = side > 0 ? Math.PI / 2 : -Math.PI / 2;
  group.add(glow);

  if (rand() > 0.35) {
    const board = new THREE.Mesh(
      new THREE.BoxGeometry(0.1, 0.42, Math.min(1.4, depth * 0.55)),
      signMaterial(kind === "cyan" ? "cyan" : "pink"),
    );
    board.position.set(x - side * (width / 2 + 0.08), height * 0.58, z - depth * 0.1);
    group.add(board);
  }
}

export function createSegment(index: number) {
  const rand = mulberry32(index * 97 + 13);
  const group = new THREE.Group();

  const deck = new THREE.Mesh(
    new THREE.PlaneGeometry(LANE_X * 2 + 2.15, SEG_LEN + 0.08),
    trackMaterial(),
  );
  deck.rotation.x = -Math.PI / 2;
  deck.position.y = 0.02;
  group.add(deck);

  const sleeperGeo = new THREE.BoxGeometry(LANE_X * 2 + 1.7, 0.07, 0.32);
  const sleeperMat = solid(0x4e3422);
  for (let z = -SEG_LEN / 2 + 0.4; z < SEG_LEN / 2; z += 1.45) {
    const sleeper = new THREE.Mesh(sleeperGeo, sleeperMat);
    sleeper.position.set(0, 0.07, z);
    group.add(sleeper);
  }

  for (const lane of [-1, 0, 1]) {
    for (const side of [-1, 1]) {
      const rail = new THREE.Mesh(new THREE.BoxGeometry(0.05, 0.07, SEG_LEN), solid(0xb7c0cc));
      rail.position.set(lane * LANE_X + side * 0.52, 0.14, 0);
      const bed = new THREE.Mesh(new THREE.BoxGeometry(0.09, 0.04, SEG_LEN), solid(0x6e7886));
      bed.position.set(lane * LANE_X + side * 0.52, 0.09, 0);
      group.add(rail, bed);
    }
  }

  for (const side of [-1, 1] as const) {
    const walk = new THREE.Mesh(
      new THREE.BoxGeometry(2.15, 0.18, SEG_LEN),
      sidewalkMaterial(),
    );
    walk.position.set(side * 4.55, 0.09, 0);
    group.add(walk);
    const curb = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.22, SEG_LEN), solid(0x5c6778));
    curb.position.set(side * 3.5, 0.1, 0);
    group.add(curb);
  }

  for (const side of [-1, 1] as const) {
    let z = -SEG_LEN / 2 + 2.2;
    while (z < SEG_LEN / 2 - 3) {
      const depth = 6.2 + rand() * 3.4;
      const floors = 2 + Math.floor(rand() * 2);
      addBuilding(group, rand, side, side * 7.15, z + depth / 2, 4.3, depth - 0.35, floors, true);
      if (rand() > 0.4) {
        const towerFloors = 4 + Math.floor(rand() * 3);
        addBuilding(
          group,
          rand,
          side,
          side * 11.4,
          z + depth / 2,
          4.6,
          depth + 0.4,
          towerFloors,
          false,
        );
      }
      z += depth;
    }
    addLamp(group, side * 3.85, -8);
    addLamp(group, side * 3.85, 7);
    if (rand() > 0.3) {
      const crate = new THREE.Mesh(new THREE.BoxGeometry(0.42, 0.36, 0.42), solid(0x6a4630));
      crate.position.set(side * 3.9, 0.32, -2 + rand() * 4);
      group.add(crate);
    }
  }

  return group;
}

export type ObstacleKind = "coin" | "mult" | "barrier" | "arch" | "train";

export function createTemplates(): Record<ObstacleKind, THREE.Group> {
  return {
    coin: createCoin(),
    mult: createMultiplier(),
    barrier: createBarrier(),
    arch: createArch(),
    train: createTrain(),
  };
}

function createCoin() {
  const group = new THREE.Group();
  const mesh = new THREE.Mesh(new THREE.PlaneGeometry(0.78, 0.78), coinMaterial());
  group.add(mesh);
  return group;
}

function createMultiplier() {
  const group = new THREE.Group();
  const glow = new THREE.Mesh(
    new THREE.PlaneGeometry(1.35, 1.35),
    new THREE.MeshBasicMaterial({
      color: 0xffd84a,
      transparent: true,
      opacity: 0.3,
      depthWrite: false,
      side: THREE.DoubleSide,
    }),
  );
  const mesh = new THREE.Mesh(new THREE.PlaneGeometry(0.92, 0.92), multMaterial());
  group.add(glow, mesh);
  return group;
}

function createBarrier() {
  const group = new THREE.Group();
  const legGeo = new THREE.BoxGeometry(0.08, 0.62, 0.08);
  const wood = solid(0x6d4c30);
  for (const x of [-0.62, 0.62]) {
    const front = new THREE.Mesh(legGeo, wood);
    front.position.set(x, 0.3, 0.12);
    front.rotation.x = 0.4;
    const back = new THREE.Mesh(legGeo, wood);
    back.position.set(x, 0.3, -0.12);
    back.rotation.x = -0.4;
    group.add(front, back);
  }
  const hazard = hazardMaterial();
  const top = new THREE.Mesh(new THREE.BoxGeometry(1.72, 0.16, 0.12), hazard);
  top.position.set(0, 0.58, 0);
  const mid = new THREE.Mesh(new THREE.BoxGeometry(1.72, 0.12, 0.1), hazard);
  mid.position.set(0, 0.36, 0);
  group.add(top, mid);
  return group;
}

function createArch() {
  const group = new THREE.Group();
  const dark = solid(0x2a3142);
  const postGeo = new THREE.BoxGeometry(0.2, 2.15, 0.2);
  const left = new THREE.Mesh(postGeo, dark);
  left.position.set(-0.88, 1.08, 0);
  const right = new THREE.Mesh(postGeo, dark);
  right.position.set(0.88, 1.08, 0);
  const beam = new THREE.Mesh(new THREE.BoxGeometry(1.96, 0.2, 0.22), dark);
  beam.position.set(0, 2.12, 0);
  group.add(left, right, beam);

  const tubes: Array<[number, number, number, number, number, number, number]> = [
    [0xff4d8d, -0.88, 1.15, 0.18, 0.14, 1.7, 0.12],
    [0x3adfff, 0.88, 1.15, 0.18, 0.14, 1.7, 0.12],
    [0xffd24a, 0, 2.02, 0.18, 1.7, 0.12, 0.12],
    [0xff4d8d, -0.42, 2.16, 0.18, 0.46, 0.12, 0.12],
    [0x3adfff, 0.42, 2.16, 0.18, 0.46, 0.12, 0.12],
  ];
  for (const [color, x, y, z, w, h, d] of tubes) {
    const tube = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), solid(color));
    tube.position.set(x, y, z);
    group.add(tube);
  }

  const sign = new THREE.Mesh(new THREE.PlaneGeometry(0.78, 0.7), warningMaterial());
  sign.position.set(0, 1.48, 0.16);
  group.add(sign);
  return group;
}

function createTrain() {
  const group = new THREE.Group();
  const body = new THREE.Mesh(new THREE.BoxGeometry(1.7, 2.15, 7.5), solid(0x5c6a78));
  body.position.y = 1.25;
  const stripe = new THREE.Mesh(new THREE.BoxGeometry(1.76, 0.32, 7.55), solid(0xe07a32));
  stripe.position.y = 1.2;
  const roof = new THREE.Mesh(new THREE.BoxGeometry(1.55, 0.14, 7.2), solid(0x3c4654));
  roof.position.y = 2.38;
  group.add(body, stripe, roof);

  const windowMat = solid(0xffe08a);
  const sideGeo = new THREE.BoxGeometry(0.08, 0.46, 0.72);
  for (const x of [-0.88, 0.88]) {
    for (let i = -2; i <= 2; i += 1) {
      const pane = new THREE.Mesh(sideGeo, windowMat);
      pane.position.set(x, 1.55, i * 1.15);
      group.add(pane);
    }
  }
  const frontGeo = new THREE.BoxGeometry(0.38, 0.4, 0.08);
  for (const x of [-0.4, 0.4]) {
    const pane = new THREE.Mesh(frontGeo, windowMat);
    pane.position.set(x, 1.6, -3.78);
    group.add(pane);
  }
  const wheelGeo = new THREE.BoxGeometry(0.28, 0.28, 0.28);
  const wheelMat = solid(0x171a20);
  for (const z of [-2.6, -0.8, 0.9, 2.6]) {
    for (const x of [-0.72, 0.72]) {
      const wheel = new THREE.Mesh(wheelGeo, wheelMat);
      wheel.position.set(x, 0.16, z);
      group.add(wheel);
    }
  }
  return group;
}

export function createStars() {
  const count = 220;
  const positions = new Float32Array(count * 3);
  const colors = new Float32Array(count * 3);
  const palette = [
    [1, 1, 1],
    [1, 0.75, 0.85],
    [0.55, 0.9, 1],
    [1, 0.92, 0.55],
  ];
  for (let i = 0; i < count; i += 1) {
    positions[i * 3] = (Math.random() - 0.5) * 70;
    positions[i * 3 + 1] = 6 + Math.random() * 18;
    positions[i * 3 + 2] = -8 + Math.random() * 100;
    const color = palette[i % palette.length];
    colors[i * 3] = color[0];
    colors[i * 3 + 1] = color[1];
    colors[i * 3 + 2] = color[2];
  }
  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));
  geometry.setAttribute("color", new THREE.BufferAttribute(colors, 3));
  return new THREE.Points(
    geometry,
    new THREE.PointsMaterial({
      size: 0.16,
      vertexColors: true,
      fog: false,
      sizeAttenuation: true,
    }),
  );
}
