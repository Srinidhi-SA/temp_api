"""
Usage
        fab <function_name>:[arg,arg1=val1]
        e.g. fab deploy_api:branch=dev
        e.g. fab deploy_api:branch=leia
        e.g. fab deploy_api:branch=luke

        e.g. fab deploy_react:branch=dev
        e.g. fab deploy_react:branch=leia
        e.g. fab deploy_react:branch=luke

        e.g. fab deploy_api_and_migrate:branch=dev
        e.g. fab deploy_api_and_migrate:branch=leia
        e.g. fab deploy_api_and_migrate:branch=luke

List
        fab -list
"""

from fabric.api import *
import os
from fabric.contrib import files
import fabric_gunicorn as gunicorn
# from django.conf import settings

BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))

def set_fabric_env(configuration_detail=None):
    """Set dev environemnt"""

    if configuration_detail is None:
        return -1
    server_details = configuration_detail['server_details']
    path_details = configuration_detail['path_details']
    type = configuration_detail['type']
    gunicorn_details = configuration_detail['gunicorn_details']

    key_file = BASE_DIR + server_details['pem_detail']


    env.key_filename=[key_file]
    env.host_string="{0}@{1}".format(server_details.get('username'), server_details.get('host'))
    env.gunicorn_wsgi_app = gunicorn_details['gunicorn_wsgi_app']
    env.gunicorn_pidpath = path_details["base_remote_path"] + gunicorn_details['gunicorn_pidpath']
    env.gunicorn_bind = gunicorn_details['gunicorn_bind']
    env["server_details"] = server_details
    env["path_details"] = path_details

    return {'server_details': server_details, 'path_details': path_details, 'type': type}


def get_branch_details(branch=None):
    configuration_detail = configuration_details()
    print configuration_detail.keys()
    return configuration_detail[branch]


@task
def deploy_react(branch="dev"):
    """
    Default deploy to development. Other options are production
    """
    details = get_branch_details(branch)
    set_fabric_env(details)
    print details
    path_details= details['path_details']
    server_details= details['server_details']
    k = details['type']
    npm_install_and_deploy(
        server_details=server_details,
        path_details=path_details,
        type=k
    )
    change_config_file(branch=branch)


@task
def deploy_api(branch="dev"):
    """
    Default deploy to development
    :param type:
    :return:
    """
    details = get_branch_details(branch)
    set_fabric_env(details)
    print details
    path_details= details['path_details']
    server_details= details['server_details']

    only_for_api_push_and_pull(
        server_details=server_details,
        path_details=path_details
    )
    gunicorn.reload()

@task
def change_config_file(branch='dev'):
    import random
    details = get_branch_details(branch)
    set_fabric_env(details)
    print details
    path_details= details['path_details']
    server_details= details['server_details']
    deployment_config= details['deployment_config']
    base_remote_path = path_details['base_remote_path']
    text_command = """CONFIG_FILE_NAME = '{0}'\nUI_VERSION = '{1}'
    """.format(deployment_config, random.randint(100000,10000000))
    config_file_path = BASE_DIR + '/config/settings/config_file_name_to_run.py'
    react_env = BASE_DIR + '/static/react/src/app/helpers/env.js'
    react_npm_log = BASE_DIR + '/static/react/npm-debug.log'


    with cd(BASE_DIR):
        # local('git add {0}'.format(config_file_path))
        local('git checkout {0}'.format(react_env))
        local('git checkout {0}'.format(react_npm_log))
        local('git commit -m "version changed"')

    only_for_api_push_and_pull(
        server_details=server_details,
        path_details=path_details
    )

    local('rm {0}'.format(config_file_path))
    local('echo "{0}" > {1}'.format(text_command, config_file_path))
    put(
        local_path=config_file_path,
        remote_path=base_remote_path + '/config/settings/'
    )
    local('rm {0}'.format(config_file_path))
    gunicorn.reload()


