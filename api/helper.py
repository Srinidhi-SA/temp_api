
from django.conf import settings
JOBSERVER = settings.JOBSERVER


class JobserverDetails(object):

    @classmethod
    def get_jobserver_url(cls):
        return "http://" + JOBSERVER.get('HOST') + ":" + JOBSERVER.get('PORT')

    @classmethod
    def get_app(cls):
        return JOBSERVER.get('app-name')

    @classmethod
    def get_context(cls):
        return JOBSERVER.get('context')

    @classmethod
    def get_class_path(cls, name):
        if name not in JOBSERVER:
            raise Exception('No such class.')
        return JOBSERVER.get(name)

    @classmethod
    def print_job_details(cls, job):
        job_url = "{0}/{2}".format(cls.get_jobserver_url(), job.jobId)
        print "job_url: {0}".format(job_url)