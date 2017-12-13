from base import *
import datetime


# Database
# https://docs.djangoproject.com/en/1.11/ref/settings/#databases

DEBUG = True

ALLOWED_HOSTS = ['*']

DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.sqlite3',
        'NAME': os.path.join(BASE_DIR, 'db.sqlite3'),
    }
}

PROJECT_APP = [
]

INSTALLED_APPS += PROJECT_APP

HADOOP_MASTER = "ec2-34-205-203-38.compute-1.amazonaws.com",

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

}

# dev api http://34.196.204.54:9092
THIS_SERVER_DETAILS = {
    "host": "34.196.204.54",
    "port": "9012",
    "initail_domain": "/api"
}


APPEND_SLASH=False
DATA_UPLOAD_MAX_MEMORY_SIZE = 1024*1024*1024

mAdvisorScores = '/home/hadoop/mAdvisorScores/'
