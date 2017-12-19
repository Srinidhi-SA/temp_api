from knit import YARNAPI
from django.conf import settings

yap = YARNAPI(
    rm = settings.YARN.get("host"),
    rm_port = settings.YARN.get("port")
)


def get_detailed_application_info(app_id=None):

    if None == app_id:
        return -1

    return yap.apps_info(app_id=app_id)


def get_brief_application_info(app_id=None):

    if None == app_id:
        return -1

    things_to_keep = [
        u'elapsedTime',
        u'finalStatus',
        u'finishedTime',
        u'memorySeconds',
        u'progress',
        u'queue',
        u'startedTime',
        u'state',
        u'trackingUI',
        u'trackingUrl'
    ]

    new_dict = {}
    old_info = yap.apps_info(app_id=app_id)

    for item in things_to_keep:
        new_dict[item] = old_info[item]

    return new_dict


def kill_application(app_id=None):

    if None == app_id:
        return -1

    kill_status = yap.kill(app_id=app_id)

    if kill_status is True:
        print("Killed Application.")
    else:
        print("Failed to kill.")


def start_yarn_application_again(app_id=None):

    if None == app_id:
        return -1