@task
def deploy_api_and_migrate(branch="dev"):
    """
    Default deploy to development
    :param type:
    :return:
    """

    details = get_branch_details(branch)
    set_fabric_env(details)
    print details
    path_details= details['path_details']
    server_details= details['server_details']

    only_for_api_push_and_pull(
        server_details=server_details,
        path_details=path_details
    )
    pip_install_and_deploy_remote(
        base_remote_path=path_details['base_remote_path']
    )
    gunicorn.reload()




def deploy_ml(branch="development"):
    pass

@task
def copy_egg_from_emr_to_api_dev():

    command_to_copy = "scp emr_dev:/home/hadoop/codebase/mAdvisor-MLScripts/dist/marlabs_bi_jobs-0.0.0-py2.7.egg ."
    command_to_paste = "scp marlabs_bi_jobs-0.0.0-py2.7.egg development_api:/home/ubuntu/codebase/mAdvisor-api/scripts/"
    local(command_to_copy)
    local(command_to_paste)


def remote_uname():
    run('uname -a')


def do_npm_install(react_path):
    with lcd(BASE_DIR + react_path):
        local("rm -rf dist")
        local("npm install")


def do_npm_run(branch, react_path):
    with lcd(BASE_DIR + react_path):
        if "development" == branch:
            local("npm run buildDev")
        elif "production" == branch:
            local("npm run buildProd")
        elif "local" == branch:
            local("npm run buildLinux")
        elif "luke" == branch:
            local("npm run buildLuke")
        elif "leia" == branch:
            local("npm run buildLeia")

def deploy_dist_to_destination(base_remote_path, react_path):
    import random
    with cd(base_remote_path + react_path):
        run("cp -r dist dist_{0}".format(random.randint(10,100)))

    put(
        local_path = BASE_DIR + react_path + "/dist",
        remote_path = base_remote_path + react_path
    )


def npm_install_and_deploy(server_details, path_details, type="development"):
    do_npm_install(path_details['react_path'])
    do_npm_run(
        branch=type,
        react_path=path_details['react_path']
    )

    print path_details['base_remote_path'], path_details['react_path']
    deploy_dist_to_destination(
        base_remote_path=path_details['base_remote_path'],
        react_path=path_details['react_path']
    )


def pip_install_and_deploy_remote(base_remote_path):
    with cd(base_remote_path):
        # sudo('pip install -r requirements.txt')
        run('python manage.py migrate')
        sudo('apt-get install python-matplotlib')


def pull_ui_and_merge_to_api():
    is_done = False

    try:
        with lcd(BASE_DIR):
            capture = local("git status", capture=True)
            print capture
            if "Changes not staged for commit" in capture:
                abort("Unstaged changes. Please commit or stash.")
                # local("git stash")

            local("git checkout {0}".format(api_branch))
            capture = local("git merge --ff origin/{0} -m 'Merging {1} into {2}'".format(
                ui_branch,
                ui_branch,
                api_branch
            ), capture=True)

            if 'conflict' in capture:
                abort('Resolve Conflicts')

            push_api_to_remote()
            is_done = True
    except Exception as err:
        print err

    if is_done:
        pull_api_at_remote()
    else:
        print "Keep Calm. Wait. Take a Breath. Remember Absurdism."


def push_api_to_remote(api_branch):

    try:
        with lcd(BASE_DIR):

            capture = local("git status", capture=True)
            print capture
            if "Changes not staged for commit" in capture:
                abort("Unstaged changes. Please commit or stash.")
                local("git stash")

            local("git checkout {0}".format(api_branch))

            capture = local("git push origin {0}".format(api_branch))
            print capture
    except Exception as err:
        print err

    finally:
        print "finally loop."


def pull_api_at_remote(base_remote_path, api_branch):
    try:
        with cd(base_remote_path):
            capture = run("git status")
            print capture
            if "Changes not staged for commit" in capture:
                # abort("Unstaged changes. Please commit or stash.")
                run("git stash")

            run("git checkout {0}".format(api_branch))
            run("git pull origin {0}".format(api_branch))
            # run("git stash apply")

            sudo("pip install -r requirements.txt")

    except Exception as err:
        print err

    finally:
        print "finally loop."


