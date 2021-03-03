cd hadoop_docker
docker build -t hadoop .
docker tag hadoop:latest 115502491259.dkr.ecr.us-west-1.amazonaws.com/madvisor_dev_hadoop:latest
$(aws ecr get-login --region us-west-1 --no-include-email) 
docker push 115502491259.dkr.ecr.us-west-1.amazonaws.com/madvisor_dev_hadoop:latest
cd ..
