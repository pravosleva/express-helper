#!/bin/bash

source ./read-env.sh
source ./log-format.sh # NOTE: See also https://opensource.com/article/20/6/bash-source-command

CHAT_FRONT_LOCAL_BUILD_DIR=$(read_env CHAT_FRONT_LOCAL_BUILD_DIR .env.prod."$1")
CHAT_FRONT_TARGET_BUILD_DIR=$(read_env CHAT_FRONT_TARGET_BUILD_DIR .env.prod."$1")

info '-- 🛫 DEPLOY STARTED' &&

rsync -av --delete $CHAT_FRONT_LOCAL_BUILD_DIR $CHAT_FRONT_TARGET_BUILD_DIR &&

good '-- 🛬 DEPLOY COMPLETED'
