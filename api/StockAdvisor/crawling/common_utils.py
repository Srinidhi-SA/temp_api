import hashlib
import simplejson as json
import os


def get_sha(key):
    return hashlib.sha1(key).hexdigest()

def get_regex(regex_file):
    file_path = os.path.dirname(__file__) + "/" + regex_file
    regex_dict = {}
    try:
        # content=open(regex_file).read()
        content = open(file_path).read()
        regex_dict = get_json_obj(content)
    except Exception, e:
        print "Exception occoured while processing regex file : ", regex_file
        print e
    return regex_dict


def get_json_obj(content):
    json_obj = {}
    try:
        json_obj = json.loads(content.strip())
    except Exception, e:
        print "Exception occoured while processing regex file : ", content
        print e
    return json_obj

