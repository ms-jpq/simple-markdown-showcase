#!/usr/bin/env bash

./src/entry.ts clean

rm -r ms-jpq.github.io/docs
cp -r dist ms-jpq.github.io/docs
