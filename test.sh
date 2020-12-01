#!/usr/bin/env bash 
cd nginx_docker
docker build -t nginx .
docker tag nginx 115502491259.dkr.ecr.us-east-1.amazonaws.com/madvisor_nginx:latest
$(aws ecr get-login --region us-east-1 --no-include-email) 
docker push 115502491259.dkr.ecr.us-east-1.amazonaws.com/madvisor_nginx:latest 
