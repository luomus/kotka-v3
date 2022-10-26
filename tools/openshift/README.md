# Instructions on how to deploy to openshift

## Configs

Import config files with the correct values into the cluster
(either from the web ui or from the cli)

```shell
oc apply -f tools/kubernetes/kotka-configmap.yaml
oc apply -f tools/kubernetes/kotka-secret.yaml
```

## Kotka-API 

Login to openshift and then run the following commands.
** PLZ note ** that if you're doing redeployment you can use the `tools/scripts/deploy-store-(staging|production).sh` script
(only for the first deployment you need to follow these steps).
For production replace `-test-` with `-prod-` in all the addresses bellow.

```shell
# Create image stream
oc create imagestream store-api

# Build the image
docker build -t store-api -f tools/docker/store/Dockerfile --target api --build-arg STORE_VERSION=api .

# Tag the image
docker tag store-api registry.apps.ocp-test-0.k8s.it.helsinki.fi/lajistore-api/store-api:latest

# Login to the repo
docker login -u `oc whoami` -p `oc whoami --show-token` registry.apps.ocp-test-0.k8s.it.helsinki.fi/lajistore-api

# Push the image to repo
docker push registry.apps.ocp-test-0.k8s.it.helsinki.fi/lajistore-api/store-api

# Apply store stare-api stateful set
oc apply -f tools/kubernetes/store-api-statefulset.yaml

# Apply store stare-apis service
oc apply -f tools/kubernetes/store-api-service.yaml
```

## Store-worker

1. Run the following commands:
```shell
oc create imagestream store-worker
docker build -t store-worker -f tools/docker/store/Dockerfile --target worker --build-arg STORE_VERSION=worker .
docker tag store-worker registry.apps.ocp-test-0.k8s.it.helsinki.fi/lajistore-api/store-worker:latest
docker login -u `oc whoami` -p `oc whoami --show-token` registry.apps.ocp-test-0.k8s.it.helsinki.fi/lajistore-api
docker push registry.apps.ocp-test-0.k8s.it.helsinki.fi/lajistore-api/store-worker
oc apply -f tools/kubernetes/store-worker-statefulset.yaml
```
## Store-CLI

Run the following commands:
```shell
oc create imagestream store-cli
docker build -t store-cli -f tools/docker/store/Dockerfile --target cli --build-arg STORE_VERSION=cli .
docker login -u `oc whoami` -p `oc whoami --show-token` registry.apps.ocp-test-0.k8s.it.helsinki.fi/lajistore-api
docker login -u `oc whoami` -p `oc whoami --show-token` registry.apps.ocp-prod-0.k8s.it.helsinki.fi/lajistore-api
docker tag store-cli registry.apps.ocp-test-0.k8s.it.helsinki.fi/lajistore-api/store-cli:latest
docker tag store-cli registry.apps.ocp-prod-0.k8s.it.helsinki.fi/lajistore-api/store-cli:latest
docker push registry.apps.ocp-test-0.k8s.it.helsinki.fi/lajistore-api/store-cli
docker push registry.apps.ocp-prod-0.k8s.it.helsinki.fi/lajistore-api/store-cli
oc apply -f tools/kubernetes/store-cli-statefulset.yaml

# After this there will be a pod named store-cli-0 running and that can be used to run the cli commands
# Run the following to access cli
oc rsh store-cli-0

# get the list of all available cli commands you can run node main.js command.
node main.js --help

# to get the help for a specific command you can run
node main.js <command> --help
# ex.
node main.js index --help

# If you run the commands using the web interface just leave the "--" and everything before it away
```

## Updating the cluster
There is bash script that automatically does most of the heavy lifting for you.
So only thing that you need to do is to do the changes, run the tests and then
run the following:
```shell
# make sure that the .env file has the correct environment
set -o allexport; source .env; set +o allexport
oc login --token=<token> --server=https://api.ocp-test-0.k8s.it.helsinki.fi:6443
./tools/scripts/deploy-store.sh
# This will build and restart the needed services and update following configs
#   store-configmap.yaml
#   store-api-statefulset.yaml
#   store-cli-statefulset.yaml
#   store-worker-statefulset.yaml
```
