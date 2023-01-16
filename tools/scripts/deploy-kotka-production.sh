#!/bin/bash
set -e

SCRIPT_PATH="$( cd "$(dirname "$0")" >/dev/null 2>&1 ; pwd -P )"

cd ${SCRIPT_PATH}

./_deploy.sh \
  "registry.ext.ocp-prod-0.k8s.it.helsinki.fi/kotka" \
  "https://api.ocp-prod-0.k8s.it.helsinki.fi:6443" \
  "production" \
  ${1}
