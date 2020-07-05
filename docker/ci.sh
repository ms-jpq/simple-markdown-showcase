#!/usr/bin/env bash

set -eu
set -o pipefail


cd "$(dirname "$0")/.." || exit 1

IMAGE='sms'
docker build -f 'docker/Dockerfile' -t "$IMAGE" .
