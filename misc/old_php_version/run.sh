#!/usr/bin/env bash

tmpdir="/mem/personalsign"
php_cmd="php-8.1"

mkdir -p "${tmpdir}"
(cd "${tmpdir}" && ${php_cmd} -S 0.0.0.0:8000) &
while :; do
	${php_cmd} nook.php "${tmpdir}"/index.html
	#wait
	echo "Encountered error, Ctrl-C to exit, otherwise will try again."
	sleep 60
done
