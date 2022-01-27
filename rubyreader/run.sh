#!/bin/bash

cd "$(dirname "$0")"

DT=$(date "+%Y%m%d_%H%M")
OUTF="build/${DT}.epub"

ruby main.rb

ebook-convert build/index.html "$OUTF"

adb connect 192.168.1.97:5555
#adb shell 'rm /media/My\ Files/Books/today.epub' || true
adb push "$OUTF" '/media/My Files/Books/'
