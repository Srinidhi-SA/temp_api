"""
Strictly for madvisordev.marlabsai.com
screen: p_9012

usage: go to scripts folder
fab <function_name>

or just use
fab -list
"""

from fabric.api import *
import os
from fabric.contrib import files
# from django.conf import settings

BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))

def dev():
    """Set dev related variables"""
    server_details = {
        "known name": "madvisordev.marlabsai.com",
        "username": "ubuntu",
        "host": "34.196.204.54",
        "port": "9012",
        "initail_domain": "/api"
    }

    path_details = {
        "react_path" : "/static/react",
        "asset_path" : "/static/asset",
        "base_remote_path" : "/home/ubuntu/codebase/mAdvisor-api",
        "ui_branch" : "react-ui-development",
        "api_branch" : "trainer/vivek_product_revamp"
    }

    key_file = BASE_DIR + "/config/keyfiles/TIAA.pem"
    env.key_filename=[key_file]    
    env.host_string="{0}@{1}".format(server_details.get('username'), server_details.get('host'))

    return {'server_details': server_details, 'path_details': path_details}


    
def prod():
    """Set dev related variables"""
    server_details = {
        "known name": "madvisordev.marlabsai.com",
        "username": "ubuntu",
        "host": "34.196.204.54",
        "port": "9012",
        "initail_domain": "/api"
    }

    path_details = {
        "react_path": "/static/react",
        "asset_path": "/static/asset",
        "base_remote_path": "/home/ubuntu/codebase/mAdvisor-api",
        "ui_branch": "react-ui-development",
        "api_branch": "trainer/vivek_product_revamp"
    }

    key_file = BASE_DIR + "/config/keyfiles/TIAA.pem"
    env.key_filename = [key_file]
    env.host_string = "{0}@{1}".format(server_details.get('username'), server_details.get('host'))

    return {'server_details':server_details, 'path_details':path_details}

BRANCH_FUNCTION_MAPPING = {
    'development': dev(),
    'dev': dev(),
    'production': prod(),
    'prod': prod(),
    'trainer/vivek_product_revamp': dev()
}
    

def deploy_react(branch="development"):
    pass

def deploy_api(type="development"):

    details = BRANCH_FUNCTION_MAPPING[type]
    path_details= details['path_details']
    server_details= details['server_details']

    only_for_api_push_and_pull(
        server_details=server_details,
        path_details=path_details
    )


def deploy_ml(branch="development"):
    pass

def restart_gunicorn():
    pass


def remote_uname():
    run('uname -a')

def do_npm():
    with lcd(BASE_DIR + react_path):
        local("rm -rf dist")
        local("npm install")
        local("npm run buildDev")


def deploy_dist_to_destination():
    import random
    with cd(base_remote_path + react_path):
        run("cp -r dist dist_{0}".format(random.randint(10,100)))

    put(
        local_path = BASE_DIR + react_path + "/dist",
        remote_path = base_remote_path + react_path
    )


def npm_install_and_deploy_local():
    do_npm()
    deploy_dist_to_destination()


def pip_install_and_deploy_remote():
    with cd(base_remote_path):
        sudo('pip install -r requirements.txt')
        run('python manage.py migrate')


def final_everything():
    pull_ui_and_merge_to_api()
    npm_install_and_deploy_local()
    pip_install_and_deploy_remote()


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
                # local("git stash")

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

    except Exception as err:
        print err

    finally:
        print "finally loop."

def only_for_api_push_and_pull(server_details, path_details):
    push_api_to_remote(
        path_details['api_branch']
    )
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
