#!/bin/bash
set -e

SCRIPT_PATH="$( cd "$(dirname "$0")" >/dev/null 2>&1 ; pwd -P )"
cd ${SCRIPT_PATH}/../../

exit_code=0
docker-compose --env-file .env.e2e run --rm --no-deps --entrypoint="npm run test kotka-api" kotka-api \
|| exit_code=$?

if [[ $exit_code -eq 0 ]]; then
    echo "Tests passed"
  else
    echo "Tests failed"
    exit $exit_code
fi
