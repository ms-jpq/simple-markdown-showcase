MAKEFLAGS += --check-symlink-times
MAKEFLAGS += --jobs
MAKEFLAGS += --no-builtin-rules
MAKEFLAGS += --no-builtin-variables
MAKEFLAGS += --shuffle
MAKEFLAGS += --warn-undefined-variables
SHELL := bash
.DELETE_ON_ERROR:
.ONESHELL:
.SHELLFLAGS := --norc --noprofile -Eeuo pipefail -O dotglob -O nullglob -O extglob -O failglob -O globstar -c

.DEFAULT_GOAL := help

.PHONY: clean clobber mypy tsc black prettier lint fmt build

clean:
	shopt -u failglob
	rm -v -rf -- ./.mypy_cache ./dist

clobber: clean
	shopt -u failglob
	rm -v -rf -- ./.venv ./node_modules

.venv/bin/python3:
	python3 -m venv -- .venv

define PYDEPS
from itertools import chain
from os import execl
from sys import executable

from tomllib import load

toml = load(open("pyproject.toml", "rb"))

project = toml["project"]
execl(
		executable,
		executable,
		"-m",
		"pip",
		"install",
		"--upgrade",
		"--",
		*project["dependencies"],
		*chain.from_iterable(project["optional-dependencies"].values()),
)
endef

.venv/bin/mypy: .venv/bin/python3
	'$<' <<< '$(PYDEPS)'

node_modules/.bin/tsc:
	npm install

mypy: .venv/bin/mypy
	'$<' -- .

tsc: node_modules/.bin/tsc
	'$<' --project tsconfig.json

lint: mypy tsc

black: .venv/bin/mypy
	.venv/bin/isort --profile=black --gitignore -- .
	.venv/bin/black -- .

prettier: node_modules/.bin/tsc
	node_modules/.bin/prettier --write -- .

fmt: black prettier

build: .venv/bin/python3 node_modules/.bin/tsc
	'$<' -m src --production -- 'ms-jpq' 'dist'
