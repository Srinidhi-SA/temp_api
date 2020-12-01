#!/usr/bin/env bash 
cd nginx_docker
sudo  docker build -t nginx .
sudo docker tag nginx 115502491259.dkr.ecr.us-east-1.amazonaws.com/madvisor_nginx:latest
sudo $(aws ecr get-login --region us-east-1 --no-include-email) 
sudo docker push 115502491259.dkr.ecr.us-east-1.amazonaws.com/madvisor_nginx:latest 
