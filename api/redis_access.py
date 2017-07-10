from server.settings import REDIS_SALT

REDIS_TIMEOUT = 60*60


def get_cache_name(object, extra="", SALT=REDIS_SALT):
    return type(object).__name__ +  "_" + str(object.id) + "_" + extra + SALT

