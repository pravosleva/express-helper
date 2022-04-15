#!/bin/bash

# quaint_copy копирует файлы из каталога $1 в
# каталог $2

srcDir=$1
destDir=$2

for i in $PWD/$srcDir/*; do cp -r $i $PWD/$destDir; done;
