#!/usr/bin/env sh

export DEBIAN_FRONTEND=noninteractive

wget -q -O - https://dl-ssl.google.com/linux/linux_signing_key.pub | apt-key add -
echo "deb http://dl.google.com/linux/chrome/deb/ stable main" >> /etc/apt/sources.list.d/google.list
apt update && apt install -y google-chrome-stable
