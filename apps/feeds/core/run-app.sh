#!/usr/bin/env sh

npx -y prisma migrate deploy
node main.js
