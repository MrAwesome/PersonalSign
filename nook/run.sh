#!/bin/bash

mkdir -p /dev/shm/public
(cd /dev/shm/public && php -S 0.0.0.0:8000) &
while :; do
	php nook.php /dev/shm/public/index.html
	#wait
	echo "Encountered error, Ctrl-C to exit, otherwise will try again."
	sleep 60
done
