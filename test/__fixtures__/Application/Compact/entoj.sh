#!/bin/bash

# Prepare pathes
SELF=$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )

# Run
$SELF/../../../../entoj.sh "$@" --configuration "$SELF/entoj/configuration.js"