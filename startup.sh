#!/bin/sh

sleep 7s
#. ../myenv/bin/activate
python3 manage.py makemigrations
python3 manage.py migrate
python3 manage.py loaddata all_apps.json


USER="dladmin"
PASS="thinkbig"
MAIL="admin@marlabs.com"
script="
from django.contrib.auth.models import User;

username = '$USER';
password = '$PASS';
email = '$MAIL';

if User.objects.filter(username=username).count()==0:
    User.objects.create_superuser(username, email, password);
    print('Superuser created.');
else:
    print('Superuser already exists.');
"
printf "$script" | python3 manage.py shell
#echo "from django.contrib.auth.models import User; User.objects.create_superuser('admin', 'admin@example.com', 'pass')" | python manage.py shell
#python manage.py runserver 0.0.0.0:8000 
#redirecting logs to stdout 
sed -i 's/from logger_config import */#from logger_config import */g' config/settings/base.py
sh shell_gunicorn.sh 8000
