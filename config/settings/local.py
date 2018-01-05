from base import *
import datetime


# Database
# https://docs.djangoproject.com/en/1.11/ref/settings/#databases

DEBUG = True

ALLOWED_HOSTS = ['*', '192.168.18.80', '127.0.0.1', 'localhost']

# DATABASES = {
#     'default': {
#         'ENGINE': 'django.db.backends.sqlite3',
#         'NAME': os.path.join(BASE_DIR, 'db.sqlite3'),
#     }
# }

DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.mysql',
        'NAME': 'madvisor',
        # 'USER': 'marlabs',
        # 'PASSWORD': 'Password@123',
        'USER': 'root',
        'PASSWORD': 'root',
        'HOST': 'localhost',
        'PORT': '',
    }
}

PROJECT_APP = [
    # 'silk',
    # 'django_extensions'
    # 'django_celery_beat',
    # 'django_celery_results'
]

INSTALLED_APPS += PROJECT_APP

LOCAL_MIDDLEWARE = [
    # 'django_cprofile_middleware.middleware.ProfilerMiddleware',
    # 'silk.middleware.SilkyMiddleware'
]

CELERY_BROKER_URL = 'redis://localhost:6379'
CELERY_RESULT_BACKEND = 'redis://localhost:6379'
CELERY_ACCEPT_CONTENT = ['application/json']
CELERY_TASK_SERIALIZER = 'json'
CELERY_RESULT_SERIALIZER = 'json'
CELERY_TIMEZONE = TIME_ZONE

MIDDLEWARE += LOCAL_MIDDLEWARE

HADOOP_MASTER = "ec2-34-205-203-38.compute-1.amazonaws.com"

YARN = {
    "host": HADOOP_MASTER,
    "port" : 8088,
    "timeout" : 30
}
HDFS = {

    # Give host name without http
    'host': HADOOP_MASTER,
    'port': '14000', #webhdfs port
    'uri': '/webhdfs/v1',
    'user.name': 'hadoop',
    'hdfs_port': '8020', #hdfs port
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
    'host': 'ec2-34-205-203-38.compute-1.amazonaws.com',
    'port': '8090',
    'app-name': 'product_revamp',
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
    "host": "34.196.204.54",
    "port": "9012",
    "initail_domain": "/api"
}

CACHES = {
    "default": {
        "BACKEND": "django_redis.cache.RedisCache",
        "LOCATION": "redis://127.0.0.1:6379/1",
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

mAdvisorScores = '/home/hadoop/mAdvisorScores/'
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