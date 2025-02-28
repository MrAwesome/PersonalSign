#!/usr/bin/env bash

cd "$(dirname "$0")" || exit 1

yarncmd=yarn
if command -v yarnpkg &>/dev/null; then
    yarncmd=yarnpkg
fi

$yarncmd || exit 1

while :; do
    git fetch origin main
    git reset --hard origin/main

    $yarncmd run ts-node src/index.ts

    echo "Server was shut down, restarting..."
    sleep 10
done
