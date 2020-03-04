#!/usr/bin/env bash

PATH="$PWD/node_modules/.bin:$PATH"
./src/entry.ts clean

(
  cd ./artifacts || exit
  ls -1 | xargs -l rm -r
)

rsync -a dist/ templates/ artifacts/

(
  cd ./artifacts || exit
  git add .
  git commit -m "build - $(date)"
  git push
)
