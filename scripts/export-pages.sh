#!/bin/sh
set -eu

ROOT="$(CDPATH= cd -- "$(dirname -- "$0")/.." && pwd)"
cd "$ROOT"

NEXT_PUBLIC_BASE_PATH=/geography GITHUB_ACTIONS=true npm run build

rm -rf _next _not-found 404 s1 s2 maps
rm -f index.html 404.html icon.svg .nojekyll

cp -a out/index.html out/404.html out/icon.svg .
cp -a out/.nojekyll .
cp -a out/_next out/_not-found out/404 out/s1 out/s2 out/maps .
