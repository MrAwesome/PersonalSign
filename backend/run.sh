#!/usr/bin/env bash

cd "$(dirname "$0")" || exit 1

yarn || exit 1

while :; do
    git pull --rebase --autostash

    yarn run ts-node src/index.ts

    echo "Server was shut down, restarting..."
    sleep 10
done
