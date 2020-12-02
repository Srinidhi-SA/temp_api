FROM ubuntu:16.04

RUN mkdir /home/mAdvisor/
WORKDIR /home/mAdvisor/
ADD requirements.tgz /home/mAdvisor/
RUN apt-get update
RUN apt-get install python-pip virtualenv enchant vim telnet net-tools -y
RUN virtualenv --python=python2.7 myenv
RUN . myenv/bin/activate && apt-get install libmysqlclient-dev -y && apt install postgresql-server-dev-all -y 
RUN apt-get install curl -y
ADD code.tgz /home/mAdvisor/
COPY startup.sh /home/mAdvisor/mAdvisor-api/
COPY migrate.sh /home/mAdvisor/mAdvisor-api/
RUN chmod +x /home/mAdvisor/mAdvisor-api/startup.sh
RUN chmod +x /home/mAdvisor/mAdvisor-api/migrate.sh
COPY apps.json /home/mAdvisor/mAdvisor-api/apps.json
RUN chmod +x /home/mAdvisor/mAdvisor-api/apps.json
RUN mkdir /home/mAdvisor/mAdvisor-api/server_log
WORKDIR /home/mAdvisor/mAdvisor-api/

EXPOSE 8000 9015 8080 80
CMD ["/home/mAdvisor/mAdvisor-api/startup.sh"]
