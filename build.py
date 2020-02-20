#!/usr/bin/env python3

import argparse
import datetime
import errno
import os
import subprocess
import urllib.parse
import urllib.request
import io

import yaml


#
# Domain Agnostic
#

def get(uri):
  with urllib.request.urlopen(uri) as fd:
    return fd.read()


def get_string(uri):
  return get(uri).decode()


def write(data, path, mode="w"):
  with open(path, mode) as fd:
    return fd.write(data)


def mkdir(dirname):
  try:
    os.makedirs(dirname)
  except OSError as exc:
    if not os.path.isdir(dirname) or exc.errno != errno.EEXIST:
      raise


def read_yaml(path):
  with open(path) as fd:
    return yaml.safe_load(fd)


def load_yaml(string):
  with io.StringIO(string) as fd:
    return yaml.safe_load(fd)


def call(*cmds):
  for cmd in cmds:
    print(cmd)
    subprocess.call(cmd.split())


def clone(src, dest="./"):
  cmd1 = f"mkdir -p {dest}"
  cmd2 = f"git clone --depth=1 {src} {dest}/"
  call(cmd1, cmd2)


#
# Build Logic
#

_config_ = "projects.yml"


def download_projects(whoami, projects):
  def download_project(project):
    base = f"https://raw.githubusercontent.com/{whoami}/{project}/master"
    jekyll = get(f"{base}/_config.yml")
    readme = get(f"{base}/README.md")
    write(readme, f"_posts/{project}.md", mode="wb")
  for project in projects:
    download_project(project)


def build():
  config = read_yaml(_config_)
  projects = config["projects"]
  whoami = config["whoami"]
  download_projects(whoami, projects)


build()
