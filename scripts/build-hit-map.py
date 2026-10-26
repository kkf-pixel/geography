#!/usr/bin/env python3
"""Build a district hit-map from the numbered question map."""

from __future__ import annotations

from collections import deque
from pathlib import Path

from PIL import Image, ImageDraw

ROOT = Path(__file__).resolve().parents[1]
SRC = ROOT / "public/maps/hk-18-question.jpg"
HIT = ROOT / "public/maps/hk-18-hit.png"
PREVIEW = Path("/tmp/hk-18-hit-preview.png")

# Percent centres near each printed number on the question map.
SEEDS: list[tuple[int, float, float]] = [
    (1, 32, 26),
    (2, 55, 13),
    (3, 60, 26),
    (4, 20, 47),
    (5, 47, 40),
    (6, 65, 40),
    (7, 44, 54),
    (8, 80, 50),
    (9, 55, 55),
    (10, 56, 63),
    (11, 61, 59),
    (12, 63, 53),
    (13, 68, 59),
    (14, 52, 71),
    (15, 60, 71),
    (16, 70, 70),
    (17, 62, 80),
    (18, 40, 74),
]

# Outlying islands that are not connected to the numbered landmass.
EXTRA_SEEDS: list[tuple[int, float, float]] = [
    (2, 50, 14),
    (2, 62, 12),
    (2, 72, 8),
    (3, 70, 28),
    (10, 57, 64),
    (11, 60, 60),
    (13, 66, 60),
    (16, 66, 70),
    (16, 72, 69),
    (17, 58, 82),
    (7, 34, 58),
    (8, 76, 40),
    (8, 80, 42),
    (8, 84, 46),
    (8, 77, 31),
    (8, 90, 42),
    (8, 88, 58),
    (8, 74, 46),
    (16, 74, 69),
    (18, 22, 62),
    (18, 28, 70),
    (18, 18, 68),
    (18, 48, 78),
    (18, 12, 78),
    (18, 35, 82),
]

# Extra walls where the JPEG outline has a gap.
BARRIER_LINES: list[list[tuple[float, float]]] = [
    [(69.0, 64.0), (70.0, 58.0), (71.0, 52.0), (72.0, 46.0), (73.0, 40.0), (74.0, 36.0)],
]

PALETTE = {
    1: (244, 114, 182),
    2: (129, 140, 248),
    3: (56, 189, 248),
    4: (192, 132, 252),
    5: (125, 211, 252),
    6: (253, 224, 71),
    7: (74, 222, 128),
    8: (34, 197, 94),
    9: (251, 191, 36),
    10: (248, 113, 113),
    11: (251, 146, 60),
    12: (250, 204, 21),
    13: (45, 212, 191),
    14: (96, 165, 250),
    15: (232, 121, 249),
    16: (167, 139, 250),
    17: (120, 113, 108),
    18: (252, 165, 165),
}


def brightness(rgb: tuple[int, int, int]) -> float:
    return (rgb[0] + rgb[1] + rgb[2]) / 3


def is_land(rgb: tuple[int, int, int]) -> bool:
    return brightness(rgb) >= 238


def is_barrier(rgb: tuple[int, int, int]) -> bool:
    return brightness(rgb) < 150


def is_water(rgb: tuple[int, int, int]) -> bool:
    value = brightness(rgb)
    return 175 <= value <= 230 and max(rgb) - min(rgb) <= 12


def dilate_mask(mask: list[list[bool]], width: int, height: int, radius: int) -> list[list[bool]]:
    out = [row[:] for row in mask]
    for y in range(height):
        for x in range(width):
            if not mask[y][x]:
                continue
            for dy in range(-radius, radius + 1):
                for dx in range(-radius, radius + 1):
                    nx, ny = x + dx, y + dy
                    if 0 <= nx < width and 0 <= ny < height:
                        out[ny][nx] = True
    return out


def land_neighbors(passable: list[list[bool]], width: int, height: int, x: int, y: int) -> int:
    count = 0
    for nx, ny in ((x - 1, y), (x + 1, y), (x, y - 1), (x, y + 1)):
        if 0 <= nx < width and 0 <= ny < height and passable[ny][nx]:
            count += 1
    return count


def find_land(passable: list[list[bool]], width: int, height: int, x: int, y: int) -> tuple[int, int] | None:
    best: tuple[int, int] | None = None
    best_score = -1
    for radius in range(0, 40):
        for dy in range(-radius, radius + 1):
            for dx in range(-radius, radius + 1):
                if max(abs(dx), abs(dy)) != radius:
                    continue
                nx, ny = x + dx, y + dy
                if not (0 <= nx < width and 0 <= ny < height and passable[ny][nx]):
                    continue
                score = land_neighbors(passable, width, height, nx, ny)
                if score >= 3:
                    return nx, ny
                if score > best_score:
                    best = (nx, ny)
                    best_score = score
        if best and best_score >= 2:
            return best
    return best


