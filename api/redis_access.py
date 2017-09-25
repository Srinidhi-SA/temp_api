from django.conf import settings
REDIS_SALT = settings.REDIS_SALT
from django.core.cache import cache

REDIS_TIMEOUT = 60*60


class AccessRedis:

    # def __init__(self, obj=None):
    #     if obj is None:
    #         self.key = None
    #     else:
    #         self.key = self.get_cache_name(obj)

    def get_cache_name(self, object):
        return type(object).__name__ + "_" + str(object.slug) + "_" + REDIS_SALT

    def get_using_obj(self, obj, default_value=list()):
        key = self.get_cache_name(obj)
        data = self.get_using_key(key)
        return data

    def get_using_key(self, key):
        data = cache.get(key)
        return data

    def get_or_set_using_key(self, key, default_value=list()):
        data = cache.get(key)
        if data is None:
            data = default_value
            self.set_using_key(key, data)
        return data

    def set_using_obj(self, obj, value):
        key = self.get_cache_name(obj)
        return self.set_using_key(key, value)

    def set_using_key(self, key, value):
        return cache.set(key, value)

    def delete(self, obj):
        key = self.get_cache_name(obj)
        pass

    def update(self, obj, value):
        key = self.get_cache_name(obj)
        pass

    def append_using_obj(self,  obj, value):
        key = self.get_cache_name(obj)
        data = cache.get(key)
        if isinstance(value, list):
            data  = data + value
        elif isinstance(value, dict):
            data.append(value)

        return cache.set(key, data)

    def append_using_key(self, key, value):
        data = self.get_or_set_using_key(key)
        if isinstance(value, list):
            data = data + value
        elif isinstance(value, dict):
            data.append(value)

        self.set_using_key(key, data)
        return self.get_using_key(key)