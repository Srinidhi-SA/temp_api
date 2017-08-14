from base import *
import datetime


# Database
# https://docs.djangoproject.com/en/1.11/ref/settings/#databases

DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.sqlite3',
        'NAME': os.path.join(BASE_DIR, 'db.sqlite3'),
    }
}

PROJECT_APP = [
]

INSTALLED_APPS += PROJECT_APP


STATIC_URL = '/static/'
STATICFILES_DIRS = [
    os.path.join(BASE_DIR, 'static'),
]
print os.path.join(
    os.path.dirname(os.path.dirname(os.path.abspath(__file__))),
    'api/static')

HDFS = {

    # Give host name without http
    'host': 'localhost',
    'port': '50070', #webhdfs port
    'uri': '/webhdfs/v1',
    'user.name': 'marlabs',
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
    'host': 'localhost',
    'port': '8090',
    'app-name': 'test_api_1',
    'context': 'pysql-context',
    'master': 'bi.sparkjobs.JobScript',
    'metadata': 'bi.sparkjobs.JobScript',
    'filter': 'bi.sparkjobs.filter.JobScript',

}

ALLOWED_HOSTS = ['*']
