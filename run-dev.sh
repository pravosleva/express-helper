#!/bin/bash

parallel_commands() {
  for cmd in "$@"; do {
    echo "Process \"$cmd\" started";
    $cmd & pid=$!
    PID_LIST+=" $pid";
    sleep 10
  } done

  trap "kill $PID_LIST" SIGINT

  echo "Parallel processes have started";

  wait $PID_LIST

  echo
  echo "All processes have completed";
}

parallel_commands "yarn build:fresh-dev" "yarn --cwd src/frontend.chat start" "yarn start"