#!/usr/bin/env python3
"""Build a district hit-map from the numbered question map."""

from __future__ import annotations

import heapq
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
    (2, 72, 8),
    (3, 70, 28),
    (7, 34, 58),
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


def is_water(rgb: tuple[int, int, int]) -> bool:
    value = brightness(rgb)
    return 175 <= value <= 230 and max(rgb) - min(rgb) <= 12


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
    work = source.copy()
    draw_src = ImageDraw.Draw(work)
    for _, px, py in SEEDS:
        x, y = int(px / 100 * width), int(py / 100 * height)
        draw_src.ellipse((x - 7, y - 7, x + 7, y + 7), fill=(255, 255, 255))
    pixels = work.load()
    passable = [[is_land(pixels[x, y]) for x in range(width)] for y in range(height)]

    infinite = 10**9
    best = [[infinite for _ in range(width)] for _ in range(height)]
    labels = [[0 for _ in range(width)] for _ in range(height)]
    heap: list[tuple[int, int, int, int]] = []

    def push(number: int, px: float, py: float) -> None:
        start = find_land(passable, width, height, int(px / 100 * width), int(py / 100 * height))
        if start is None:
            print("missing seed", number, px, py)
            return
        x, y = start
        if 0 < best[y][x]:
            best[y][x] = 0
            labels[y][x] = number
            heapq.heappush(heap, (0, number, x, y))

    for number, px, py in SEEDS + EXTRA_SEEDS:
        push(number, px, py)

    while heap:
        cost, number, x, y = heapq.heappop(heap)
        if cost != best[y][x] or labels[y][x] != number:
            continue
        for nx, ny in ((x - 1, y), (x + 1, y), (x, y - 1), (x, y + 1)):
            if not (0 <= nx < width and 0 <= ny < height and passable[ny][nx]):
                continue
            next_cost = cost + 1
            if next_cost < best[ny][nx]:
                best[ny][nx] = next_cost
                labels[ny][nx] = number
                heapq.heappush(heap, (next_cost, number, nx, ny))

    leftover_points: list[tuple[int, int]] = []
    for y in range(height):
        for x in range(width):
            if labels[y][x] == 0 and passable[y][x]:
                leftover_points.append((x, y))

    labelled_points = [
        (x, y, labels[y][x])
        for y in range(0, height, 2)
        for x in range(0, width, 2)
        if labels[y][x]
    ]
    for x, y in leftover_points:
        nearest_number = 0
        nearest_dist = 70 ** 2
        for lx, ly, number in labelled_points:
            dist = (x - lx) ** 2 + (y - ly) ** 2
            if dist < nearest_dist:
                nearest_dist = dist
                nearest_number = number
        if nearest_number:
            labels[y][x] = nearest_number

    # Clicking the printed outline should still count: grow each region into nearby non-water.
    grown = [row[:] for row in labels]
    for y in range(height):
        for x in range(width):
            if labels[y][x] or is_water(pixels[x, y]):
                continue
            nearby = [
                labels[ny][nx]
                for nx, ny in ((x - 1, y), (x + 1, y), (x, y - 1), (x, y + 1), (x - 1, y - 1), (x + 1, y - 1), (x - 1, y + 1), (x + 1, y + 1))
                if 0 <= nx < width and 0 <= ny < height and labels[ny][nx]
            ]
            if nearby:
                grown[y][x] = max(set(nearby), key=nearby.count)
    labels = grown

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
