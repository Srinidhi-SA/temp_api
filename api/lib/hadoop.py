import subprocess

def hadoop_put(from_path, to):
    print "Sending {} to: {}".format(from_path, to)
    subprocess.call(["hadoop", "fs", "-put", from_path, to])

def hadoop_mkdir(path):
    print "Creating directory {}".format(path)
    subprocess.call(["hadoop", "fs", "-mkdir", "-p", path])

def hadoop_ls(path='/'):
    print "Looking for {}".format(path)
    subprocess.call(["hadoop", "fs", "-ls", path])

def hadoop_hdfs_url(path=''):
    return "hdfs://localhost:9000"
