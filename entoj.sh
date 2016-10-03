#!/bin/bash

# Prepare pathes
SELF=$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )
ROOT="$SELF/../.."
CLI="--harmony_proxies --es_staging $SELF/source/cli.js"
COMMAND="$1"

node $CLI "$@"
