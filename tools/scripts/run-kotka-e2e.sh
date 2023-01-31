#!/bin/bash
set -e

SCRIPT_PATH="$( cd "$(dirname "$0")" >/dev/null 2>&1 ; pwd -P )"
cd ${SCRIPT_PATH}/../../

docker-compose -f ./docker-compose.e2e.yml --env-file .env.e2e down --remove-orphans -v

exit_code=0
docker-compose -f ./docker-compose.e2e.yml --env-file .env.e2e up --build --exit-code-from kotka-e2e kotka-e2e \
|| exit_code=$?

docker-compose -f ./docker-compose.e2e.yml --env-file .env.e2e down --remove-orphans -v

if [[ $exit_code -eq 0 ]]; then
    echo "Tests passed"
  else
    echo "Tests failed"
    exit $exit_code
fi
