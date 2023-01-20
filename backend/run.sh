#!/usr/bin/env bash

cd "$(dirname "$0")"

tmpdir="/mem/personalsign"
php_cmd="php-8.1"

mkdir -p "${tmpdir}"
(cd "${tmpdir}" && ${php_cmd} -S 0.0.0.0:8000) &

while :; do
    yarn run ts-node src/index.ts
    sleep 600
done
