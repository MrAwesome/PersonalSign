#!/usr/bin/env bash

cd "$(dirname "$0")"

yarn

if [ -d "/mem" ]; then
    tmpdir="/mem/personalsign"
else
    tmpdir="/tmp/personalsign"
fi

# Run a simple web server
mkdir -p "${tmpdir}"
(cd "${tmpdir}" && php -S 0.0.0.0:8000) &

# Generate the index.html file that web server will serve
while :; do
    yarn run ts-node src/index.ts
    sleep 600
    git pull --rebase --autostash
done
