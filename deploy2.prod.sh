#!/bin/bash

source ./read-env.sh

EXPRESS_HELPER_SERVER_TARGET_PATH_BUILD_DIR=$(read_env EXPRESS_HELPER_SERVER_TARGET_PATH_BUILD_DIR .env.prod."$1")
# EXPRESS_HELPER_SERVER_TARGET_PATH_NM_DIR=$(read_env EXPRESS_HELPER_SERVER_TARGET_PATH_NM_DIR .env.prod."$1")
EXPRESS_HELPER_SERVER_TARGET_PATH_PUBLIC_DIR=$(read_env EXPRESS_HELPER_SERVER_TARGET_PATH_PUBLIC_DIR .env.prod."$1")
# EXPRESS_HELPER_SERVER_TARGET_PATH_BIN_DIR=$(read_env EXPRESS_HELPER_SERVER_TARGET_PATH_BIN_DIR .env.prod."$1")

echo '-- DEPLOY STARTED' &&

rsync -av --delete server-dist/ $EXPRESS_HELPER_SERVER_TARGET_PATH_BUILD_DIR &&
# rsync -av --delete node_modules/ $EXPRESS_HELPER_SERVER_TARGET_PATH_NM_DIR &&
rsync -av --delete public/ $EXPRESS_HELPER_SERVER_TARGET_PATH_PUBLIC_DIR &&
# rsync -av --delete bin/ $EXPRESS_HELPER_SERVER_TARGET_PATH_BIN_DIR &&
# rsync -av --delete storage/chat.rooms.json root@pravosleva.ru:/home/projects/pravosleva-blog/express-helper/storage/chat.rooms.json &&

echo '-- DEPLOY COMPLETED'
