#!/bin/bash

BUILD_DATE=$(date +"%Y-%m-%d %T")
# EXTERNAL_DIR=""$(dirname "$PWD")""
# echo EXTERNAL_DIR

source ./read-env.sh

REACT_APP_WS_API_URL=$(read_env REACT_APP_WS_API_URL .env.prod."$2")
PUBLIC_URL=$(read_env PUBLIC_URL .env.prod."$2")
REACT_APP_API_URL=$(read_env REACT_APP_API_URL .env.prod."$2")
REACT_APP_CHAT_NAME=$(read_env REACT_APP_CHAT_NAME .env.prod."$2")
REACT_APP_CHAT_UPLOADS_URL=$(read_env REACT_APP_CHAT_UPLOADS_URL .env.prod."$2")
REACT_APP_PRAVOSLEVA_BOT_BASE_URL=$(read_env REACT_APP_PRAVOSLEVA_BOT_BASE_URL .env.prod."$2")

echo "$BUILD_DATE" &&
echo $REACT_APP_API_URL &&

# NOTE: Все директории относительно project root dir
echo "SKIP_PREFLIGHT_CHECK=true
GENERATE_SOURCEMAP=false" > src/frontend.chat/.env

if [ $# -eq 2 ]
then
  # NOTE: Билд CRA всегда происходит как для production.
  case $1 in
    "dev")
      echo "REACT_APP_WS_API_URL=http://localhost:5000
PUBLIC_URL=/chat" > src/frontend.chat/.env.production &&
      echo "REACT_APP_WS_API_URL=http://localhost:5000
PUBLIC_URL=/chat
REACT_APP_API_URL=http://localhost:5000
REACT_APP_CHAT_UPLOADS_URL=http://localhost:5000/chat/storage/uploads" > src/frontend.chat/.env.development.local
    ;;
    "prod")
      echo "REACT_APP_WS_API_URL=$REACT_APP_WS_API_URL
PUBLIC_URL=$PUBLIC_URL
REACT_APP_API_URL=$REACT_APP_API_URL
REACT_APP_CHAT_NAME=$REACT_APP_CHAT_NAME
REACT_APP_CHAT_UPLOADS_URL=$REACT_APP_CHAT_UPLOADS_URL
REACT_APP_BUILD_DATE=$BUILD_DATE
REACT_APP_PRAVOSLEVA_BOT_BASE_URL=$REACT_APP_PRAVOSLEVA_BOT_BASE_URL" > src/frontend.chat/.env.production
    ;;
    *)
    echo "☠️ SCRIPT: unknown param 1: $1" &&
    exit 1
  esac
  exit 0
else
  echo "☠️ SCRIPT: all params 1 & 2 was not set"
  exit 1
fi

## NGINX:

## 00-upstreams.conf

# upstream helper {
#   server 127.0.0.1:5000 fail_timeout=0 max_fails=0;
# }

## 50-pravosleva.ru.conf

# server {
#   location /express-helper/ {
#     proxy_pass http://helper/;
#   }
# }

## 51-gosuslugi.pravosleva.ru.conf

# server {
#   listen 80;
#   server_name gosuslugi.pravosleva.ru;

#   location / {
#     proxy_set_header Host pravosleva.ru;
#     proxy_pass http://127.0.0:80;
#   }
#   location /socket.io {
#     proxy_pass http://helper;
#     proxy_set_header Upgrade $http_upgrade;
#     proxy_set_header Connection "Upgrade";
#     proxy_set_header Host pravosleva.ru;
#   }
# }
