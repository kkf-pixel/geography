import * as THREE from "three";

export const SEG_LEN = 30;
export const LANE_X = 2.25;

const DECK_W = 7.05;
const FACE_X = 4.22;

const materials = new Map<string, THREE.MeshBasicMaterial>();

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
  ctx.imageSmoothingEnabled = false;
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
      alphaTest: transparent ? 0.4 : 0,
      side: THREE.DoubleSide,
    });
    materials.set(key, material);
  }
  return material;
}

function solid(color: number) {
  const key = `c${color}`;
  let material = materials.get(key);
  if (!material) {
    material = new THREE.MeshBasicMaterial({ color });
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

function facingCamera(w: number, h: number, material: THREE.Material, y: number) {
  const mesh = new THREE.Mesh(new THREE.PlaneGeometry(w, h), material);
  mesh.position.y = y;
  mesh.rotation.y = Math.PI;
  return mesh;
}

function trackMaterial() {
  return textured("track", 220, 48, (ctx) => {
    ctx.fillStyle = "#3a2418";
    ctx.fillRect(0, 0, 220, 48);
    for (let y = 0; y < 48; y += 8) {
      ctx.fillStyle = y % 16 === 0 ? "#a56b3c" : "#8a552e";
      ctx.fillRect(6, y, 208, 5);
      ctx.fillStyle = "#6d4124";
      ctx.fillRect(6, y + 5, 208, 3);
      ctx.fillStyle = "#c48a52";
      for (let x = 18; x < 210; x += 28) ctx.fillRect(x, y + 1, 2, 2);
    }
    const railAt = (lane: number) => 110 + ((lane * LANE_X) / DECK_W) * 220;
    for (const lane of [-1, 0, 1]) {
      for (const side of [-1, 1]) {
        const x = Math.round(railAt(lane) + side * 13);
        ctx.fillStyle = "#5c6772";
        ctx.fillRect(x - 2, 0, 5, 48);
        ctx.fillStyle = "#d5dee8";
        ctx.fillRect(x - 1, 0, 2, 48);
        ctx.fillStyle = "#f4f7fb";
        ctx.fillRect(x, 0, 1, 48);
      }
    }
  }, 1, SEG_LEN / 4);
}

function sidewalkMaterial() {
  return textured("walk", 32, 32, (ctx) => {
    ctx.fillStyle = "#3d4656";
    ctx.fillRect(0, 0, 32, 32);
    ctx.strokeStyle = "#2a313d";
    ctx.lineWidth = 1;
    for (let y = 0; y < 32; y += 8) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(32, y);
      ctx.stroke();
      const shift = y % 16 === 0 ? 0 : 8;
      for (let x = shift; x < 32; x += 16) {
        ctx.beginPath();
        ctx.moveTo(x, y);
        ctx.lineTo(x, y + 8);
        ctx.stroke();
      }
    }
    ctx.fillStyle = "#556070";
    ctx.fillRect(2, 2, 6, 3);
    ctx.fillRect(18, 12, 7, 3);
  }, 2, SEG_LEN / 4);
}

function skyMaterial() {
  return textured("sky", 256, 256, (ctx) => {
    const sky = ctx.createLinearGradient(0, 0, 0, 256);
    sky.addColorStop(0, "#070b18");
    sky.addColorStop(0.55, "#121a30");
    sky.addColorStop(1, "#1c2744");
    ctx.fillStyle = sky;
    ctx.fillRect(0, 0, 256, 256);
    const stars: Array<[number, number, string, number]> = [
      [20, 24, "#fff", 2],
      [48, 70, "#d7e6ff", 1],
      [90, 30, "#fff", 1],
      [130, 88, "#9fd6ff", 2],
      [170, 40, "#fff", 1],
      [210, 96, "#ffe7a8", 1],
      [240, 28, "#fff", 2],
      [30, 140, "#fff", 1],
      [80, 160, "#cfe2ff", 1],
      [150, 150, "#fff", 2],
      [200, 180, "#fff", 1],
      [110, 200, "#9ad7ff", 1],
      [60, 210, "#fff", 1],
      [230, 200, "#fff", 1],
    ];
    for (const [x, y, color, size] of stars) {
      ctx.fillStyle = color;
      ctx.fillRect(x, y, size, size);
    }
  });
}

export function createSkyTexture() {
  return skyMaterial().map ?? null;
}

type ShopKind = "pink" | "cyan" | "red" | "amber";

const SHOP_COLORS: Record<ShopKind, { awning: [string, string]; neon: string; sign: string }> = {
  pink: { awning: ["#ff6b9a", "#fff4f8"], neon: "#ff4f93", sign: "#2a1020" },
  cyan: { awning: ["#5ce8ff", "#f3fdff"], neon: "#37d7ff", sign: "#062028" },
  red: { awning: ["#e24b55", "#fff6f4"], neon: "#ff5a62", sign: "#2a1014" },
  amber: { awning: ["#ffb03a", "#fff8ea"], neon: "#ffd15a", sign: "#2a1c08" },
};

function shopMaterial(kind: ShopKind) {
  const palette = SHOP_COLORS[kind];
  return textured(`shop-${kind}`, 96, 80, (ctx) => {
    ctx.fillStyle = "#1a2233";
    ctx.fillRect(0, 0, 96, 80);
    ctx.fillStyle = "#141b2a";
    for (let y = 0; y < 80; y += 4) ctx.fillRect(0, y, 96, 1);
    ctx.fillStyle = "#2a3448";
    ctx.fillRect(0, 0, 96, 4);

    for (let floor = 0; floor < 3; floor += 1) {
      const y = 8 + floor * 16;
      for (let col = 0; col < 4; col += 1) {
        const x = 8 + col * 22;
        const lit = (floor + col + kind.length) % 5 !== 0;
        ctx.fillStyle = "#0c1018";
        ctx.fillRect(x, y, 12, 10);
        ctx.fillStyle = lit ? (col % 2 === 0 ? "#ffd98a" : "#f0b14a") : "#1c2433";
        ctx.fillRect(x + 1, y + 1, 10, 8);
        if (lit) {
          ctx.fillStyle = "#fff4cc";
          ctx.fillRect(x + 2, y + 2, 3, 3);
        }
      }
    }

    ctx.fillStyle = "#10151f";
    ctx.fillRect(0, 56, 96, 24);
    ctx.fillStyle = "#ffd98a";
    ctx.fillRect(8, 60, 28, 16);
    ctx.fillStyle = "#fff1c2";
    ctx.fillRect(10, 62, 10, 6);
    ctx.fillStyle = "#c9843a";
    ctx.fillRect(22, 62, 12, 12);
    ctx.fillStyle = "#0e121a";
    ctx.fillRect(46, 62, 14, 16);
    ctx.fillStyle = "#ffd98a";
    ctx.fillRect(64, 60, 24, 16);

    ctx.fillStyle = palette.awning[0];
    ctx.fillRect(0, 54, 96, 4);
    ctx.fillStyle = palette.awning[1];
    for (let x = 0; x < 96; x += 8) ctx.fillRect(x, 54, 4, 4);

    ctx.fillStyle = palette.neon;
    ctx.fillRect(78, 10, 10, 28);
    ctx.fillStyle = "#fff";
    ctx.fillRect(81, 14, 4, 2);
    ctx.fillRect(81, 20, 4, 2);
    ctx.fillRect(81, 26, 4, 2);
  });
}

function towerMaterial(seed: number) {
  return textured(`tower-${seed % 2}`, 64, 96, (ctx) => {
    ctx.fillStyle = seed % 2 === 0 ? "#151b2b" : "#1a2032";
    ctx.fillRect(0, 0, 64, 96);
    ctx.fillStyle = "#0e1320";
    ctx.fillRect(0, 0, 4, 96);
    for (let y = 6; y < 90; y += 12) {
      for (let x = 8; x < 58; x += 14) {
        const lit = (x + y + seed) % 7 !== 0;
        ctx.fillStyle = "#090d16";
        ctx.fillRect(x, y, 8, 7);
        ctx.fillStyle = lit ? "#f2c56b" : "#222838";
        ctx.fillRect(x + 1, y + 1, 6, 5);
      }
    }
  });
}

function awningMaterial(kind: ShopKind) {
  const [stripe, paper] = SHOP_COLORS[kind].awning;
  return textured(`awning-${kind}`, 32, 16, (ctx) => {
    ctx.fillStyle = stripe;
    ctx.fillRect(0, 0, 32, 16);
    ctx.fillStyle = paper;
    for (let x = 0; x < 32; x += 8) ctx.fillRect(x, 0, 4, 16);
    ctx.fillStyle = "#2a1c22";
    ctx.fillRect(0, 14, 32, 2);
  });
}

function signMaterial(kind: ShopKind) {
  const palette = SHOP_COLORS[kind];
  return textured(`sign-${kind}`, 24, 64, (ctx) => {
    ctx.clearRect(0, 0, 24, 64);
    ctx.fillStyle = palette.neon;
    ctx.fillRect(0, 0, 24, 64);
    ctx.fillStyle = palette.sign;
    ctx.fillRect(3, 3, 18, 58);
    ctx.fillStyle = palette.neon;
    const glyphs = [6, 14, 22, 32, 40, 50];
    for (const y of glyphs) {
      ctx.fillRect(7, y, 10, 4);
      ctx.fillRect(7, y, 3, 6);
    }
    ctx.fillStyle = "#fff";
    ctx.globalAlpha = 0.85;
    ctx.fillRect(8, 8, 2, 2);
    ctx.fillRect(8, 34, 2, 2);
    ctx.globalAlpha = 1;
  }, 1, 1, true);
}

function facade(group: THREE.Group, side: -1 | 1, z: number, depth: number, kind: ShopKind) {
  const faceX = side * FACE_X;
  const block = new THREE.Mesh(
    new THREE.BoxGeometry(1.35, 5.55, depth - 0.2),
    solid(0x141a28),
  );
  block.position.set(faceX + side * 0.85, 2.78, z);
  group.add(block);

  const wall = new THREE.Mesh(new THREE.PlaneGeometry(depth - 0.05, 5.7), shopMaterial(kind));
  wall.position.set(faceX - side * 0.04, 2.85, z);
  wall.rotation.y = side < 0 ? Math.PI / 2 : -Math.PI / 2;
  group.add(wall);

  const awning = new THREE.Mesh(new THREE.BoxGeometry(0.9, 0.1, depth * 0.62), awningMaterial(kind));
  awning.position.set(faceX - side * 0.5, 2.05, z);
  group.add(awning);

  const sign = new THREE.Mesh(new THREE.PlaneGeometry(0.62, 1.7), signMaterial(kind));
  sign.position.set(faceX - side * 0.72, 3.55, z - depth * 0.28);
  sign.rotation.y = Math.PI;
  group.add(sign);

  const tower = new THREE.Mesh(new THREE.PlaneGeometry(depth * 0.9, 8.4), towerMaterial(kind.length + (side > 0 ? 1 : 0)));
  tower.position.set(side * 6.55, 4.2, z);
  tower.rotation.y = side < 0 ? Math.PI / 2 : -Math.PI / 2;
  group.add(tower);
}

function addLamp(group: THREE.Group, x: number, z: number) {
  const pole = new THREE.Mesh(new THREE.BoxGeometry(0.08, 2.15, 0.08), solid(0x2a3140));
  pole.position.set(x, 1.1, z);
  const head = new THREE.Mesh(new THREE.BoxGeometry(0.36, 0.16, 0.22), solid(0xffd56a));
  head.position.set(x, 2.22, z);
  const glow = new THREE.Mesh(new THREE.BoxGeometry(0.2, 0.08, 0.12), solid(0xfff1b0));
  glow.position.set(x, 2.12, z);
  group.add(pole, head, glow);
}

export function createSegment(index: number) {
  const rand = mulberry32(index * 97 + 13);
  const group = new THREE.Group();
  const kinds: ShopKind[] = ["pink", "cyan", "red", "amber"];

  const deck = new THREE.Mesh(new THREE.PlaneGeometry(DECK_W, SEG_LEN + 0.04), trackMaterial());
  deck.rotation.x = -Math.PI / 2;
  deck.position.y = 0.02;
  group.add(deck);

  for (const side of [-1, 1] as const) {
    const walk = new THREE.Mesh(new THREE.BoxGeometry(1.15, 0.16, SEG_LEN), sidewalkMaterial());
    walk.position.set(side * 3.72, 0.1, 0);
    group.add(walk);
    const curb = new THREE.Mesh(new THREE.BoxGeometry(0.1, 0.22, SEG_LEN), solid(0x2c3442));
    curb.position.set(side * 3.2, 0.1, 0);
    group.add(curb);

    let z = -SEG_LEN / 2 + 1.4;
    let shop = 0;
    while (z < SEG_LEN / 2 - 2) {
      const depth = 6.4 + rand() * 1.6;
      const kind = kinds[(shop + (side > 0 ? 1 : 0) + index) % kinds.length] ?? "pink";
      facade(group, side, z + depth / 2, depth - 0.25, kind);
      z += depth;
      shop += 1;
    }
    addLamp(group, side * 3.35, -6);
    addLamp(group, side * 3.35, 8);
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
  const material = textured("coin", 32, 32, (ctx) => {
    ctx.clearRect(0, 0, 32, 32);
    ctx.fillStyle = "#e0a020";
    ctx.beginPath();
    ctx.arc(16, 16, 14, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = "#ffd85a";
    ctx.beginPath();
    ctx.arc(16, 16, 11, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = "#fff3b0";
    ctx.beginPath();
    ctx.moveTo(16, 6);
    ctx.lineTo(20, 14);
    ctx.lineTo(17, 14);
    ctx.lineTo(20, 26);
    ctx.lineTo(12, 16);
    ctx.lineTo(15, 16);
    ctx.closePath();
    ctx.fill();
    ctx.fillStyle = "#a56b12";
    ctx.fillRect(6, 15, 2, 2);
    ctx.fillRect(24, 14, 2, 2);
  }, 1, 1, true);
  group.add(facingCamera(0.78, 0.78, material, 0));
  return group;
}

function createMultiplier() {
  const group = new THREE.Group();
  const material = textured("mult", 48, 48, (ctx) => {
    ctx.clearRect(0, 0, 48, 48);
    ctx.fillStyle = "#ffe14a";
    ctx.globalAlpha = 0.35;
    ctx.beginPath();
    ctx.arc(24, 24, 22, 0, Math.PI * 2);
    ctx.fill();
    ctx.globalAlpha = 1;
    ctx.fillStyle = "#2a1c04";
    ctx.fillRect(8, 14, 6, 20);
    ctx.fillRect(16, 14, 4, 6);
    ctx.fillRect(16, 21, 6, 4);
    ctx.fillRect(22, 25, 4, 9);
    ctx.fillRect(30, 12, 8, 6);
    ctx.fillRect(30, 18, 4, 16);
    ctx.fillRect(30, 30, 10, 5);
    ctx.fillStyle = "#fff4b0";
    ctx.fillRect(9, 15, 4, 4);
    ctx.fillRect(31, 13, 4, 4);
  }, 1, 1, true);
  group.add(facingCamera(1.05, 1.05, material, 0));
  return group;
}

function createBarrier() {
  const group = new THREE.Group();
  const material = textured("barrier", 96, 40, (ctx) => {
    ctx.clearRect(0, 0, 96, 40);
    ctx.fillStyle = "#6a4a2c";
    ctx.beginPath();
    ctx.moveTo(10, 36);
    ctx.lineTo(22, 8);
    ctx.lineTo(28, 8);
    ctx.lineTo(16, 36);
    ctx.fill();
    ctx.beginPath();
    ctx.moveTo(80, 36);
    ctx.lineTo(68, 8);
    ctx.lineTo(74, 8);
    ctx.lineTo(86, 36);
    ctx.fill();
    for (const y of [10, 22]) {
      for (let x = 8; x < 88; x += 8) {
        ctx.fillStyle = x % 16 === 0 ? "#111" : "#f2c430";
        ctx.fillRect(x, y, 8, 7);
      }
    }
    ctx.fillStyle = "#3a2a1c";
    ctx.fillRect(8, 34, 12, 4);
    ctx.fillRect(76, 34, 12, 4);
  }, 1, 1, true);
  group.add(facingCamera(1.9, 0.78, material, 0.39));
  return group;
}

function createArch() {
  const group = new THREE.Group();
  const material = textured("arch", 80, 104, (ctx) => {
    ctx.clearRect(0, 0, 80, 104);
    ctx.fillStyle = "#242a38";
    ctx.fillRect(6, 18, 10, 86);
    ctx.fillRect(64, 18, 10, 86);
    ctx.fillRect(6, 10, 68, 12);
    ctx.fillStyle = "#ff4f93";
    ctx.fillRect(4, 28, 4, 62);
    ctx.fillRect(10, 6, 22, 4);
    ctx.fillStyle = "#3adfff";
    ctx.fillRect(72, 28, 4, 62);
    ctx.fillRect(48, 6, 22, 4);
    ctx.fillStyle = "#ffe14a";
    ctx.fillRect(16, 4, 48, 4);
    ctx.beginPath();
    ctx.moveTo(40, 22);
    ctx.lineTo(58, 52);
    ctx.lineTo(22, 52);
    ctx.closePath();
    ctx.fill();
    ctx.fillStyle = "#1a1404";
    ctx.beginPath();
    ctx.moveTo(40, 28);
    ctx.lineTo(52, 48);
    ctx.lineTo(28, 48);
    ctx.closePath();
    ctx.fill();
    ctx.fillStyle = "#ffe14a";
    ctx.fillRect(38, 32, 4, 8);
    ctx.fillRect(38, 42, 4, 4);
    ctx.fillStyle = "#9aa3b2";
    ctx.fillRect(8, 96, 6, 8);
    ctx.fillRect(66, 96, 6, 8);
  }, 1, 1, true);
  group.add(facingCamera(2.15, 2.8, material, 1.4));
  return group;
}

function createTrain() {
  const group = new THREE.Group();
  const front = pixelTexture(48, 56, (ctx) => {
    ctx.fillStyle = "#4a5564";
    ctx.fillRect(2, 4, 44, 50);
    ctx.fillStyle = "#2e3642";
    ctx.fillRect(2, 0, 44, 8);
    ctx.fillStyle = "#ffd98a";
    ctx.fillRect(8, 12, 12, 14);
    ctx.fillRect(28, 12, 12, 14);
    ctx.fillStyle = "#fff6d0";
    ctx.fillRect(10, 14, 4, 4);
    ctx.fillRect(30, 14, 4, 4);
    ctx.fillStyle = "#e07a28";
    ctx.fillRect(2, 32, 44, 7);
    ctx.fillStyle = "#fff1b8";
    ctx.fillRect(6, 44, 8, 6);
    ctx.fillRect(34, 44, 8, 6);
    ctx.fillStyle = "#1c212a";
    ctx.fillRect(20, 42, 8, 8);
  });
  const side = pixelTexture(96, 56, (ctx) => {
    ctx.fillStyle = "#5b6776";
    ctx.fillRect(0, 4, 96, 48);
    ctx.fillStyle = "#3a4350";
    ctx.fillRect(0, 0, 96, 8);
    ctx.fillStyle = "#e07a28";
    ctx.fillRect(0, 32, 96, 7);
    ctx.fillStyle = "#ffd98a";
    for (let x = 6; x < 90; x += 18) ctx.fillRect(x, 12, 12, 14);
    ctx.fillStyle = "#1a1f28";
    ctx.fillRect(0, 48, 96, 8);
  });
  const roof = pixelTexture(8, 8, (ctx) => {
    ctx.fillStyle = "#2c3440";
    ctx.fillRect(0, 0, 8, 8);
  });
  const dark = solid(0x232833);
  const body = new THREE.Mesh(new THREE.BoxGeometry(1.82, 2.05, 7.4), [
    new THREE.MeshBasicMaterial({ map: side }),
    new THREE.MeshBasicMaterial({ map: side }),
    new THREE.MeshBasicMaterial({ map: roof }),
    dark,
    dark,
    new THREE.MeshBasicMaterial({ map: front }),
  ]);
  body.position.y = 1.12;
  group.add(body);
  return group;
}

export function shadowMaterial() {
  return textured("shadow", 32, 16, (ctx) => {
    ctx.clearRect(0, 0, 32, 16);
    ctx.fillStyle = "rgba(0,0,0,0.45)";
    ctx.beginPath();
    ctx.ellipse(16, 8, 14, 6, 0, 0, Math.PI * 2);
    ctx.fill();
  }, 1, 1, true);
}
