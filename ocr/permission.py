from rest_framework import permissions


def get_permissions(user, model, type='retrieve'):
    if model == 'ocrimage':
        if type == 'retrieve':
            return {
                'view_ocrimage': user.has_perm('ocr.view_ocrimage'),
                'rename_ocrimage': user.has_perm('ocr.rename_ocrimage'),
                'remove_ocrimage': user.has_perm('ocr.remove_ocrimage'),
                'create_ocrimage': user.has_perm('ocr.create_ocrimage'),
            }
        if type == 'list':
            return {
                'create_ocrimage': user.has_perm('ocr.create_ocrimage'),
                'view_ocrimage': user.has_perm('ocr.view_ocrimage'),
                'upload_from_file': user.has_perm('ocr.upload_from_file'),
                'upload_from_sftp': user.has_perm('ocr.upload_from_sftp'),
                'upload_from_s3': user.has_perm('ocr.upload_from_s3'),
            }

    return {}


class OCRImageRelatedPermission(permissions.BasePermission):
    message = 'Permission for OCR.'

    def has_permission(self, request, view):
        user = request.user

        if request.method in ['GET']:
            return user.has_perm('ocr.view_ocr')

        if request.method in ['POST']:
            data = request.data
            datasource_type = data.get('datasource_type')
            if user.has_perm('ocr.create_ocr') and user.has_perm('ocr.view_ocr'):
                if datasource_type == 'fileUpload':
                    return user.has_perm('ocr.upload_from_file')
                elif datasource_type == 'SFTP':
                    return user.has_perm('ocr.upload_from_sftp')
                elif datasource_type == 'S3':
                    return user.has_perm('ocr.upload_from_s3')
                elif datasource_type is None:
                    return user.has_perm('ocr.upload_from_file')

            return False

        if request.method in ['PUT']:
            data = request.data

            if 'deleted' in data:
                if data['deleted']:
                    return user.has_perm('ocr.remove_ocrimage')

            return user.has_perm('ocr.rename_ocrimage')

