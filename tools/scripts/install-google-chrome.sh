#!/usr/bin/env sh

export DEBIAN_FRONTEND=noninteractive

wget -q -O /etc/apt/keyrings/linux_signing_key.pub https://dl-ssl.google.com/linux/linux_signing_key.pub

tee /etc/apt/sources.list.d/google-chrome.sources > /dev/null <<EOF
Types: deb
URIs: https://dl.google.com/linux/chrome/deb/
Suites: stable
Components: main
Architectures: amd64 arm64
Signed-By: /etc/apt/keyrings/linux_signing_key.pub
EOF

apt update && apt install -y google-chrome-stable