def only_for_api_push_and_pull(server_details, path_details):
    push_api_to_remote(path_details['api_branch'])
    pull_api_at_remote(
        path_details['base_remote_path'],
        path_details['api_branch']
    )


def apt_get(*packages):
    sudo('apt-get -y --no-upgrade install %s' % ' '.join(packages), shell=False)

def install_mysql():
    with settings(hide('warnings', 'stderr'), warn_only=True):
        result = sudo('dpkg-query --show mysql-server')
    if result.failed is False:
        warn('MySQL is already installed')
        return
    mysql_password = prompt('Please enter MySQL root password:')
    sudo('echo "mysql-server-5.0 mysql-server/root_password password ' \
                              '%s" | debconf-set-selections' % mysql_password)
    sudo('echo "mysql-server-5.0 mysql-server/root_password_again password ' \
                              '%s" | debconf-set-selections' % mysql_password)
    apt_get('mysql-server')


def save_db_copy(branch="local"):
    pass

def get_remote_db(branch="development"):
    pass

@task
def uptime():
    res = run('cat /proc/uptime')

@task
def remember_git_cache_local_and_remote(type="development"):
    """
    remember git password.
    """
    if type == "development":
        dev()
    elif type == "production":
        prod()

    local("git config --global credential.helper cache")
    local("git config --global credential.helper 'cache --timeout=360000'")
    run("git config --global credential.helper cache")
    run("git config --global credential.helper 'cache --timeout=360000'")

@task
def cleanup_static_react_old_dist(type="development"):
    """
    cleaup dist_files from static_react
    """
    if type == "development":
        dev()
    elif type == "production":
        prod()

    server_details = env.get('server_details')
    path_details = env.get('path_details')
    base_remote_path = path_details.get('base_remote_path')
    react_path = path_details.get('react_path')

    with cd(base_remote_path + react_path):
        run('mv dist_* ~/old_dist')


def create_database(type="development"):
    if type == "development":
        dev()
    elif type == "production":
        prod()

    server_details = env.get('server_details')
    path_details = env.get('path_details')

    db_name = "madvisor"
    user_name = "marlabs"
    host= "localhost"
    passowrd = "Password@123"

    # CREATE DATABASE myproject CHARACTER SET UTF8;
    run("CREATE DATABASE {0} CHARACTER SET UTF8;".format(db_name))

    # CREATE USER marlabs@localhost IDENTIFIED BY 'Password@123';
    run("CREATE USER {0}@{1} IDENTIFIED BY '{2}';".format(user_name, host, passowrd))

    # GRANT ALL PRIVILEGES ON madvisor.* TO marlabs@localhost;
    run("GRANT ALL PRIVILEGES ON {0}.* TO {1}@{2};".format(db_name, user_name, host))

@task
def download_sql_and_dump(type='development'):

    if type == "development":
        dev()
    elif type == "production":
        prod()

    server_details = env.get('server_details')
    path_details = env.get('path_details')

    base_remote_path = path_details.get('base_remote_path')
    with cd(base_remote_path):
        run("python manage.py dumpdata -e contenttypes -e auth.Permission > datadump.json")
        path_json = base_remote_path + "/" + "datadump.json"
        get(path_json, "/home/ankush/codebase/code_revamp/madvisor_api/")

    local("cat 'Done.'")


def recreate_database(type='local'):


    db_name = "madvisor"
    user_name = "marlabs"
    host= "localhost"
    passowrd = "Password@123"

def move_css_from_react_css_to_static_assets_css(type='development'):

    if type == "development":
        dev()
    elif type == "production":
        prod()

    server_details = env.get('server_details')
    path_details = env.get('path_details')

    react_path = path_details['react_path']
    style_css = react_path + "/src/assets/css/style.css"
    asset_path = path_details['asset_path']
    asset_css = asset_path + "/css"
    run("mv {0} {1}".format(style_css, asset_css))

# api_ui_dev

