#!/usr/bin/env sh

export DEBIAN_FRONTEND=noninteractive

apt update && apt install -y libgtk-3-0t64 libgbm-dev libnotify-dev libnss3 libxss1 libasound2t64 libxtst6 xauth xvfb
