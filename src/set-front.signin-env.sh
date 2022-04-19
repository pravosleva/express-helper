#!/bin/bash

source ./read-env.sh

REACT_APP_API_URL=$(read_env SINGN_PAGE_REACT_APP2_API_URL .env.prod."$2")
REACT_APP_EXTERNAL_ROUTING=$(read_env SIGN_PAGE_REACT_APP_EXTERNAL_ROUTING .env.prod."$2")

# NOTE: Все директории относительно project root dir
echo "SKIP_PREFLIGHT_CHECK=true" > src/frontend.signin/.env

if [ $# -eq 2 ]
then
  # NOTE: Билд CRA всегда происходит как для production.
  case $1 in
    "dev")
      echo "REACT_APP_API_URL=http://localhost:5000" > src/frontend.signin/.env.production
    ;;
    "prod")
      echo "REACT_APP_API_URL=$REACT_APP_API_URL
REACT_APP_EXTERNAL_ROUTING=$REACT_APP_EXTERNAL_ROUTING" > src/frontend.signin/.env.production
    ;;
    *)
    echo "☠️ SCRIPT: unknown param $1" &&
    exit 1
  esac
  exit 0
else
  echo "☠️ SCRIPT: param was not set"
  exit 1
fi
