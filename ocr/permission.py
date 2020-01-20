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
        '''
        if request.method in ['PUT']:
            data = request.data
            path = request.path

            if 'meta_data_modifications' in path:
                return user.has_perm('api.data_validation')

            if 'advanced_settings_modification' in path:
                return user.has_perm('api.create_signal')

            if 'subsetting' in data:
                if data['subsetting'] == True:
                    return user.has_perm('api.subsetting_dataset')

            if 'deleted' in data:
                if data['deleted'] == True:
                    return user.has_perm('api.remove_dataset')



            return user.has_perm('api.rename_dataset')
        '''
