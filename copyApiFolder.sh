rsync -r * API_DOCKER/code/mAdvisor-api/ --exclude API_DOCKER --exclude copyApiFolder.sh --exclude buildspec.yml --exclude hadoop_docker --exclude NGINX_DOCKER --exclude copyHadoopImage.sh --exclude requirements
cp -r requirements API_DOCKER/requirements/
rm -r NGINX_DOCKER/static/static
cp -r static NGINX_DOCKER/static/
cd API_DOCKER
docker build -t $REPOSITORY_URI_API:latest .
docker tag $REPOSITORY_URI_API:latest $REPOSITORY_URI_API:$IMAGE_TAG_API
$(aws ecr get-login --region us-east-2 --no-include-email) 
docker push $REPOSITORY_URI_API:$IMAGE_TAG_API
cd ..