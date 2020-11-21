#!/usr/bin/env bash

set -eu
set -o pipefail


cd "$(dirname "$0")" || exit 1

PATH="$PWD/node_modules/.bin:$PATH"

./release.ts
