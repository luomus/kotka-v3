docker build -t kotka-api -f tools/docker/kotka/prod/Dockerfile --target kotka-api --build-arg CONFIGURATION=beta .
docker login -u `oc whoami` -p `oc whoami --show-token` registry.apps.ocp-test-0.k8s.it.helsinki.fi/kotka-api
docker tag kotka-api registry.apps.ocp-test-0.k8s.it.helsinki.fi/kotka/kotka-api:latest
docker push registry.apps.ocp-test-0.k8s.it.helsinki.fi/kotka/kotka-api

docker build -t kotka -f tools/docker/kotka/prod/Dockerfile --target kotka --build-arg CONFIGURATION=beta .
docker login -u `oc whoami` -p `oc whoami --show-token` registry.apps.ocp-test-0.k8s.it.helsinki.fi/kotka
docker tag kotka registry.apps.ocp-test-0.k8s.it.helsinki.fi/kotka/kotka:latest
docker push registry.apps.ocp-test-0.k8s.it.helsinki.fi/kotka/kotka
