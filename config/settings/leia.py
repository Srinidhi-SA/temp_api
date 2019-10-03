from base import *
import datetime


# Database
# https://docs.djangoproject.com/en/1.11/ref/settings/#databases

DEBUG = False

ALLOWED_HOSTS = ['*']

# DATABASES = {
#     'default': {
#         'ENGINE': 'django.db.backends.sqlite3',
#         'NAME': os.path.join(BASE_DIR, 'db.sqlite3'),
#     }
# }

DATABASES = {
    'default1': {
        'ENGINE': 'django.db.backends.sqlite3',
        'NAME': os.path.join(BASE_DIR, 'db.sqlite3'),
    },
    "default": {
        'ENGINE': 'django.db.backends.mysql',
        'NAME': 'madvisor2',
        'USER': 'root',
        'PASSWORD': 'Marlabs@123',
        'HOST': '172.31.53.141',
        'PORT': '',
        }
}

MODE = 'normal'

PROJECT_APP = [
]

INSTALLED_APPS += PROJECT_APP


HADOOP_MASTER = '172.31.64.29'
"""
HADOOP_MASTER = '172.31.50.84'

YARN = {
    "host": HADOOP_MASTER,
    "port": 8088,
    "timeout": 30
}

HDFS = {

    # Give host name without http
    'host': HADOOP_MASTER,
    'port': '50070', #webhdfs port
    'uri': '/webhdfs/v1',
    'user.name': 'hduser',
    'hdfs_port': '9000', #hdfs port
    'base_path' : '/dev/dataset/'
}
"""

HADOOP_MASTER = '172.31.64.29'

YARN = {
    "host": HADOOP_MASTER,
    "port": 8088,
    "timeout": 30
}

HDFS = {

    # Give host name without http
    'host': HADOOP_MASTER,
    'port': '50070', #webhdfs port
    'uri': '/webhdfs/v1',
    'user.name': 'hduser',
    'hdfs_port': '9000', #hdfs port
    'base_path' : '/dev/dataset/'
}


EMR = {
    "emr_pem_path": "",
    "home_path": "/home/hadoop"
}

KAFKA = {
    'host': 'localhost',
    'port': '9092',
    'topic': 'my-topic'
}


JOBSERVER = {
    'host': '172.31.50.84',
    'port': '8090',
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
    "host": "madvisor2.marlabsai.com",
    "port": "80",
    "initail_domain": "/api"
}

