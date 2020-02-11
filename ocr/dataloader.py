######################################################################
# Get Files from AWS S3
######################################################################

import os
import random
import string
import boto3


def download_file_from_s3(**kwargs):
    """
    Description: Used for downloading s3 bucket files
    Parameteres : kwargs will return the details of s3
    """
    DIR_NAME = ''.join(random.choice(string.ascii_uppercase + string.digits) for _ in range(16))

    SFTP_DIR = '/tmp/sftp/'
    S3_DIR = '/tmp/s3/'

    DATASOURCEDIRECTORY = [S3_DIR + DIR_NAME, SFTP_DIR]

    for dir in DATASOURCEDIRECTORY:
        if not os.path.exists(dir):
            os.makedirs(dir)

    file_names = kwargs['file_names'][0]
    print('file_names', file_names)
    access_key = kwargs['access_key_id'][0]
    secret_key = kwargs['secret_key'][0]
    s3_bucket_name = kwargs['bucket_name'][0]

    # datasetname = data['new_dataset_name']

    def get_boto_session():
        return boto3.Session(aws_access_key_id=access_key, aws_secret_access_key=secret_key)

    def get_boto_resourse():
        session = get_boto_session()
        return session.resource('s3')

    def get_boto_bucket():
        resource = get_boto_resourse()
        return resource.Bucket(s3_bucket_name)


    try:
        bucket = get_boto_bucket()
        for file in eval(file_names):
            file_name_dst = str(random.randint(10000, 99999)) + '_' + file
            bucket.download_file(file, os.path.join(S3_DIR, DIR_NAME, file_name_dst))

        return {
            'status': 'SUCCESS',
            'file_path': os.path.join(S3_DIR, DIR_NAME)
        }

    except Exception as err:
        print(err)
        return {
            'status': 'FAILED',
            'Exception': str(err)
        }


def s3_files(**kwargs):

    file_name = kwargs['file_name'][0]
    access_key = kwargs['access_key_id'][0]
    secret_key = kwargs['secret_key'][0]
    s3_bucket_name = kwargs['bucket_name'][0]
    files = []

    def get_boto_session():
        return boto3.Session(aws_access_key_id=access_key, aws_secret_access_key=secret_key)

    def get_boto_resourse():
        session = get_boto_session()
        return session.resource('s3')

    def get_boto_bucket():
        resource = get_boto_resourse()
        return resource.Bucket(s3_bucket_name)

    try:
        for file in get_boto_bucket().objects.all():
            files.append(file.key)

        return {
            'status': 'SUCCESS',
            'file_list': files
        }

    except Exception as err:
        print(err)
        return {
            'status': 'FAILED',
            'Exception': str(err)
        }