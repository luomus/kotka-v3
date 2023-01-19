#!/bin/bash
set -e

SCRIPT_PATH="$( cd "$(dirname "$0")" >/dev/null 2>&1 ; pwd -P )"
cd ${SCRIPT_PATH}/../../

docker-compose -f ./docker-compose.e2e.yml down --remove-orphans -v
docker-compose -f ./docker-compose.e2e.yml up --build kotka-e2e

# Give docker some time to finish after test run
sleep 5
docker-compose -f ./docker-compose.e2e.yml down --remove-orphans -v