CACHES = {
    "default": {
        "BACKEND": "django_redis.cache.RedisCache",
        "LOCATION": "redis://172.31.53.141:6379/1",
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

SCORES_SCRIPTS_FOLDER = '/home/ubuntu/mAdvisorScores/'
IMAGE_URL = "/api/get_profile_image/"

EMAIL_BACKEND = 'django.core.mail.backends.smtp.EmailBackend'
EMAIL_HOST = "smtp.office365.com"
EMAIL_PORT = 587
EMAIL_HOST_USER = "product@marlabs.com"
EMAIL_HOST_PASSWORD = "BImarlabs@123"
EMAIL_USE_TLS = ""
EMAIL_USE_SSL = ""

JOBSERVER_FROM_EMAIL = "ankush.patel@marlabs.com"
JOBSERVER_SENDTO_EMAIL_LIST = [
    'ankush.patel@marlabs.com',
    'vivekananda.tadala@marlabs.com',
    'gulshan.gaurav@marlabs.com',
    'mukesh.kumar@marlabs.com'
]
FUNNY_EMAIL_LIST = [
    'ankush.patel@marlabs.com',
    'sabretooth.rog@gmail.com'
]


JOBSERVER_EMAIL_TEMPLATE = "Please restart jobserver- IP-"

DEPLOYMENT_ENV = "prod"

HADOOP_CONF_DIR= False
HADOOP_USER_NAME="hduser"

CELERY_BROKER_URL = 'redis://172.31.53.141:6379/'
CELERY_RESULT_BACKEND = 'redis://172.31.53.141:6379/'
CELERY_ACCEPT_CONTENT = ['application/json']
CELERY_TASK_SERIALIZER = 'json'
CELERY_RESULT_SERIALIZER = 'json'
CELERY_TIMEZONE = TIME_ZONE
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

PEM_KEY = "/keyfiles/ankush.pem"
ENABLE_KYLO = False
KYLO_UI_URL = "http://data-management.marlabsai.com"


USE_YARN_DEFAULT_QUEUE=True
# USE_YARN_DEFAULT_QUEUE=False

AUTHENTICATION_BACKENDS = (
    'django.contrib.auth.backends.ModelBackend',
    'guardian.backends.ObjectPermissionBackend'
)


# SUBMIT_JOB_THROUGH_CELERY = False
SUBMIT_JOB_THROUGH_CELERY = True

CELERY_SCRIPTS_DIR="/home/hadoop/codebase/mAdvisor-api_2/scripts/"
END_RESULTS_SHOULD_BE_PROCESSED_IN_CELERY = True

CELERY_ONCE_CONFIG = {
  'backend': 'celery_once.backends.Redis',
  'settings': {
    'url': 'redis://172.31.53.141:6379/',
    'default_timeout': 60 * 60
  }
}

KYLO_SERVER_DETAILS = {
    "host": "34.200.233.5",
    "port" : 8088,
    "user": "ankush",
    "key_path": "~/.ssh/ankush.pem",
    "group_propertie_quote": "madvisor,user",
    "kylo_file_path":"/opt/kylo/"
}

# if DEBUG == False:
#     from logger_config import *
#     server_log = BASE_DIR + '/server_log'
#     if os.path.exists(server_log):
#         pass
#     else:
#         os.mkdir(server_log)
# else:
#     pass
###################  OUTLOOK EMAIL CONFIG  ##########
OUTLOOK_DETAILS = {
    "client_id": '2e36be5f-0040-4f0d-bbef-12787ddc158b',
    "client_secret": '=Ogz4[AHfGM[eBX.f1wtdkakrzTPht85',
    #"authority":'https://login.microsoftonline.com',
    #"authorize_url" : 'https://login.microsoftonline.com/common/oauth2/v2.0/authorize',
    "tenant_id" : 'cc6b2eea-c864-4839-85f5-94736facc3be',
    "redirect_uri" : 'http://localhost:8000/get_request/'
}
OUTLOOK_SCOPES = [ 'openid',
           'User.Read',
           'Mail.Read',
           'offline_access']


OUTLOOK_AUTH_CODE =  '''OAQABAAIAAACQN9QBRU3jT6bcBQLZNUj73VtUUkVft_y8E3LBiK5eHMgCAKSe2DofhiCUf_WNN-a_l1cbKsyOBMw9JLKR0dl7olaPOw7331ZLCyfHnQpqZdpxHb8sTqubDX9P-0bISqCH7Ytp-kujV1M7ZEoB689Vvw1dR9hJRpRpMkKoXdOTivVbIp1e3vjLt5gRf_mnJ9-azGdRGmSjscq8-13gwS_WA35S9NTikCjxnIft8FrlkVwvBzRknSxzdtLWVwQfhQ3C0CjRa3PCijwSUwuTyy2cyq2aBdUv50xJN3pPKqh3_kYSmrNjGnp1dbg1xl-63uLW9j2Qv3R6pI2KcutxbBIbZAlk95ptRA2hICepkkLZiXca93B0MiCPRr2L2HL5S9ZK0IbL9wZi4CiOTL3_jXSqpK72VmXIO6scrOYFyz-8vdxTF-5eIO4pvtE0FeHbeX5s7c-EhrVAtrrG7N9Ccs5DyA1Zv8DkP3mjl72NLmgEJc9GxRMKrtNr2yLaGPg8sQ1_H-2Fe8L0unmTYMQ9ln_JGA3mMmBz9VqWB7XGKcZuOBzUi-G0WxehMD7o5oP9oGagsbZ9ZEJUHY3r-V2QPdpyq4M9CEY79O8UgWLcZ5kiTg7RJzsUS3jvZL38mWFzYvUG-gn3vi9Lv9w9xrkxXWEKO5jokN8hVYXUpKkCQIPWNUuIjF_iZbUq1cmaw7mNvzDvBiAi3ilnFRj_MIe7Q9D474ZcDP9pj8IBFkdCR-sA74SbN8nMAKmvkIwpABbpAgfQoqYtGeEDwietHjLCuipuRogqW2RApJ3HWw7UdK3KP8pr1iOapnRfPsX0XRRNqW31B6KCcljLPBrcNwsjnatIS42scxy9NQTNhXvFfMmvuv_fIQUmzcPkCBbyBDTZEPIgAA'''

OUTLOOK_REFRESH_TOKEN='''OAQABAAAAAACQN9QBRU3jT6bcBQLZNUj7Iwl5V8AGkybAwtdu9572_B0HHMxUiJIqK33bUTwj7rcjkKfpQecDWXovafEKiZNRdBxKMpeSUHFVGI95UetISlWDrZzRVjKPQV46SlqoFIrNn-H9BVno8ucMgGz16_v2hz86VgsvZ0E30BtaFU0GQBEiM0eQB-A7vSJ0Hah05v7Fil4SRXdN5CLMGCge3cec6Fptg446cKf544V6ErKJgHdxGQjnmvM_eCMi4uLBpFWHNwqdgYo-Ctn0uxb0GxcLo1JlmiiWk0WMP2YQxnzvC2A3jg34kwEdWSOiSKaXl-2rmszsIH0iPcvavaJ1JzmwhqSJjfr1pMr_np6TxV0r-A1fn7_e6FBrQOhXQTGBhc5FYSiPan-J-LO2B-LN5-wMXQSMJBIcpr1LvZvFY2L06WcdcDq_PuA6C_qsVhARc9sEA5BXtN_jF0-k-s3QqQs82OejW1NcjmrQWV-8GvKAwqcrANC6W0Dp1h6moZOvoezUdCVFqbRcUaDE05taKYKkhdmfHtRWMx0tAw2eQzDjSPoQXxhX_0QClfEdCaj-RVPh8SPTs8rBO8QHSv4ybnsTo1Qnu2dy_saAChth2ccuv93xEUuNIpB6ETrem0tuyclZCG_A7_-9N14214OkLWGnUzwqwADTxEdZZg2qgPNat0lg8n4bVAhz-wBl9H36lkRoxlxHh4AODvtAYZ6QmsImahRku_R6oEu90U-RSUNyuuq9DP4-dIjye1d6TNlPEQpDyTR5iTW1bgPUO-Io_BNcEw6PMgR2_uyU3GMIQ8KPJUWI-pFBWL8CwkIlZa3ixViY2kFzejJe1UvRlpDGzWRXqBJ7v7q39HvYHIPQpFZIXSAA'''
