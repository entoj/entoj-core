#!/bin/bash

# Prepare pathes
SELF=$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )
ROOT="$SELF/../.."
CLI="--harmony_proxies --es_staging $SELF/source/cli.js"
COMMAND="$1"

case $COMMAND in
xserver)
    echo "Running server vi nodemon"
    $SELF/node_modules/nodemon/bin/nodemon.js -e "js j2 json" -w $ROOT -- $CLI "$@"
  ;;
*)
    node $CLI "$@"
  ;;
esac
