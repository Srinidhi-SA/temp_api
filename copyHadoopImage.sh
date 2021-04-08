cd hadoop_docker
docker build -t hadoop .
docker tag hadoop:latest 210201387539.dkr.ecr.us-east-2.amazonaws.com/madvisor-dev-hadoop:latest
$(aws ecr get-login --region us-east-2 --no-include-email) 
docker push 210201387539.dkr.ecr.us-east-2.amazonaws.com/madvisor-dev-hadoop:latest
cd ..
