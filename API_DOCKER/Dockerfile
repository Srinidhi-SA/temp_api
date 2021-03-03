FROM ubuntu:18.04

ENV TZ=US
RUN ln -snf /usr/share/zoneinfo/$TZ /etc/localtime && echo $TZ > /etc/timezone
RUN apt-get update \
  && apt-get install -y python3-pip python3-dev \
  && cd /usr/local/bin \
  && ln -s /usr/bin/python3 python \
  && pip3 install --upgrade pip

RUN groupadd -r marlabs && useradd -r -s /bin/false -g marlabs marlabs

RUN mkdir /home/mAdvisor/
WORKDIR /home/mAdvisor/

#ADD requirements.tgz /home/mAdvisor/
ADD requirements /home/mAdvisor
RUN apt-get update

RUN apt-get install -y locales locales-all
ENV LC_ALL en_US.UTF-8
ENV LANG en_US.UTF-8
ENV LANGUAGE en_US.UTF-8

RUN apt-get install virtualenv enchant vim telnet net-tools iputils-ping -y
#RUN virtualenv --python=python3 myenv
#RUN . myenv/bin/activate  
RUN apt-get install libmysqlclient-dev -y && apt install postgresql-server-dev-all -y 
#RUN . myenv/bin/activate 
#RUN pip3 install -U setuptools
RUN pip3 install pyenchant && pip3 install -r requirements.txt

RUN apt-get install curl -y

#COPY * /home/mAdvisor/madvisor-api-temp/
#ADD code.tgz /home/mAdvisor/
ADD code /home/mAdvisor/

COPY startup.sh /home/mAdvisor/mAdvisor-api/
RUN chmod +x /home/mAdvisor/mAdvisor-api/startup.sh
COPY all_apps.json /home/mAdvisor/mAdvisor-api/all_apps.json
RUN chmod +x /home/mAdvisor/mAdvisor-api/all_apps.json
RUN mkdir /home/mAdvisor/mAdvisor-api/server_log
RUN cd /home/mAdvisor/mAdvisor-api/static && \
    ln -s react/src/assets/ assets

RUN chown -R marlabs:marlabs /home/mAdvisor/

WORKDIR /home/mAdvisor/mAdvisor-api/
EXPOSE 8000 9015 8080 80
RUN pip3 install fabric3 
#USER marlabs
RUN apt-get update

RUN apt-get install python3-tk libsm6 libxext6 libxrender-dev libgl1-mesa-glx -y
COPY migrate.sh /home/mAdvisor/mAdvisor-api/
RUN chmod +x /home/mAdvisor/mAdvisor-api/migrate.sh
COPY celery_reload.sh /home/mAdvisor/mAdvisor-api/
CMD ["/home/mAdvisor/mAdvisor-api/startup.sh"]
