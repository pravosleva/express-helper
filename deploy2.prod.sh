#!/bin/bash

source ./read-env.sh
source ./log-format.sh # NOTE: See also https://opensource.com/article/20/6/bash-source-command

EXPRESS_HELPER_SERVER_TARGET_PATH_BUILD_DIR=$(read_env EXPRESS_HELPER_SERVER_TARGET_PATH_BUILD_DIR .env.prod."$1")
EXPRESS_HELPER_SERVER_TARGET_PATH_NM_DIR=$(read_env EXPRESS_HELPER_SERVER_TARGET_PATH_NM_DIR .env.prod."$1")
EXPRESS_HELPER_SERVER_TARGET_PATH_PUBLIC_DIR=$(read_env EXPRESS_HELPER_SERVER_TARGET_PATH_PUBLIC_DIR .env.prod."$1")
# EXPRESS_HELPER_SERVER_TARGET_PATH_BIN_DIR=$(read_env EXPRESS_HELPER_SERVER_TARGET_PATH_BIN_DIR .env.prod."$1")

good '-- DEPLOY STARTED 🛫' &&

rsync -av --delete server-dist/ $EXPRESS_HELPER_SERVER_TARGET_PATH_BUILD_DIR &&
rsync -av --delete node_modules/ $EXPRESS_HELPER_SERVER_TARGET_PATH_NM_DIR &&
rsync -av --delete public/ $EXPRESS_HELPER_SERVER_TARGET_PATH_PUBLIC_DIR &&
# rsync -av --delete bin/ $EXPRESS_HELPER_SERVER_TARGET_PATH_BIN_DIR &&
# rsync -av --delete storage/chat.rooms.json root@pravosleva.pro:/root/projects/pravosleva-blog/express-helper/storage/chat.rooms.json &&
# rsync -av --delete storage/chat.common-notifs.json root@pravosleva.pro:/root/projects/pravosleva-blog/express-helper/storage/chat.common-notifs.json &&
# rsync -av --delete storage/chat.passwd-hashes.json root@pravosleva.pro:/root/projects/pravosleva-blog/express-helper/storage/chat.passwd-hashes.json &&
# rsync -av --delete storage/chat.rooms-tasklist.json root@pravosleva.pro:/root/projects/pravosleva-blog/express-helper/storage/chat.rooms-tasklist.json &&
# rsync -av --delete storage/chat.tg-chat-ids.json root@pravosleva.pro:/root/projects/pravosleva-blog/express-helper/storage/chat.tg-chat-ids.json &&
# rsync -av --delete storage/chat.users.json root@pravosleva.pro:/root/projects/pravosleva-blog/express-helper/storage/chat.users.json &&
# rsync -av --delete storage/pravosleva-bot-2021.autopark-2022.json root@pravosleva.pro:/root/projects/pravosleva-blog/express-helper/storage/pravosleva-bot-2021.autopark-2022.json &&
# rsync -av --delete storage/pravosleva-bot-2021.json root@pravosleva.pro:/root/projects/pravosleva-blog/express-helper/storage/pravosleva-bot-2021.json &&

good '-- DEPLOY COMPLETED 🛬'
