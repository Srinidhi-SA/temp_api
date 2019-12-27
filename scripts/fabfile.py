from __future__ import print_function
from builtins import input
from fabric.api import task, run, env
import os
from fabric.contrib import files
import fabric_gunicorn as gunicorn
from django.conf import settings
from fabric.context_managers import cd
import random


env.use_ssh_config = True
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
env.hosts = ['dev_model_docker']



@task
def alt_deploy_api():
    down_all()
    print("DOWN ALL CONTAINERS")
    with cd("/home/ubuntu/env_deployment/mAdvisor-api"):
        run("git checkout env_vivek_fe ; sudo git pull")
        print("LATEST CODE PULLED FROM GITHUB")
        run("sudo cp -r /home/ubuntu/env_deployment/mAdvisor-api /tmp/")
        print("CODE COPIED TO TMP")
        run("sudo rm -f /tmp/mAdvisor-api/api/.gitignore && sudo rm -f -r /tmp/mAdvisor-api/api/.git")
        print("REMOVED .GIT FILES")
        run("sudo tar -zcvf /tmp/code.tgz /tmp/mAdvisor-api")
        print("MADE CODE TAR FILE")
        run("sudo cp /tmp/code.tgz /home/ubuntu/env_deployment/docker_kubernetes/mAdvisor-api/")
        print("COPIED TAR FILE TO API")
        run("sudo cp /tmp/code.tgz /home/ubuntu/env_deployment/docker_kubernetes/spark_docker/")
        print("COPIED TAR FILE TO SPARK")
        with cd("/home/ubuntu/env_deployment/docker_kubernetes/mAdvisor-api"):
            run("sudo docker build -t api:latest .")
            print("BUILT API IMAGE")

    with cd("/home/ubuntu/env_deployment/docker_kubernetes/spark_docker"):
        run("sudo docker build -t spark:latest .")
        print("BUILT SPARK IMAGE")
    up_all()
    print("UP ALL CONTAINERS")
    gunicorn.reload()
    print("** DEPLOYMENT COMPLETE **")



@task
def mysql_api_redis_nginx_down():
    run("cd /home/ubuntu/env_deployment/docker_kubernetes/mysql_api_redis_nginx_compose && sudo docker-compose down")



@task
def hadoop_spark_down():
    run("cd /home/ubuntu/env_deployment/docker_kubernetes/hadoop_spark_compose && sudo docker-compose -f hadoop_spark_compose.yml down")




@task
def mysql_api_redis_nginx_up():
    run("cd /home/ubuntu/env_deployment/docker_kubernetes/mysql_api_redis_nginx_compose && sudo docker-compose up -d")



@task
def hadoop_spark_up():
    run("cd /home/ubuntu/env_deployment/docker_kubernetes/hadoop_spark_compose && sudo docker-compose -f hadoop_spark_compose.yml up -d")



@task
def up_all():
    mysql_api_redis_nginx_up()
    hadoop_spark_up()



@task
def down_all():
    hadoop_spark_down()
    mysql_api_redis_nginx_down()


@task
def deploy_api():
    with cd("/home/ubuntu/env_deployment/mAdvisor-api"):
        '''
        print "CHECKING BRANCH STATUS..."
        capture = run("git status")
        print capture
        if "Changes not staged for commit" in capture:
            run("git stash")
            print "UNCOMMITTED CHANGES STASHED"
        else:
            print "NO UNSTASHED CHANGES. PROCEEDING..."
        '''
        run("sudo git checkout env_vivek_fe ; sudo git pull")
        print("LATEST API CODE PULLED FROM GITHUB")
        run("sudo cp -r /home/ubuntu/env_deployment/mAdvisor-api /tmp/")
        print("CODE COPIED TO TMP")
        run("sudo rm -f /tmp/mAdvisor-api/api/.gitignore && sudo rm -f -r /tmp/mAdvisor-api/api/.git")
        print("REMOVED .GIT FILES")

        container_name = run("sudo docker ps -aqf \"name=api\" | head -n 1")
        print(container_name)
        print("FETCHED API CONTAINER ID")
        run("sudo docker cp /tmp/mAdvisor-api "+container_name+":/home/mAdvisor/")
        print("LATEST API CODE PUT INSIDE API CONTAINER")

        ifReqInstAPI = input("API Requirements installation required?(y/n)")
        ifMigrateAPI = input("Database migrations required?(y/n)")
        if (ifReqInstAPI.strip().lower() == 'y'  and  ifMigrateAPI.strip().lower() == 'y'):
            run ("docker exec "+container_name+" bash -c  \"cd ..  &&  . myenv/bin/activate  &&  pip install -r requirements.txt  &&  cd mAdvisor-api/  &&  python manage.py makemigrations  &&  python manage.py migrate\"")
            print("API REQUIREMENTS INSTALLED AND DATABASES MIGRATED")
        elif (ifReqInstAPI.strip().lower() == 'y'):
            run ("docker exec "+container_name+" bash -c  \"cd ..  &&  . myenv/bin/activate  &&  pip install -r requirements.txt\"")
            print("API REQUIREMENTS INSTALLED")
        else:
             print("API REQUIREMENTS INSTALL AND DATABASE MIGRATE AVOIDED")

        container_name = run("sudo docker ps -aqf \"name=spark\" | head -n 1")
        print(container_name)
        print("FETCHED SPARK CONTAINER ID")
        run("sudo docker cp /tmp/mAdvisor-api "+container_name+":/home/mAdvisor/")
        print("LATEST API CODE PUT INSIDE SPARK CONTAINER")

        ifReqInstSPARK = input("SPARK Requirements installation required?(y/n)")
        if (ifReqInstSPARK.strip().lower() == 'y'):
            run ("docker exec "+container_name+" bash -c  \"pip install -r requirements.txt\"")
            print("SPARK REQUIREMENTS INSTALLED")
        else:
            print("SPARK REQUIREMENTS INSTALL AVOIDED")

        reloadCelery = input("Celery reload required?(y/n)")
        if (reloadCelery.strip().lower() == 'y'):
            run ('''docker exec '''+container_name+''' bash -c  \"ps auxww | grep celery | grep -v 'grep' | awk '{print $2}' | xargs kill -HUP\"''')
            print("CELERY GRACEFULLY RELOADED")
        else:
            print("CELERY RELOAD AVOIDED")


        #gunicorn.reload()
        #print "GUNICORN RELOADED"
    print("** DEPLOYMENT COMPLETE **")


