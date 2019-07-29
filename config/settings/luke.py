from base import *
import datetime


import environ
env = environ.Env(DEBUG=(bool, False),) # set default values and casting
environ.Env.read_env()

# Database
# https://docs.djangoproject.com/en/1.11/ref/settings/#databases

DEBUG = env('DEBUG')

MODE=env('MODE')
ALLOWED_HOSTS = ['172.31.50.84','madvisor.marlabsai.com']

DATABASES = {
    'default1': {
        'ENGINE': 'django.db.backends.sqlite3',
        'NAME': os.path.join(BASE_DIR, 'db.sqlite3'),
    },
    "default":  env.db()
}


PROJECT_APP = [
]

INSTALLED_APPS += PROJECT_APP

HADOOP_MASTER = env('HADOOP_MASTER')

YARN = {
    "host": HADOOP_MASTER,
    "port": env.int('YARN_PORT'), #8088,
    "timeout": env.int('YARN_TIMEOUT') #30
}

import os
import json
hdfs_config_key=json.loads(os.environ['HADOOP_CONFIG_KEY'])
hdfs_config_value=json.loads(os.environ['HADOOP_CONFIG_VALUE'])
HDFS=dict(zip(hdfs_config_key,hdfs_config_value))

EMR = {
    "emr_pem_path": "",
    "home_path": "/home/hadoop"
}

KAFKA = {
    'host': env('KAFKA_HOST'), #'localhost',
    'port': env('KAFKA_PORT'), #'9092',
    'topic': 'my-topic'
}


JOBSERVER = {
    'host': env('JOBSERVER_HOST'), #'172.31.50.84',
    'port': env('JOBSERVER_PORT'), #'8090',
    'app-name': 'luke',
    'context': 'pysql-context',
    'master': 'bi.sparkjobs.JobScript',
    'metadata': 'bi.sparkjobs.JobScript',
    'model': 'bi.sparkjobs.JobScript',
    'score': 'bi.sparkjobs.JobScript',
    'filter': 'bi.sparkjobs.filter.JobScript',
    'robo': 'bi.sparkjobs.JobScript',
    'subSetting': 'bi.sparkjobs.JobScript',
    'stockAdvisor': 'bi.sparkjobs.JobScript'
}

THIS_SERVER_DETAILS = {
    "host": env('THIS_SERVER_HOST'),
    "port": env.int('THIS_SERVER_PORT'),
    "initail_domain": "/api"
}

CACHES = {
    "default": {
        "BACKEND": "django_redis.cache.RedisCache",
        "LOCATION": "redis://"+env('REDIS_IP')+":"+env('REDIS_PORT')+"/1",
        "OPTIONS": {
            "CLIENT_CLASS": "django_redis.client.DefaultClient"
        },
        "KEY_PREFIX": "local"
    }
}
CACHE_TTL = 60 * 15
REDIS_SALT = "123"


APPEND_SLASH=False
DATA_UPLOAD_MAX_MEMORY_SIZE = 1024*1024*1024

SCORES_SCRIPTS_FOLDER = env('SCORES_SCRIPTS_DIR')
IMAGE_URL = "/api/get_profile_image/"

EMAIL_BACKEND = env('EMAIL_BACKEND')
EMAIL_HOST = env('EMAIL_HOST')
EMAIL_PORT = env.int('EMAIL_PORT')
EMAIL_HOST_USER = env('EMAIL_HOST_USER')
EMAIL_HOST_PASSWORD = env('EMAIL_HOST_PASSWORD')
EMAIL_USE_TLS = ""
EMAIL_USE_SSL = ""

JOBSERVER_FROM_EMAIL = env('JOBSERVER_FROM_EMAIL')
JOBSERVER_SENDTO_EMAIL_LIST = tuple(env.list('JOBSERVER_SENDTO_EMAIL_LIST', default=[]))

FUNNY_EMAIL_LIST = tuple(env.list('FUNNY_EMAIL_LIST', default=[]))

JOBSERVER_EMAIL_TEMPLATE = "Please restart jobserver- IP-"

DEPLOYMENT_ENV = env('DEPLOYMENT_ENV')

HADOOP_CONF_DIR=False
HADOOP_USER_NAME="hduser"

CELERY_BROKER_URL = "redis://"+env('REDIS_IP')+":"+env('REDIS_PORT')+"/"
CELERY_RESULT_BACKEND = "redis://"+env('REDIS_IP')+":"+env('REDIS_PORT')+"/"
CELERY_ACCEPT_CONTENT = ['application/json']
CELERY_TASK_SERIALIZER = 'json'
CELERY_RESULT_SERIALIZER = 'json'
CELERY_TIMEZONE = TIME_ZONE
# load related settings
CELERYD_MAX_TASKS_PER_CHILD = 4
CELERYD_CONCURRENCY = 2
# queue related settings
CELERY_DEFAULT_QUEUE = config_file_name_to_run.CONFIG_FILE_NAME
CELERY_QUEUES = {
    config_file_name_to_run.CONFIG_FILE_NAME: {
        "binding_key": "task.#",
        "exchange": config_file_name_to_run.CONFIG_FILE_NAME,
        "routing": config_file_name_to_run.CONFIG_FILE_NAME
    }
}


PEM_KEY = env('PEM_KEY')
ENABLE_KYLO = env.bool('ENABLE_KYLO')
KYLO_UI_URL = env('KYLO_UI_URL')
KYLO_UI_AUTH_URL= env('KYLO_UI_AUTH_URL')
END_RESULTS_SHOULD_BE_PROCESSED_IN_CELERY = True
KYLO_SERVER_DETAILS = {
    "host": env('KYLO_SERVER_HOST'),
    "port" : env('KYLO_SERVER_PORT'),
    "user": env('KYLO_SERVER_USER'),
    "key_path": env('KYLO_SERVER_KEY'),
    "group_propertie_quote": "madvisor,user",
    "kylo_file_path":"/opt/kylo/"
}

CELERY_ONCE_CONFIG = {
  'backend': 'celery_once.backends.Redis',
  'settings': {
    'url': "redis://"+env('REDIS_IP')+":"+env('REDIS_PORT')+"/",
    'default_timeout': 60 * 60
  }
}

SUBMIT_JOB_THROUGH_CELERY = True
CELERY_SCRIPTS_DIR=env('CELERY_SCRIPTS_DIR')
USE_YARN_DEFAULT_QUEUE=True
USE_HTTPS=env.bool('USE_HTTPS',default=False)
