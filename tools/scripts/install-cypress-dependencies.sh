#!/usr/bin/env sh

export DEBIAN_FRONTEND=noninteractive

apt update && apt install -y xvfb libgtk-3-0 libnotify4 libgconf-2-4 libnss3 libxss1 libasound2 libgbm-dev