@task
def restart_jobserver(branch="development"):

    key_file = BASE_DIR + "/config/keyfiles/TIAA.pem"

    if "development" == branch:
        username = 'hadoop'
        host = '34.205.203.38'
        port = '8090'
    else:
        username = 'hadoop'
        host = '174.129.163.0'
        port = '8090'
    env.key_filename=[key_file]
    env.host_string="{0}@{1}".format(username, host)

    server_start_process_id = sudo("netstat -nlp |grep 8090| awk  '{print $7}' |cut -f1 -d'/'")
    print server_start_process_id, type(server_start_process_id), str(server_start_process_id),

    capture = run('/tmp/job-server/server_stop.sh')

    if files.exists('/tmp/job-server/spark-jobserver.pid'):
        run("rm /tmp/job-server/spark-jobserver.pid")
    import time
    time.sleep(10)
    if "Job server not running" in capture:
        if str(server_start_process_id) == "" :
            pass
        else:
            print "killing server_start_process_id"
            print "command to kill"
            print "-------"
            print "kill -9 {0}".format(server_start_process_id)
            print "-------"
            kill_capture = sudo("kill -9 {0}".format(server_start_process_id))


    output=sudo('cd /tmp/job-server && /bin/bash server_start.sh', pty=False)

    time.sleep(5)

    run('''curl -X POST "{0}:{1}/contexts/{2}?context-factory=spark.jobserver.python.PythonSQLContextFactory"
            '''.format(
        host,
        port
        , 'pysql-context'
    )
    )


def configuration_details():


    configuration_detail = {
        'luke': {
            'server_details': {
                "known name": "luke.marlabsai.com",
                "username": "ubuntu",
                "host": "34.196.22.246",
                "port": "9012",
                "initail_domain": "/api",
                'pem_detail': "/config/keyfiles/TIAA.pem"
            },
            'path_details': {
                "react_path": "/static/react",
                "asset_path": "/static/asset",
                "base_remote_path": "/home/ubuntu/codebase/mAdvisor-api_luke",
                "ui_branch": "api_ui_dev",
                "api_branch": "api_ui_dev"
            },
            'type': 'luke',
            'gunicorn_details': {
                'gunicorn_wsgi_app': 'config.wsgi:application',
                'gunicorn_pidpath': "/gunicorn.pid",
                'gunicorn_bind': "0.0.0.0:9012"
            },
            'deployment_config': 'luke'
        },

        'dev': {
            'server_details': {
                "known name": "madvisordev.marlabsai.com",
                "username": "ubuntu",
                "host": "34.196.204.54",
                "port": "9012",
                "initail_domain": "/api",
                'pem_detail': "/config/keyfiles/TIAA.pem"
            },
            'path_details': {
                "react_path": "/static/react",
                "asset_path": "/static/asset",
                "base_remote_path": "/home/ubuntu/codebase/mAdvisor-api",
                "ui_branch": "api_ui_dev",
                "api_branch": "api_ui_dev"
            },
            'type':'development',
            'gunicorn_details': {
                'gunicorn_wsgi_app': 'config.wsgi:application',
                'gunicorn_pidpath': "/gunicorn.pid",
                'gunicorn_bind': "0.0.0.0:9012"
            },
            'deployment_config': 'development'
        },
        'leia': {
            'server_details': {
                "known name": "leia.marlabsai.com",
                "username": "ubuntu",
                "host": "34.196.22.246",
                "port": "9015",
                "initail_domain": "/api",
                'pem_detail': "/config/keyfiles/TIAA.pem"
            },
            'path_details': {
                "react_path": "/static/react",
                "asset_path": "/static/asset",
                "base_remote_path": "/home/ubuntu/9013/mAdvisor-api",
                "ui_branch": "api_ui_dev",
                "api_branch": "api_ui_dev"
            },
            'type':'leia',
            'gunicorn_details': {
                'gunicorn_wsgi_app': 'config.wsgi:application',
                'gunicorn_pidpath': "/gunicorn.pid",
                'gunicorn_bind': "0.0.0.0:9015"
            },
            'deployment_config': 'leia'
        }
    }

    return configuration_detail









