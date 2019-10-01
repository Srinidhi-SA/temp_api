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


OUTLOOK_AUTH_CODE = '''OAQABAAIAAAAP0wLlqdLVToOpA4kwzSnxuMzf06ukB8YGHgrrB6P0sZv7ioiNkujbogCt9xlu8oncpxnGdqY_Ul5zyZBSLu5hr_t4VASe3z1ARXCz4APz2kooiwluohGk4LyHwSR2BqasKR-4g3glmOMZLFmFwkrfA3HPBKecmrcglPjDMKkOThTDoD4_z0p1wOXXFT25MqNNWUp7dDQIQMyDKMGFOOnFEGr2aYGYSGr83OqbvG2nwnGT7M9snWUfoFnJHo7m2eakDt9wJkFZ_BnLgPmsWqMw49IalaWhLkYxgehGZfPPv0cjM7wbGmsiMFbATKkalad39Pjl1TOlKuqPjSSRJGrDHKBAD5x0FDLxJh6BMgpZcVqUAoAfIzOf5Lo0q1TkV-roJsyIkLMURG2F2U8iGC25h9t43OPVL75NxFeIkJrG2EWHR9Tw1Ati9YafdeLzjsqv0o3RUv-ZA6t_OXebyTj5boK94pkXdNg8tiLpUummEzk1T3ab7Zvr3jf2Awo9jYKocJ3IdNQg4T4GEcjtoj6h5kgqfM7gYLuRD0XAS19lY_AvU4dH9gjvxppJn4H50xYpFRN85hBgwARzDGBXSIlVdpuyVTKqT3uzVPr3SMsV_0GyBJdLzOH1Hu0VAWnekWVg_Z2m7hYcS1U-6NY2aXov8e1xfAnhhGcRErJV4YgeZZ6kQBp190BkJ1XamA-TpBsuTmO37B3Xn3-ApcJqXFMCgE9F7m5lWluag3WXQL46vjgqZjTM7F-eMi5Ae04WEtvWa6JNDYVTyjg9mBmIb_ib87ir0QjQDWcgXfF8D5eYNWMMTq0K1E_eWiaWeclekDcSiyk5ZoG0ndXB4c4li7Nj7-fBb9VXdLUTiC9XYKnB4PmlpY1IAvmZ4H-aAob9YT4gAA'''

OUTLOOK_REFRESH_TOKEN = '''OAQABAAAAAAAP0wLlqdLVToOpA4kwzSnxXKOZKksakC-oYbcSU8oVfMuIPIsAInN0EJ1ZPP-tUD27lnHiuAjyoIkIbnJ5_wEKPJsJvuCO3IZjkXLVBUgk6b9EwYeV50H9qmo99Qw8a8iYN0g8YWfE03d3EPeJAZX9j32qW5Svdvs6rZI-8CmzPDSAJ6mGhOnJviFn9fQRmz8tZ3YwfHmvGWBEtZZadfQzqTnoKnmrKN_23sONNKtNq6HQK7npX9MhpHJ0HV_s-MIUeg-KLavIcHrpqPm6wxbhwn04uQcpSvDmqTbPaH-8LUWksGm12YYJA5KBK8TYrtmNV8FWnHzLe-hw6_k6Dy62A6ghwtbkgbAptqCmXGAY_gHEHocu4bGMMTED9lpm9Kt3uSvL_kiLmC4UX1FkjlqMUAQihyiHsv43dJ9glC8WazvaWso5DE2oLqTjC1-AIBNHRhDF8bdFeDZxRt_n-oLVzt_O-rBLJOBKMSp5tqfNKEMnhmynYRSTd18LPKT3Lty0WJm_SPd0YFSLLeDT0L27MBZFdJPjUY3uYSFOkQvQKCWMh-Lyg0-F735sSQO2o4nUjlCMCAoRHVaSIE_wSix0BQDddrC9E5e9rFpeLOcKV_jb3H52UX1eUoeHrStlFRXX7kZsr6SovnFprwLGOLIq26vXZmqbNXV6qGHkcHVn_ZgsM6tVjMIckALsICSB5MoHsZCbIYIL2jdGVOI4IKVVnfq_lX79WcVG92k9S0A76kEx36YxbmoqnbmTJd7Ta4MuPQzehKciibCdhxDnyG_qb6sLRGi901m8i4UrRMGDyly5D0B-jYfb04zHx6xo2o7kMg6TqCgBWogJXTQySCwUqB9U1kFQAgOzwABwRRU30SAA'''
