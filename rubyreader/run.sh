#!/bin/bash

cd "$(dirname "$0")"

ruby main.rb

adb connect 192.168.1.97:5555
adb shell 'rm /media/My\ Files/Books/today.epub'
adb push today.epub '/media/My Files/Books/'
