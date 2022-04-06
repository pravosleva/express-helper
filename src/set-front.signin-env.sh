#!/bin/bash

# NOTE: Все директории относительно project root dir
echo "SKIP_PREFLIGHT_CHECK=true" > src/frontend.signin/.env

if [ $# -eq 1 ]
then
  # NOTE: Билд CRA всегда происходит как для production.
  case $1 in
    "dev")
      echo "REACT_APP_API_URL=http://localhost:5000" > src/frontend.signin/.env.production
    ;;
    "prod")
## PRAVOSLEVA.RU
      echo "REACT_APP_API_URL=/express-helper
REACT_APP_EXTERNAL_ROUTING=/express-helper" > src/frontend.signin/.env.production

## SMARTPRICE beta2
#       echo "REACT_APP_API_URL=http://104.248.201.86:5000
# REACT_APP_EXTERNAL_ROUTING=http://104.248.201.86:5000" > src/frontend.signin/.env.production
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