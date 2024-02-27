#!/usr/bin/env sh

export DEBIAN_FRONTEND=noninteractive

wget -q -O - https://dl-ssl.google.com/linux/linux_signing_key.pub | apt-key add -
echo "deb http://dl.google.com/linux/chrome/deb/ stable main" >> /etc/apt/sources.list.d/google.list

apt update && apt install -y xvfb libgtk-3-0 libnotify4 libgconf-2-4 libnss3 libxss1 libasound2 libgbm-dev
apt-get install -y google-chrome-stable
