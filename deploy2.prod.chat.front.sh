#!/bin/bash

source ./read-env.sh

CHAT_FRONT_LOCAL_BUILD_DIR=$(read_env CHAT_FRONT_LOCAL_BUILD_DIR .env.prod."$1")
CHAT_FRONT_TARGET_BUILD_DIR=$(read_env CHAT_FRONT_TARGET_BUILD_DIR .env.prod."$1")

echo '-- DEPLOY STARTED' &&

rsync -av --delete $CHAT_FRONT_LOCAL_BUILD_DIR $CHAT_FRONT_TARGET_BUILD_DIR &&

echo '-- DEPLOY COMPLETED'
