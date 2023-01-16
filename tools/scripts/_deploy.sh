#!/bin/bash
set -e -a

SCRIPT_PATH="$( cd "$(dirname "$0")" >/dev/null 2>&1 ; pwd -P )"
REGISTRY=${1}
TARGET_SERVER=${2}
CONFIGURATION=${3}
TOKEN=${4}

if [[ -n "$TOKEN" ]]; then
  oc login --server=${TARGET_SERVER} --token=${TOKEN}
fi

OC_USER="$( oc whoami )"
OC_SERVER="$( oc whoami --show-server )"
OC_PROJECT=kotka

cd ${SCRIPT_PATH}/../../

if [[ -z "${OC_USER}" ]]; then
  echo ""
  echo "Please login with oc command first!!!"
  echo ""
  echo "PLZ note that you also need to install docker and oc commands"
  echo ""
  exit 1
fi
if [[ $OC_SERVER != "${TARGET_SERVER}" ]]; then
  echo ""
  echo "You should login to ${TARGET_SERVER} instead of"
  echo "${OC_SERVER} "
  echo ""
  exit 1
fi

oc project ${OC_PROJECT}

echo "Building..."
docker build -t kotka-api -f tools/docker/kotka/prod/Dockerfile --target kotka-api --build-arg CONFIGURATION=${CONFIGURATION} .
docker build -t kotka -f tools/docker/kotka/prod/Dockerfile --target kotka --build-arg CONFIGURATION=${CONFIGURATION} .

echo "Tagging..."
docker tag kotka-api "${REGISTRY}/kotka-api:latest"
docker tag kotka "${REGISTRY}/kotka:latest"

echo "Pushing..."
docker login -u `oc whoami` -p `oc whoami --show-token` ${REGISTRY}
docker push "${REGISTRY}/kotka-api"
docker push "${REGISTRY}/kotka"

echo "Apply changes"
oc apply -f tools/openshift/kotka-api-deploymentconfig.yaml
oc apply -f tools/openshift/kotka-deploymentconfig.yaml

echo "Restarting pods"
PODS="$( oc get pods | grep kotka- | awk '{print $1}' )"
for pod in $PODS
do
  oc delete pod $pod
  sleep 30
done

echo ""
echo ""
echo "********************************"
echo "*                              *"
echo "*          DEPLOYED            *"
echo "*                              *"
echo "********************************"
echo ""
