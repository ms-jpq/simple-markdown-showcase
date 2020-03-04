#!/usr/bin/env bash

PATH="$PWD/node_modules/.bin:$PATH"
./src/entry.ts clean

rsync -a --delete --exclude='./artifacts/.git' dist/ templates/ artifacts/

(
  cd ./artifacts || exit
  git add .
  git commit -m "build - $(date)"
  git push
)