def main() -> None:
    source = Image.open(SRC).convert("RGB")
    width, height = source.size
    pixels = source.load()
    barriers = dilate_mask(
        [[is_barrier(pixels[x, y]) for x in range(width)] for y in range(height)],
        width,
        height,
        2,
    )
    for line in BARRIER_LINES:
        points = [(int(px / 100 * width), int(py / 100 * height)) for px, py in line]
        for (x0, y0), (x1, y1) in zip(points, points[1:]):
            steps = max(abs(x1 - x0), abs(y1 - y0), 1)
            for step in range(steps + 1):
                x = x0 + (x1 - x0) * step // steps
                y = y0 + (y1 - y0) * step // steps
                for dy in range(-2, 3):
                    for dx in range(-2, 3):
                        nx, ny = x + dx, y + dy
                        if 0 <= nx < width and 0 <= ny < height:
                            barriers[ny][nx] = True
    # Open a small hole on each printed number so the seed can enter the region.
    for _, px, py in SEEDS:
        cx, cy = int(px / 100 * width), int(py / 100 * height)
        for dy in range(-3, 4):
            for dx in range(-3, 4):
                if dx * dx + dy * dy > 9:
                    continue
                nx, ny = cx + dx, cy + dy
                if 0 <= nx < width and 0 <= ny < height:
                    barriers[ny][nx] = False
    passable = [
        [is_land(pixels[x, y]) and not barriers[y][x] for x in range(width)]
        for y in range(height)
    ]
    labels = [[0 for _ in range(width)] for _ in range(height)]

    def flood(start: tuple[int, int], number: int) -> int:
        if labels[start[1]][start[0]]:
            return 0
        queue = deque([start])
        labels[start[1]][start[0]] = number
        count = 1
        while queue:
            x, y = queue.popleft()
            for nx, ny in ((x - 1, y), (x + 1, y), (x, y - 1), (x, y + 1)):
                if 0 <= nx < width and 0 <= ny < height and passable[ny][nx] and labels[ny][nx] == 0:
                    labels[ny][nx] = number
                    count += 1
                    queue.append((nx, ny))
        return count

    for number, px, py in SEEDS + EXTRA_SEEDS:
        start = find_land(passable, width, height, int(px / 100 * width), int(py / 100 * height))
        if start is None:
            print("missing seed", number, px, py)
            continue
        flood(start, number)

    neighbors = ((-1, 0), (1, 0), (0, -1), (0, 1), (-1, -1), (1, -1), (-1, 1), (1, 1))

    def dilate(steps: int, allowed: list[list[bool]]) -> None:
        nonlocal labels
        for _ in range(steps):
            nxt = [row[:] for row in labels]
            changed = False
            for y in range(height):
                for x in range(width):
                    if labels[y][x] or not allowed[y][x]:
                        continue
                    votes = [
                        labels[y + dy][x + dx]
                        for dx, dy in neighbors
                        if 0 <= x + dx < width and 0 <= y + dy < height and labels[y + dy][x + dx]
                    ]
                    if votes:
                        nxt[y][x] = max(set(votes), key=votes.count)
                        changed = True
            labels = nxt
            if not changed:
                break

    # Fill leftover land pockets and the printed outline.
    land_or_border = [
        [is_land(pixels[x, y]) or is_barrier(pixels[x, y]) for x in range(width)]
        for y in range(height)
    ]
    dilate(16, land_or_border)
    # Nearby sea counts too — nearest district wins, so the click need not be exact.
    dilate(40, [[True] * width for _ in range(height)])

    counts = {number: 0 for number in range(1, 19)}
    hit = Image.new("RGBA", (width, height), (0, 0, 0, 0))
    hit_pixels = hit.load()
    preview = source.copy().convert("RGBA")
    draw = ImageDraw.Draw(preview, "RGBA")
    for y in range(height):
        for x in range(width):
            number = labels[y][x]
            if number == 0:
                continue
            counts[number] += 1
            hit_pixels[x, y] = (number * 10, 0, 0, 255)
            color = PALETTE[number]
            current = preview.getpixel((x, y))
            preview.putpixel(
                (x, y),
                (
                    int(current[0] * 0.42 + color[0] * 0.58),
                    int(current[1] * 0.42 + color[1] * 0.58),
                    int(current[2] * 0.42 + color[2] * 0.58),
                    255,
                ),
            )

    for number, px, py in SEEDS:
        x, y = int(px / 100 * width), int(py / 100 * height)
        draw.ellipse((x - 3, y - 3, x + 3, y + 3), outline=(15, 23, 42, 255), width=1)

    hit.save(HIT)
    preview.save(PREVIEW)
    print("wrote", HIT, hit.size)
    print("wrote", PREVIEW)
    for number in range(1, 19):
        print(f"{number:2d} {counts[number]:6d} px")
    print("labelled", sum(counts.values()), "of", width * height)


if __name__ == "__main__":
    main()
