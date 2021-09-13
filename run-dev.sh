#!/bin/bash

frontend=$1

parallel_commands() {
  for cmd in "$@"; do {
    echo "Process \"$cmd\" started";
    $cmd & pid=$!
    PID_LIST+=" $pid";
    sleep 5
  } done

  trap "kill $PID_LIST" SIGINT

  echo "Parallel processes have started";

  wait $PID_LIST

  echo
  echo "All processes have completed";
}

if [ $# -eq 1 ]
then
  case $1 in
    "chat")
    parallel_commands "yarn build:fresh-dev" "yarn --cwd src/frontend.chat start" "yarn start"
    ;;
    *)
    echo "☠️ SCRIPT: run-dev.sh | Undefined param value" &&
    exit 1
  esac
  # exit 0
else
  # echo "☠️ SCRIPT: envs-init.sh | Param is required! cra|nextjs"
  # exit 1
  yarn build:fresh-dev && yarn start
fi
