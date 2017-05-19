from fabric.api import *
from fabric.contrib import files
from django.conf import settings

HDFS = settings.HDFS
BASEDIR = settings.BASE_DIR

emr_file = BASEDIR + "/api/lib/TIAA.pem"

env.key_filename=[emr_file]
env.host_string="{0}@{1}".format(HDFS["user.name"], HDFS["host"])

model_names = [
    "RandomForest",
    "XGBoost",
    "LogisticRegression"
]

map_model_name_with_folder = {
    "Random Forest": "RandomForest",
    "XGBoost":"XGBoost",
    "Xgboost":"XGBoost",
    "Logistic Regression":"LogisticRegression",
    "Logistic": "LogisticRegression"

}

inner_folders = [
    "TrainedModels",
    "ModelSummary"
]

score_folders = [
    "ScoredData",
    "Summary"
]


def remote_uname():
    run('uname -a')


def create_base_model_and_score_folder():
    path = "/home/hadoop"
    run('mkdir -p {0}/{1}'.format(path,'models'))
    run('mkdir -p {0}/{1}'.format(path,'scores'))


def create_model_instance_extended_folder(id):
    path = "/home/hadoop/models/{0}".format(str(id))

    for m_n in model_names:
        for i_f in inner_folders:
            run('mkdir -p {0}/{1}/{2}'.format(path,m_n,i_f))


def create_score_extended_folder(id):
    path = "/home/hadoop/scores/{0}".format(str(id))

    for s_f in score_folders:
        run('mkdir -p {0}/{1}'.format(path, s_f))


def mkdir_remote(dir_paths):
    """
    creates folder on remote desktop
    :param dir_path: string or list of path at remote
    :return: None
    """

    if isinstance(dir_paths, str):
        run("mkdir -p {0}".format(dir_paths))
    elif isinstance(dir_paths, list) or isinstance(dir_paths, tuple):
        for dir_path in dir_paths:
            run("mkdir -p {0}".format(dir_path))


def read_remote(dir_paths):

    a = {}

    try:
        if files.exists(dir_paths):
            a = run('cat {0}'.format(dir_paths))
        else:
            a = ""
    except Exception as e:
        a = ""

    return str(a)