@task
def deploy_ml():
    with cd("/home/ubuntu/env_deployment/mAdvisor-MLScripts"):
        '''
        print "CHECKING BRANCH STATUS..."
            capture = run("git status")
            print capture
            if "Changes not staged for commit" in capture:
                run("git stash")
                print "UNCOMMITTED CHANGES STASHED"
            else:
                print "NO UNSTASHED CHANGES. PROCEEDING..."
        '''
        run("sudo git checkout staging ; sudo git pull")
        print("LATEST ML CODE PULLED FROM GITHUB")


        run("sudo su -c  \"cd /home/ubuntu/env_deployment  &&  . venv/bin/activate  &&  cd mAdvisor-MLScripts  &&  python setup.py bdist_egg\"")

        container_name = run("sudo docker ps -aqf \"name=spark\" | head -n 1")
        print(container_name)
        print("FETCHED SPARK CONTAINER ID")
        run("sudo docker cp /home/ubuntu/env_deployment/mAdvisor-MLScripts/dist/marlabs_bi_jobs-0.0.0-py2.7.egg "+container_name+":/home/mAdvisor/mAdvisor-api/scripts/")
        print("LATEST ML CODE PUT INSIDE SPARK CONTAINER")
    print("** DEPLOYMENT COMPLETE **")





@task
def deploy_ui():

    with cd("/home/ubuntu/env_deployment/mAdvisor-api"):
        '''
        print "CHECKING BRANCH STATUS..."
        capture = run("git status")
        print capture
        if "Changes not staged for commit" in capture:
            run("git stash")
            print "UNCOMMITTED CHANGES STASHED"
        else:
            print "NO UNSTASHED CHANGES. PROCEEDING..."
        '''
        run("git checkout env_vivek_fe ; sudo git pull")
        print("LATEST UI CODE PULLED FROM GITHUB")

    run("sudo cp -r /home/ubuntu/env_deployment/mAdvisor-api /home/ubuntu/env_deployment/UI_deployment/")
    with cd("/home/ubuntu/env_deployment/UI_deployment/mAdvisor-api/static/react/"):
        run("sudo su -c \"curl -sL https://deb.nodesource.com/setup_8.x | bash -  &&  sudo apt-get install nodejs -y  &&  sudo node -v  &&  sudo npm install  &&  sudo npm -v  &&  npm audit fix  &&  sudo npm run buildDev\"")

        print("BUNDLE.JS FILE OF LATEST CODE CREATED")


    container_name = run("sudo docker ps -aqf \"name=nginx\" | head -n 2 | tail -n 1")
    print(container_name)
    print("FETCHED NGINX CONTAINER ID")
    run("sudo docker cp /home/ubuntu/env_deployment/UI_deployment/mAdvisor-api/static/react/dist/app/bundle.js "+container_name+":/home/static/react/dist/app/")
    print("LATEST UI CODE PUT INSIDE NGINX CONTAINER")

    #Task: Avoid updating UI Version In script.
    #with cd("/home/ubuntu/env_deployment/UI_deployment/mAdvisor-api/config/settings"):
    #    text_command = 'CONFIG_FILE_NAME = \'luke\'\nUI_VERSION = \'{0}\''.format(random.randint(100000,10000000))
    #    print text_command
    #    run("sudo su -c \"echo '{0}' > config_file_name_to_run.py\"".format(text_command))
    #    run('''sudo sed -i "s/luke/'luke'/"  config_file_name_to_run.py''')
        #run('''sudo sed -i "s/4309824/'4309824'/"  config_file_name_to_run.py''')
    #    print "CONFIG FILENAME TO RUN UPDATED"

    container_name = run("sudo docker ps -aqf \"name=api\" | head -n 1")
    print(container_name)
    print("FETCHED API CONTAINER ID")
    run("sudo docker cp /home/ubuntu/env_deployment/UI_deployment/mAdvisor-api/config/settings/config_file_name_to_run.py "+container_name+":/home/mAdvisor/mAdvisor-api/config/settings/")
    print("CONFIG FILE UPDATED INSIDE API CONTAINER")

    container_name = run("sudo docker ps -aqf \"name=nginx\" | head -n 2 | tail -n 1")
    print(container_name)
    print("FETCHED NGINX CONTAINER ID")
    run("docker exec -it "+container_name+" bash -c \"service nginx reload\"")
    print("NGINX RELOADED")

    print("** DEPLOYMENT COMPLETE **")



'''
api restarting problem
sudo docker cp /home/ubuntu/env_deployment/UI_deployment/mAdvisor-api/config/settings/config_file_name_to_run.py <api-container-id>:/home/mAdvisor/mAdvisor-api/config/settings/
'''
